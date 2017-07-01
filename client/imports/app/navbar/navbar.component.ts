import { Component, Input, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Route, ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Meteor } from 'meteor/meteor';

import { AuthService } from '../shared/auth.service';
import { GraphViewService } from '../graph-view';

import { InfoGraphMeta } from '../../../../both/models';

import template from './navbar.component.html';
import styleUrl from './navbar.component.scss';

/**
 * Displays the routes as breadcrumbs as well as the user menu.
 * 
 * @implements {OnInit}
 * @implements {OnDestroy}
 * @class NavBarComponent
 */
@Component({
  selector: 'navbar',
  template,
  styles: [ styleUrl ]
})
export class NavBarComponent implements OnInit, OnDestroy {
  private _autorunComputation: Tracker.Computation;
  private _user: Meteor.User;
  private _userId: string;
  private _isLoggingIn: boolean;
  private _isLoggedIn: boolean;

  public breadcrumbs: {
    url: string,
    name?: string,
    nameAsync?: Observable<string>,
    async?: boolean
  }[];
  private _currentRouteData: Object;
  private _currentGraphMeta: InfoGraphMeta;
  private _isEditing: boolean = false;
  private _modeChanged: Subscription;

  /**
   * Creates an instance of the NavBarComponent.
   * 
   * @constructor
   * @param {AuthService} _authService 
   * @param {Router} _router 
   * @param {ActivatedRoute} _activatedRoute 
   * @param {GraphViewService} _graphViewService 
   * @param {NgZone} _zone
   */
  constructor(
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _graphViewService: GraphViewService,
    private _zone: NgZone) {
      this._initAutorun();
  }

  ngOnInit() {
    this._userId = Meteor.userId();
    this._isEditing = this._graphViewService.getCurrentMode();

    // update some properties after navigation ends
    this._router.events
      .filter(event => event instanceof NavigationEnd)
      .map(() => this._activatedRoute)
      .map(route => {
        while (route.firstChild) route = route.firstChild;
        return route;
      })
      .filter(route => route.outlet === 'primary')
      .mergeMap(route => route.data)
      .subscribe(routeData => {
        this._currentRouteData = routeData;
        this.updateBreadcrumbs();

        if (routeData.name === 'Graphview')
          this.updateInfoGraphMeta();
      });
    
    // subscribe to mode changes in the graph view
    this._modeChanged = this._graphViewService.modeChanged.subscribe(isEditing =>
      this._isEditing = isEditing);
  }

  /**
   * Handles the destruction of the component.
   * Removes subscriptions.
   * 
   * @method ngOnDestroy
   */
  ngOnDestroy(): void {
    // remove subscriptions to the graphViewService
    this._modeChanged.unsubscribe();
  }

  /**
   * Calls the GraphViewService to toggle between plain viewing and editing.
   * 
   * @method toggleEditing
   */
  toggleEditing(): void {
    this._graphViewService.toggleMode();
  }

  updateBreadcrumbs(): void {
    let currentUrl = this._router.url;
    let breadcrumbs = [];

    if (!Meteor.userId()) {
      breadcrumbs.push({url: '/login', name: 'Login'})
      this.breadcrumbs = breadcrumbs;
      return;
    }

    breadcrumbs.push({ url: '/home', name: 'Home' });

    if (currentUrl.includes('/graph')) {
      breadcrumbs.push({
        url: currentUrl.replace('/edit', '/view'),
        nameAsync: this._graphViewService.getCurrentGraphMeta().map(meta => {
          return meta.name
        }),
        async: true
      });
    }

    if (currentUrl.includes('/graph') && currentUrl.endsWith('/edit'))
      breadcrumbs.push({ url: currentUrl, name: 'bearbeiten' });
    
    this.breadcrumbs = breadcrumbs;
  }

  updateInfoGraphMeta(): void {
    this._graphViewService.getCurrentGraphMeta().subscribe(meta => this._currentGraphMeta = meta);
  }

  /**
   * Populates the private _user object with the user document
   * of the currently logged in user.
   * 
   * @method _initAutorun
   */
  _initAutorun(): void {
    this._autorunComputation = Tracker.autorun(() => {
      this._zone.run(() => {
        this._user = Meteor.user();
        this._userId = Meteor.userId();
        this._isLoggingIn = Meteor.loggingIn();
        this._isLoggedIn = !!Meteor.user();
      })
    });
  }
}
