import { Component, OnInit, Input, Inject } from '@angular/core';
import { trigger, state, style, animate, transition, keyframes } from '@angular/core';

import { GraphViewService, NodeEditModalComponent } from './index';

import { Modal, ModalService } from '../shared/modal.module';

import { Node } from '../../../../both/models';

import template from './node-removal-confirm-modal.component.html';
import styleUrl from './node-removal-confirm-modal.component.scss';

/**
 * A modal for confirming whether the user really want's
 * to remove the particular node.
 * 
 * @class NodeRemovalConfirmModalComponent
 * @implements OnInit
 */
@Component({
  selector: 'node-removal-confirm-modal',
  template,
  styles: [styleUrl],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        animate('0.125s ease', keyframes([
          style({opacity: 0}),
          style({opacity: 1})
        ]))
      ]),
      transition(':leave', [
        animate('0.125s ease', keyframes([
          style({opacity: 1}),
          style({opacity: 0})
        ]))
      ])
    ])
  ]
})
@Modal()
export class NodeRemovalConfirmModalComponent implements OnInit {
  // properties inherited from the ModalContainer
  destroy: Function;
  closeModal: Function;
  hidden: boolean;

  // custom properties
  @Input() node: Node;
  private _modalTitle: string;
  private _modalMessage: string;
  
  /**
   * Creates an instance of the NodeEditModalComponent.
   * 
   * @constructor
   * @param {GraphViewService} _graphViewService The GraphViewService.
   * @param {ModalService} _modalService The ModalService.
   */
  constructor(private _graphViewService: GraphViewService, private _modalService: ModalService) {
    this._modalTitle = 'Inhalt löschen';
  }

  ngOnInit() {
    this._modalMessage = `Achtung, möchtest du den Inhalt
      <strong>${this.node.title}</strong>
      und seine Verknüpfungen zu anderen Inhalten wirklich löschen?
      Er ist danach nicht mehr verfügbar!`;
  }

  /**
   * Removes the node and all related edges
   * and closes the modal.
   * 
   * @method remove
   */
  remove(): void {
    this._graphViewService.removeInfoGraphNode(this.node);
    this.closeModal();
  }

  /**
   * Closes the modal and reopens the edit modal.
   * 
   * @method close
   * @param  {Event} event
   */
  cancel(event: Event): void {
    if (event && event.target && event.target['id'] !== 'nodeEditModal') {
      return;
    }

    this._modalService.create(NodeEditModalComponent, {
      node: this.node
    });
    
    this.closeModal();
  }
}