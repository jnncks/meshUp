import { Injectable } from '@angular/core';

import { Modal } from './modal.component';

/**
 * A service for handling generic modals.
 */
@Injectable()
export class ModalService {
  private _modals: Array <Modal> ;

  constructor() {
    this._modals = [];
  }

  registerModal(newModal: Modal): void {
    let modal = this.findModal(newModal.modalId);

    // delete an similar modal if it exists
    if (modal) {
      this._modals.splice(this._modals.indexOf(modal));
    }

    this._modals.push(newModal);
  }

  open(modalId: string): void {
    let modal = this.findModal(modalId);

    if (modal) {
      modal.isOpen = true;
    }
  }

  close(modalId: string, checkBlocking = false): void {
    let modal = this.findModal(modalId);

    if (modal) {
      if (checkBlocking && modal.blocking) {
        return;
      }

      modal.isOpen = false;
    }
  }

  private findModal(modalId: string): Modal {
    for (let modal of this._modals) {
      if (modal.modalId === modalId) {
        return modal;
      }
    }

    return null;
  }
}