import { Component, OnInit, Input, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { trigger, state, style, animate, transition, keyframes } from '@angular/core';

import { GraphViewService, NodeRemovalConfirmModalComponent } from './index';

import { Modal, ModalService } from '../shared/modal.module';
import { InfoGraph, Node } from '../../../../both/models';

import template from './node-edit-modal.component.html';
import styleUrl from './node-edit-modal.component.scss';

/**
 * A modal which allows editing of a node's content.
 * 
 * @class NodeEditModalComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'node-edit-modal',
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
export class NodeEditModalComponent implements OnInit{
  // properties inherited from the ModalContainer
  destroy: Function;
  closeModal: Function;
  hidden: boolean;

  // custom properties
  @Input() node: Node;
  modalTitle: string;
  nodeForm: FormGroup;
  
  /**
   * Creates an instance of the NodeEditModalComponent.
   * 
   * @constructor
   * @param {FormBuilder} fb The FormBuilder.
   */
  constructor(@Inject(FormBuilder) fb: FormBuilder,
    private _graphViewService: GraphViewService,
    private _modalService: ModalService) {
      this.modalTitle = 'Inhalt bearbeiten';

      // set up the form group
      this.nodeForm = fb.group({
        title: ['', Validators.required],
        content: ['', Validators.required],
        tags: ''
      });
  }

  /**
   * Called when the component is initialized.
   * Populates the input fields with the node data passed to the input.
   * 
   * @method ngOnInit
   */
  ngOnInit(): void {
    this.nodeForm.patchValue({
      title: this.node.title,
      content: this.node.content
    });

    if (this.node.tags) {
      this.nodeForm.patchValue({
        tags: this.node.tags.join(', ')
      });
    }
  }

  /**
   * Saves the content and closes the modal.
   * 
   * @method close
   */
  save(): void {
    if (this.nodeForm.dirty) {
      let nodeUpdate: Node = {
        ...this.node,
        title: this.nodeForm.get('title').value.trim(),
        content: this.nodeForm.get('content').value.trim(),
        tags: this.nodeForm.get('tags').value.split(',')
                .map((tag) => tag.trim()),
        lastUpdated: new Date()
      }

      this._graphViewService.updateInfoGraphNode(nodeUpdate);
    }

    this.closeModal();
  }

  /**
   * Removes the node and all related edges.
   * 
   * @method remove
   */
  remove(): void {
    this._modalService.create(NodeRemovalConfirmModalComponent, {
      node: this.node
    });

    this.closeModal();
  }

  /**
   * Closes the modal.
   * 
   * @method close
   * @param  {Event} event
   */
  cancel(event: Event): void {
    if (event && event.target && event.target['id'] !== 'nodeEditModal') {
      return;
    } else if (event && event.target && event.target['id'] === 'nodeEditModal' &&
      this.nodeForm.dirty) {
        return;
    }

    this.closeModal();
  }
}