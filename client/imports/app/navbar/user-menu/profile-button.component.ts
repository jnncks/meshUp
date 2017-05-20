import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { MongoObservable } from 'meteor-rxjs'
import { Observable } from 'rxjs';

import template from './profile-button.component.html';
import styleUrl from './profile-button.component.scss';

/**
 * Displays a button with the user's profile image and name.
 * Toggles the MenuPanel when clicked.
 * 
 * @class ProfileButtonComponent
 * @implements {OnChanges}
 */
@Component({
  selector: 'profile-button',
  template,
  styles: [ styleUrl ]
})
export class ProfileButtonComponent implements OnChanges {
  @Input() toggled: boolean;
  @Input() user: Meteor.User;
  @Input() userId: string;
  @Input() isLoggedIn: boolean;

  /**
   * Creates an instance of the ProfileButtonComponent.
   * 
   * @constructor
   */
  constructor() {
  }

  /**
   * Handles input changes.
   * 
   * @method ngOnChanges
   * @param  {SimpleChanges} changes An event of changed properties.
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes.toggled)
      this.toggled = changes.toggled.currentValue;
  }

  /**
   * Returns the name of the currently logged in user.
   * 
   * @method getUserName
   * @return {string} The name of the currently logged in user.
   */
  getUserName(): string {
    let user: Meteor.User = this.user;

    if (!user)
      return '';

    if (user.profile && user.profile.name)
      return user.profile.name;

    if (user.username)
      return user.username;

    if (user.emails && user.emails[0] && user.emails[0].address)
      return user.emails[0].address;

    return '';
  }

  /**
   * Returns an URL to the profile image of the currently logged in user.
   * 
   * @method getUserImage
   * @returns {string} The URL of the user's profile image.
   */
  getUserImage(): string {
    let user: Meteor.User = this.user;

    if (!user)
      return '';

    if (user.profile && user.profile.image)
      return user.profile.image;

    return '';
  }
}
