import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Meteor } from 'meteor/meteor';

import { DashboardService } from './dashboard.service';
import { ModalService } from '../shared/modal.module';

import { InfoGraphSettingsModalComponent } from '../shared/info-graph-settings-modal.component';

import { InfoGraphMeta } from '../../../../both/models';

import template from './dashboard-card.component.html';
import styleUrl from './dashboard-card.component.scss';

@Component({
  selector: 'dashboard-card',
  template,
  styles: [ styleUrl ]
})
export class DashboardCardComponent implements OnChanges {
  user: Meteor.User;
  @Input() infoGraph: InfoGraphMeta;
  tags: string[];

  constructor(private _router: Router, private _dashboardService: DashboardService, private _modalService: ModalService) {
    this.user = Meteor.user();
    this.tags = [];
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.infoGraph && changes.infoGraph.currentValue.tags)
      this.tags = changes.infoGraph.currentValue.tags.slice(0,5);
  }

  deleteGraph(infoGraph: InfoGraphMeta): void {
    let number = this._dashboardService.deleteInfoGraph(infoGraph);
  }

  viewGraph(infoGraph: InfoGraphMeta = this.infoGraph): void {
    this._router.navigate(['/graph', infoGraph._id]);
  }

  /**
   * Opens a confirmation modal to prevent accidental logout actions.
   */
  openSettingsModal(infoGraph: InfoGraphMeta): void {
    this._modalService.create(InfoGraphSettingsModalComponent, {
      infoGraph: infoGraph
    });
  }

  getUserName(userId: string) {
    if (!userId)
      return;

    return this._dashboardService.getUserName(userId);
  }

  toggleMoreTags() {
    if (this.tags.length < this.infoGraph.tags.length) {
      this.tags = this.infoGraph.tags; // insert all tags
    } else {
      this.tags = this.tags.slice(0,5); // keep only the first 5 tags
    }
  }
}
