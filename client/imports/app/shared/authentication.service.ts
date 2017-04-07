import { Injectable } from '@angular/core';
import { Meteor } from 'meteor/meteor';
import { MeteorObservable } from 'meteor-rxjs';

@Injectable()
export class AuthenticationService {
  constructor() {
  }
  
  /**
   * Login...
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
   * Logout...
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
}