import { Component } from '@angular/core';
import { trigger, state, style, animate, transition, keyframes} from '@angular/core';
import { Router } from '@angular/router';

import { Modal } from '../../shared/modal.module';
import { AuthService } from '../../shared/auth.service';

import template from './logout-modal.component.html';
import styleUrl from './logout-modal.component.scss';

/**
 * A confirmation modal which may log out the user, depending on their decision.
 * 
 * @class LogoutModalComponent
 */
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
  closeModal: Function;
  hidden: boolean;

  modalTitle: string;
  modalMessage: string;

  /**
   * Creates an instance of the LogoutModalComponent.
   * 
   * @constructor
   * @param {AuthService} _authService The AuthService.
   * @param {Router} _router The Router.
   */
  constructor(private _authService: AuthService, private _router: Router) {
    this.modalTitle = 'Abmelden'
    this.modalMessage = 'Möchtest du dich wirklich abmelden?'
  }

  /**
   * Logs out the user and closes the modal subsequently.
   * 
   * @method logout
   */
  logout(): void {
    this._authService.logout()
      .then(() => {
        this._router.navigateByUrl('login');
        this.closeModal();
      })
      .catch((e) => {
        this.handleError(e);
      });
  }

  /**
   * Closes the modal without logging out the user.
   * 
   * @method cancel
   * @param {Event} event 
   */
  cancel(event: Event): void {
    if (event && event.srcElement.id !== 'logoutModal')
      return;

    this.closeModal();
  }

  /**
   * Handles errors (currently by logging them to the console).
   * 
   * @method handleError
   * @param  {Error} e The error to handle.
   */
  handleError(e: Error): void {
    console.error(e);
  }
}