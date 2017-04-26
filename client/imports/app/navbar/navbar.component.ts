import { Component, Input, OnInit } from '@angular/core';
import { Route, ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from '../shared/auth.service';
import { GraphViewService } from '../graph-view';

import { InfoGraphMeta } from '../../../../both/models';

import template from './navbar.component.html';
import styleUrl from './navbar.component.scss';

/**
 * Displays the routes as breadcrumbs as well as the user menu.
 * 
 * @implements {OnInit}
 * @class NavBarComponent
 */
@Component({
  selector: 'navbar',
  template,
  styles: [ styleUrl ]
})
export class NavBarComponent implements OnInit{
  public breadcrumbs: {
    url: string,
    name?: string,
    nameAsync?: Observable<string>,
    async?: boolean
  }[];
  private _currentRouteData: Object;
  private _isEditing: boolean = false;

  /**
   * Creates an instance of the NavBarComponent.
   * 
   * @constructor
   * @param {AuthService} _authService 
   * @param {Router} _router 
   * @param {ActivatedRoute} _activatedRoute 
   * @param {GraphViewService} _graphViewService 
   */
  constructor(private _authService: AuthService, private _router: Router, private _activatedRoute: ActivatedRoute, private _graphViewService: GraphViewService) {
    this._isEditing = this._graphViewService.getCurrentMode();
    this._graphViewService.modeChanged.subscribe(isEditing => this._isEditing);
  }

  ngOnInit() {
    // update _currentRouteData after route changes
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
      });
    
    // subscribe to mode changes in the graph view
    this._graphViewService.modeChanged.subscribe(isEditing =>
      this._isEditing = isEditing);

    this.updateBreadcrumbs();
  }

  /**
   * Returns the current login status.
   * 
   * @method isLoggedIn
   * @returns {boolean} The login status.
   */
  isLoggedIn(): boolean {
    return this._authService.isLoggedIn();
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
}
