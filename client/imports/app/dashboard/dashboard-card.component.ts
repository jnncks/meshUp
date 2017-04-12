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
export class DashboardCardComponent implements OnChanges {
  user: Meteor.User;
  @Input() infoNet: InfoNetMeta;
  tags: string[];

  constructor(private _router: Router, private _dashboardService: DashboardService) {
    this.user = Meteor.user();
    this.tags = [];
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.infoNet && changes.infoNet.currentValue.tags)
      this.tags = changes.infoNet.currentValue.tags.slice(0,5);
  }

  deleteNet(infoNet: InfoNetMeta): void {
    let number = this._dashboardService.deleteInfoNet(infoNet);
  }

  viewNet(infoNet: InfoNetMeta = this.infoNet): void {
    this._router.navigate(['/net', infoNet._id]);
  }

  getUserName(userId: string) {
    if (!userId)
      return;

    return this._dashboardService.getUserName(userId);
  }

  toggleMoreTags() {
    if (this.tags.length < this.infoNet.tags.length) {
      this.tags = this.infoNet.tags; // insert all tags
    } else {
      this.tags = this.tags.slice(0,5); // keep only the first 5 tags
    }
  }
}
