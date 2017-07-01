import { Component, OnDestroy } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  keyframes
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import { GraphViewService } from './graph-view.service';
import { ModalService } from '../shared/modal.module';
import {
  InfoGraphSettingsModalComponent
} from '../shared/info-graph-settings-modal.component';

import {
  InfoGraph,
  InfoGraphMeta
} from '../../../../both/models';

import template from './graph-toolbar.component.html';
import styleUrl from './graph-toolbar.component.scss';

/**
 * A toolbar for editing graphs.
 * 
 * @class GraphToolbarComponent
 * @implements {OnDestroy}
 */
@Component({
  selector: 'graph-toolbar',
  template,
  styles: [ styleUrl ],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        animate('0.125s ease-in', keyframes([
          style({height: 0}),
          style({height: '*'})
        ]))
      ]),
      transition(':leave', [
        animate('0.125s ease-out', keyframes([
          style({height: '*'}),
          style({height: 0})
        ]))
      ])
    ])
  ],
  host: {
    '[@slideInOut]': 'true',
    'style': 'display: block; overflow: hidden;'
  }
})
export class GraphToolbarComponent implements OnDestroy {
  private _isAddingNode = false;
  private _nodeAddingChanged: Subscription

  /**
   * Creates an instance of the GraphToolbarComponent.
   * 
   * @param {GraphViewService} _graphViewService The GraphViewService.
   */
  constructor(private _graphViewService: GraphViewService, private _modalService: ModalService) {
    this._nodeAddingChanged = _graphViewService.nodeAddingChanged
      .subscribe(state => this._isAddingNode = state);
  }

  /**
   * Handles the destruction of the component.
   * Removes subscriptions.
   * 
   * @method ngOnDestroy
   */
  ngOnDestroy(): void {
    // remove subscriptions to the graphViewService
    this._nodeAddingChanged.unsubscribe();
  }

  /**
   * Opens the settings modal of the current infoGraph within the graphView.
   * 
   * @method openSettings
   */
  openSettings() {
    // get the current infoGraphMeta
    this._graphViewService.getCurrentGraphMeta()
      .first(graphMeta => graphMeta !== undefined)
      .subscribe((graphMeta: InfoGraphMeta) => {
        // create the modal with the current infoGraphMeta
        this._modalService.create(InfoGraphSettingsModalComponent, {
          infoGraph: graphMeta
        });
    });
  }

  toggleNodeAdding() {
    this._graphViewService.toggleNodeAdding();
  }
}
