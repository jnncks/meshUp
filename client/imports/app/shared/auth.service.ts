import { Injectable } from '@angular/core';
import { Meteor } from 'meteor/meteor';
import { MeteorObservable } from 'meteor-rxjs';

@Injectable()
export class AuthService {
  constructor() {
  }
  
  /**
   * Logs the user in via the submitted parameters.
   * 
   * @param  {string} user email or username
   * @param  {string} password
   * @returns Promise
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
   * @returns Promise
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
   * @returns boolean the login state
   */
  isLoggedIn(): boolean {
    return !!Meteor.user();
  }
}