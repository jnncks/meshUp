import { Component } from '@angular/core';
import { trigger, state, style, animate, transition, keyframes} from '@angular/core';
import { Router } from '@angular/router';

import { Modal } from '../../shared/modal.module';
import { AuthService } from '../../shared/auth.service';

import template from './logout-modal.component.html';
import styleUrl from './logout-modal.component.scss';

@Component({
  selector: 'logout-modal',
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
export class LogoutModalComponent {
  destroy: Function;
  closeModal: Function;

  hide: boolean = false;
  modalTitle: string;
  modalMessage: string;

  constructor(private _authService: AuthService, private _router: Router) {
    this.modalTitle = 'Abmelden'
    this.modalMessage = 'Möchtest du dich wirklich abmelden?'
  }

  logout() {
    this._authService.logout()
      .then(() => {
        this._router.navigateByUrl('login');
        this.hideModal();
      })
      .catch((e) => {
        this.handleError(e);
      });
  }

  cancel(): void{
    this.hideModal();
  }

  hideModal() {
    this.hide = true;
    setTimeout(() => {
      this.closeModal();
      this.destroy();
    }, 300);
  }


  /**
   * Handles errors (currently by logging them to the console).
   * 
   * @param  {Error} e
   */
  handleError(e: Error): void {
    console.error(e);
  }
}