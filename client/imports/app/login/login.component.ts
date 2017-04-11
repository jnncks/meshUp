import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Meteor } from 'meteor/meteor';

import { AuthService } from '../shared/auth.service';

import template from './login.component.html';
import styleUrl from './login.component.scss';

/**
 * Displays an login form and navigates to the home page when the user is
 * is logged.
 */
@Component({
  template,
  styles: [ styleUrl ]
})
export class LoginComponent implements OnInit {
  public welcomeTitle: string;
  public welcomeMessage: string;
  public user: string;
  public password: string;

  constructor(private _authService: AuthService, private _router: Router) {
  }

  ngOnInit() {
    // navigate to the homepage if the user is already logged in
    if (Meteor.user()) {
      this._router.navigateByUrl('home');
    }

    // intialize the welcome texts
    this.welcomeTitle = 'Willkommen bei meshUp!';
    this.welcomeMessage = 'Du bist derzeit nicht angemeldet. Melde dich an!';

    // intialize the form fiels
    this.user = '';
    this.password = '';
  }

  /**
   * Logs the user in via the form data using the AuthService.
   * If successfully logged in, navigates to the home page.
   * 
   * @param  {string} user the username or email
   * @param  {string} password the user's password
   */
  login(user: string = this.user, password: string = this.password): void {
    this._authService.login(user, password)
      .then(() => {
        this._router.navigateByUrl('home');
      })
      .catch((e) => {
        this.handleError(e);
      });
  }

  /**
   * Handles errors (currently by logging them to the console).
   * 
   * @param  {Error} e
   */
  handleError(e: Error): void {
    console.error(e);
  }
}