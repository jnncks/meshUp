import { Component, Input } from '@angular/core';

import { ModalService } from '../shared/modal.module';
import { InfoGraphCreationModalComponent } from '../shared/info-graph-creation-modal.component';

import template from './dashboard-new-graph.component.html';
import styleUrl from './dashboard-new-graph.component.scss';

/**
 * A card which allows the creation of a new infoGraph when clicking on it.
 * 
 * @class DashboardNewGraphComponent
 */
@Component({
  selector: 'dashboard-new-graph',
  template,
  styles: [styleUrl]
})
export class DashboardNewGraphComponent {
  label: string;
  @Input() categoryId: string;

  /**
   * Creates an instance of the DashboardNewGraphComponent.
   * 
   * @constructor
   * @param {ModalService} _modalService The ModalService.
   */
  constructor(private _modalService: ModalService) {
    this.label = 'neues Informationsnetz erstellen';
  }

  /**
   * Opens a modal which allows the creation of a new infoGraph.
   * 
   * @method openCreationModal
   */
  openCreationModal(): void {
      this._modalService.create(InfoGraphCreationModalComponent, {
        categoryId: this.categoryId
      });
  }
}