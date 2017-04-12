import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Meteor } from 'meteor/meteor';

import { DashboardService } from './dashboard.service';

import { InfoNetMeta } from '../../../../both/models';

import {
  InfoNetMetaCollection
} from '../../../../both/collections';

import template from './dashboard-card.component.html';
import styleUrl from './dashboard-card.component.scss';

@Component({
  selector: 'dashboard-card',
  template,
  styles: [ styleUrl ]
})
export class DashboardCardComponent {
  user: Meteor.User;
  @Input() infoNet: InfoNetMeta;

  constructor(private _router: Router, private _dashboardService: DashboardService) {
    this.user = Meteor.user();
  }

  deleteNet(infoNet: InfoNetMeta): void {
    let number = this._dashboardService.deleteInfoNet(infoNet);
  }

  viewNet(infoNet: InfoNetMeta = this.infoNet): void {
    this._router.navigate(['/net', infoNet._id]);
  }
}
