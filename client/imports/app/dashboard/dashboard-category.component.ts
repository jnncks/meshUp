import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Meteor } from 'meteor/meteor';

import { DashboardService } from './dashboard.service';

import { InfoGraphCategory } from '../../../../both/models';

import template from './dashboard-category.component.html';
import styleUrl from './dashboard-category.component.scss';

@Component({
  selector: 'dashboard-category',
  template,
  styles: [ styleUrl ]
})
export class DashboardCategoryComponent {
  user: Meteor.User;
  @Input() category: InfoGraphCategory;

  constructor(private _router: Router, private _dashboardService: DashboardService) {
    this.user = Meteor.user();
  }
}
