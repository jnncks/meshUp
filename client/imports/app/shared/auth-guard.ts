import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Prevents navigation if the user is not logged in.
 * 
 * @class AuthGuard
 * @implements {CanActivate}
 */
@Injectable()
export class AuthGuard implements CanActivate {

  /**
   * Creates an instance of the AuthGuard.
   * 
   * @constructor
   * @param {Router} _router The Router.
   * @param {AuthService} _authService The AuthService.
   */
  constructor(private _router: Router, private _authService: AuthService) {}

  /**
   * Prevents route access if the user is not authorized.
   * 
   * @method canActivate
   * @return {boolean} Whether the requested route can be accessed.
   */
  canActivate(): boolean {
    let isLoggedIn = this._authService.isLoggedIn();

    if (isLoggedIn) {
      // logged in so allow the navigation
      return true;
    }

     // not logged in so redirect to the login page
    this._router.navigateByUrl('login');
    return false;
  }
}