import { Component, OnInit, Input, Output, OnChanges, SimpleChanges, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { Modal, ModalService } from '../../shared/modal';
import { AuthService } from '../../shared/auth.service';

import template from './menu-panel.component.html';
import styleUrl from './menu-panel.component.scss';

@Component({
  selector: 'menu-panel',
  template,
  styles: [ styleUrl ]
})
export class MenuPanelComponent implements OnInit, OnChanges{
  private LOGOUT_MODAL_ID: string;
  @Input() visible: boolean;
  @Output() clicked: EventEmitter<any>;
  logoutModalMessage: string;

  constructor(
    private _authService: AuthService,
    private _modalService: ModalService,
    private _router: Router) {
      this.clicked = new EventEmitter();
      this.LOGOUT_MODAL_ID = 'logoutModal';
  }

  ngOnInit() {
    this.visible = false;
    this.logoutModalMessage = 'Möchtest du dich wirklich abmelden?'
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.visible)
      this.visible = changes.visible.currentValue;
  }

  /**
   * Opens a confirmation modal to prevent accidental logout actions.
   * 
   * @param  {string} modalId
   */
  openLogoutModal(modalId: string): void {
    this.clicked.emit('close');
    this._modalService.open(modalId)
  }

  /**
   * Closes the logout confirmation modal.
   * 
   * @param  {string} modalId
   */
  closeLogoutModal(modalId: string): void {
    this._modalService.close(modalId)
  }

  /**
   * Closes the logout confirmation modal and starts the logout process via
   * the AuthService. If successfully logged out, navigates to the login page.
   */
  logout(): void {
    this.closeLogoutModal(this.LOGOUT_MODAL_ID)
    this._authService.logout()
      .then(() => {
        this.clicked.emit('close');
        this._router.navigateByUrl('login');
      })
      .catch((e) => {
        this.handleError(e);
      });
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
