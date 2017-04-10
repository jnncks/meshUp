import { Component, Input, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition, keyframes} from '@angular/core';

import { ModalService } from './modal.service';

import template from './modal.component.html';
import styleUrl from './modal.component.scss';

@Component({
  selector: 'modal',
  template,
  styles: [ styleUrl ],
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
  ],
  host: { '(document:keyup)': 'keyup($event)' }
})
export class Modal implements OnInit {
  @Input('modal-id') modalId: string;
  @Input('modal-title') modalTitle: string;
  @Input() blocking: boolean = false;
  isOpen: boolean = false;

  constructor(private _modalService: ModalService) {
  }

  ngOnInit() {
    this._modalService.registerModal(this);
  }

  private close(checkBlocking = false): void {
    this._modalService.close(this.modalId, checkBlocking);
  }

  private keyup(event: KeyboardEvent): void {
    if (event.keyCode === 27) {
      this._modalService.close(this.modalId, true);
    }
  }
}