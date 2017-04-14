import { Component, NgZone, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { MongoObservable } from 'meteor-rxjs'
import { Observable } from 'rxjs';

import template from './profile-button.component.html';
import styleUrl from './profile-button.component.scss';

@Component({
  selector: 'profile-button',
  template,
  styles: [ styleUrl ]
})
export class ProfileButtonComponent implements OnChanges {
  @Input() toggled: boolean;
  autorunComputation: Tracker.Computation;
  user: Meteor.User;
  userId: string;
  isLoggingIn: boolean;
  isLoggedIn: boolean;
  loggedOut: boolean;

  constructor(private _zone: NgZone) {
    this._initAutorun();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.toggled)
      this.toggled = changes.toggled.currentValue;
  }

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

  getUserImage(): string {
    let user: Meteor.User = this.user;

    if (!user)
      return '';

    if (user.profile && user.profile.image)
      return user.profile.image;

    return '';
  }

  _initAutorun() {
    this.autorunComputation = Tracker.autorun(() => {
      this._zone.run(() => {
        this.user = Meteor.user();
        this.userId = Meteor.userId();
        this.isLoggingIn = Meteor.loggingIn();
        this.isLoggedIn = !!Meteor.user();
      })
    });
  }
}
