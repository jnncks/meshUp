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

/**
 * Displays the meta information of an infoGraph, e.g. its title, description
 * and tags as well as the author's name and date and time of the last update.
 * 
 * @class DashboardCardComponent
 * @implements {OnChanges}
 */
@Component({
  selector: 'dashboard-card',
  template,
  styles: [ styleUrl ]
})
export class DashboardCardComponent implements OnChanges {
  user: Meteor.User;
  @Input() infoGraph: InfoGraphMeta;
  tags: string[];

  /**
   * @constructor 
   * @param  {Router} _router The Router.
   * @param  {DashoardService} _dashboardService The DashboardService.
   * @param  {ModalService} _modalService The ModalService.
  */
  constructor(private _router: Router, private _dashboardService: DashboardService, private _modalService: ModalService) {
    this.user = Meteor.user();
    this.tags = [];
  }
  /**
   * Handles changes of the infoGraph input.
   * 
   * @method ngOnChanges
   * @param  {SimpleChanges} changes An event of changed properties.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.infoGraph && changes.infoGraph.currentValue.tags)
      this.tags = changes.infoGraph.currentValue.tags.slice(0,5);
  }

  /**
   * Removes the infoGraph from the collections.
   * 
   * @method deleteGraph
   * @param  {InfoGraphMeta} infoGraph The infoGraph to delete.
   */
  deleteGraph(infoGraph: InfoGraphMeta): void {
    let number = this._dashboardService.deleteInfoGraph(infoGraph);
  }

  /**
   * Navigates to the the graphView of the infoGraph of the card.
   * 
   * @method viewGraph
   * @param  {InfoGraphMeta} infoGraph The infoGraph to display in the graphView.
   */
  viewGraph(infoGraph: InfoGraphMeta = this.infoGraph): void {
    this._router.navigate(['/graph', infoGraph._id]);
  }

  /**
   * Opens a confirmation modal to prevent accidental logout actions.
   * 
   * @method openSettingsModal
   * @param  {InfoGraphMeta} infoGraph The infoGraphMeta that will be edited.
   */
  openSettingsModal(infoGraph: InfoGraphMeta): void {
    this._modalService.create(InfoGraphSettingsModalComponent, {
      infoGraph: infoGraph
    });
  }

  /**
   * Returns an Observable of the name of the user whose ID has been passed
   * to this method.
   * 
   * @method getUserName
   * @param  {string} userId The ID of the user whose name will be returned. 
   * @return {Observable<string>}
   */
  getUserName(userId: string): Observable<string> {
    if (!userId)
      return;

    return this._dashboardService.getUserName(userId);
  }

  /**
   * Toggles the amount of displayed tags between a maximum of 5 tags and all
   * tags of the infoGraphMeta.
   * 
   * @method getUserName
   */
  toggleMoreTags(): void {
    if (this.tags.length < this.infoGraph.tags.length) {
      this.tags = this.infoGraph.tags; // insert all tags
    } else {
      this.tags = this.tags.slice(0,5); // keep only the first 5 tags
    }
  }
}
