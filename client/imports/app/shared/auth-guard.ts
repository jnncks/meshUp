import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Prevents navigation if the user is not logged in.
 */
@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private _router: Router, private _authService: AuthService) {}

  canActivate() {
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