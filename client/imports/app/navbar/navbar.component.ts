import { Component, Input } from '@angular/core';
import { Route } from '@angular/router';

import { AuthService } from '../shared/auth.service';

import template from './navbar.component.html';
import styleUrl from './navbar.component.scss';

/**
 * Displays the routes as breadcrumbs as well as the user menu.
 * 
 * @class NavBarComponent
 */
@Component({
  selector: 'navbar',
  template,
  styles: [ styleUrl ]
})
export class NavBarComponent{
  @Input() pages: Route[];

  /**
   * Creates an instance of the NavBarComponent.
   * 
   * @constructor
   * @param {AuthService} _authService The AuthService.
   * 
   * @memberOf NavBarComponent
   */
  constructor(private _authService: AuthService) {
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
}
