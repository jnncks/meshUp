import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { Meteor } from 'meteor/meteor';

import { InfoGraphCategory } from '../../../../both/models';

import template from './dashboard-category.component.html';
import styleUrl from './dashboard-category.component.scss';


/**
 * A container for multiple DashboardCardComponents.
 * 
 * @class DashboardCategoryComponent
 */
@Component({
  selector: 'dashboard-category',
  template,
  styles: [ styleUrl ]
})
export class DashboardCategoryComponent {
  user: Meteor.User;
  @Input() category: InfoGraphCategory;

  /**
   * Creates an instance of the DashboardCategoryComponent.
   * 
   * @constructor
   */
  constructor() {
    this.user = Meteor.user();
  }
}
