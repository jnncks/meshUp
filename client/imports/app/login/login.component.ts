import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Meteor } from 'meteor/meteor';

import { AuthService } from '../shared/auth.service';

import template from './login.component.html';
import styleUrl from './login.component.scss';

/**
 * 
 */
/**
 * Displays an login form and navigates to the home page when the user is
 * is logged.
 * 
 * @class LoginComponent
 * @implements {OnInit}
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
  public errorMessage: string;

  /**
   * Creates an instance of the LoginComponent.
   * 
   * @constructor
   * @param {AuthService} _authService The AuthService.
   * @param {Router} _router The Router.
   */
  constructor(private _authService: AuthService, private _router: Router) {
  }

  /**
   * Called when the component is initialized.
   * Navigates to the dashboard if the user is logged in.
   * Otherwise, sets up the different fields.
   * 
   * @method ngOnInit
   */
  ngOnInit(): void {
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
    this.errorMessage = '';
  }

  formStateChanged(event: Event) {
    if (this.errorMessage)
      this.errorMessage = '';
  }

  /**
   * Logs the user in via the form data using the AuthService.
   * If successfully logged in, navigates to the home page.
   * 
   * @method login
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
   * Handles errors.
   * 
   * @method handleError
   * @param  {Error} e The error to handle.
   */
  handleError(e: Meteor.Error): void {
    if (e.error === 403) {
      this.errorMessage = `Benutzername und Passwort passen nicht zusammen.
                    Bitte überprüfe, ob du beides korrekt eingegeben hast!`;
    }
  }
}