import { Injectable } from '@angular/core';
import { Meteor } from 'meteor/meteor';
import { MeteorObservable } from 'meteor-rxjs';

/**
 * Provides login and logout methods as well as the current login status.
 * 
 * @class AuthService
 */
@Injectable()
export class AuthService {

  /**
   * Creates an instance of the AuthService.
   * 
   * @constructor
   */
  constructor() {
  }
  
  /**
   * Logs the user in via the submitted parameters.
   * 
   * @method login
   * @param  {string} user The user's email address or username.
   * @param  {string} password The user's password.
   * @return Promise<void>
   */
  login(user: string, password: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      Meteor.loginWithPassword(user, password, (e: Error) => {
        if (e) {
          return reject(e);
        }

        resolve();
      });
    });
  }

  /**
   * Logs the user out.
   * 
   * @method logout
   * @return Promise<void>
   */
  logout(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      Meteor.logout((e: Error) => {
        if (e) {
          return reject(e);
        }

        resolve();
      });
    });
  }

  /**
   * Checks whether the user is currently logged in.
   * 
   * @return boolean The login state of the user.
   */
  isLoggedIn(): boolean {
    return !!Meteor.user();
  }
}