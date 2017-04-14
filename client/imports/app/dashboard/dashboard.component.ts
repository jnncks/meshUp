import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Meteor } from 'meteor/meteor';

import { DashboardService } from './dashboard.service';

import { InfoGraphMeta, InfoGraphCategory } from '../../../../both/models';

import {
  InfoGraphMetaCollection,
  InfoGraphCategoryCollection
} from '../../../../both/collections';

import template from './dashboard.component.html';
import styleUrl from './dashboard.component.scss';

@Component({
  selector: 'dashboard',
  template,
  styles: [ styleUrl ]
})
export class DashboardComponent implements OnInit {
  title: string;
  greeting: string;
  user: Meteor.User;
  categories: Observable<InfoGraphCategory[]>;

  constructor(private _router: Router, private _dashboardService: DashboardService) {
    this.title = 'Home';
    this.greeting = 'Hallo und viel Spaß mit meshUp';
    this.user = Meteor.user();
  }

  ngOnInit() {
    // get the categories and their contents (InfoGraphMeta elements)
    this.categories = this._dashboardService.getInfoGraphCategories().zone();
  }

  deleteCategory(category: InfoGraphCategory): void {
    let number = this._dashboardService.deleteCategory(category);
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
}
