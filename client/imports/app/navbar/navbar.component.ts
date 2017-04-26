import { Component, Input, OnInit } from '@angular/core';
import { Route, ActivatedRoute, Router, NavigationEnd } from '@angular/router';

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
  @Input() pages: Route[];
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
      });
    
    // subscribe to mode changes in the graph view
    this._graphViewService.modeChanged.subscribe(isEditing =>
      this._isEditing = isEditing);
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
  toggleEditing() {
    this._graphViewService.toggleMode();
  }
}
