import { Component, Input, OnInit } from '@angular/core';

import { ModalService } from './modal.service';

import template from './modal.component.html';
import style from './modal.component.scss';

@Component({
  selector: 'modal',
  template,
  styles: [ style ],
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