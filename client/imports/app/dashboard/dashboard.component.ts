import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Meteor } from 'meteor/meteor';

import { DashboardService } from './dashboard.service';

import { InfoGraphMeta, InfoGraphCategory } from '../../../../both/models';

import template from './dashboard.component.html';
import styleUrl from './dashboard.component.scss';

/**
 * Groups the infoGraphs the user has access to in categories.
 * 
 * @class DashboardComponent
 * @implements {OnInit}
 */
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

  /**
   * Creates an instance of the DashboardComponent.
   * 
   * @param {Router} _router The Router.
   * @param {DashboardService} _dashboardService The DashboardService.
   */
  constructor(private _router: Router, private _dashboardService: DashboardService) {
    this.title = 'Home';
    this.greeting = 'Hallo und viel Spaß mit meshUp';
    this.user = Meteor.user();
  }

  /**
   * Called when the component is initialized.
   * Populates the categories with data from the server.
   * 
   * @method ngOnInit
   */
  ngOnInit(): void {
    // get the categories and their contents (InfoGraphMeta elements)
    this.categories = this._dashboardService.getInfoGraphCategories().zone();
  }

  /**
   * Deletes the supplied category.
   * 
   * @method deleteCategory
   * @param {InfoGraphCategory} category The category to delete.
   */
  deleteCategory(category: InfoGraphCategory): void {
    // TODO: handle the removal properly, e.g. change the category of
    // the affected infoGraphMeta documents.
    this._dashboardService.deleteCategory(category);
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
}
