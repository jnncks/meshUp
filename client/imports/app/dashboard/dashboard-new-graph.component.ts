import { Component, Input } from '@angular/core';

import { ModalService } from '../shared/modal.module';
import { InfoGraphCreationModalComponent } from '../shared/info-graph-creation-modal.component';

import template from './dashboard-new-graph.component.html';
import styleUrl from './dashboard-new-graph.component.scss';

@Component({
  selector: 'dashboard-new-graph',
  template,
  styles: [styleUrl]
})

export class DashboardNewGraphComponent {
  label: string;
  @Input() categoryId: string;

  constructor(private _modalService: ModalService) {
    this.label = 'neues Informationsnetz erstellen';
  }

  openCreationModal(): void {
      this._modalService.create(InfoGraphCreationModalComponent, {
        categoryId: this.categoryId
      });
  }
}