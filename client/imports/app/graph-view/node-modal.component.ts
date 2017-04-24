import { Component, OnInit, Input } from '@angular/core';
import { trigger, state, style, animate, transition, keyframes} from '@angular/core';

import { Modal } from '../shared/modal.module';
import { Node } from '../../../../both/models';

import template from './node-modal.component.html';
import styleUrl from './node-modal.component.scss';

/**
 * A modal which displays the content of a node in detail.
 * 
 * @class NodeModalComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'node-modal',
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
export class NodeModalComponent implements OnInit{
  // properties inherited from the ModalContainer
  destroy: Function;
  closeModal: Function;
  hidden: boolean;

  // custom properties
  @Input() node: Node;
  
  /**
   * Creates an instance of the NodeModalComponent.
   * 
   * @constructor
   */
  constructor() {
  }

  /**
   * Called when the component is initialized.
   * 
   * @method ngOnInit
   */
  ngOnInit(): void {
    // TODO: get the creator's name
  }

  /**
   * Closes the modal.
   * 
   * @method close
   */
  close(event: Event): void {
    if (event && event.target && event.target['id'] !== 'nodeModal')
      return;

    this.closeModal();
  }
}