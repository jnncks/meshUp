import { Component, OnInit, Input, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { trigger, state, style, animate, transition, keyframes} from '@angular/core';

import { Modal } from '../shared/modal.module';
import { Node } from '../../../../both/models';

import template from './node-edit-modal.component.html';
import styleUrl from './node-edit-modal.component.scss';

/**
 * A modal which displays the content of a node in detail.
 * 
 * @class NodeModalComponent
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
   * Creates an instance of the NodeModalComponent.
   * 
   * @constructor
   * @param {FormBuilder} fb The FormBuilder.
   */
  constructor(@Inject(FormBuilder) fb: FormBuilder) {
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
   * @param  {Event} event
   */
  save(event: Event): void {
    // TODO
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