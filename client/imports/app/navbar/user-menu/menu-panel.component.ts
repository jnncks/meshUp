import { Component, Input, Output, OnChanges, SimpleChanges, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../shared/auth.service';

import template from './menu-panel.component.html';
import style from './menu-panel.component.scss';

@Component({
  selector: 'menu-panel',
  template,
  styles: [ style ]
})
export class MenuPanelComponent implements OnChanges{
  @Input() visible: boolean;
  @Output() clicked: EventEmitter<any>;

  constructor(private _authService: AuthService, private _router: Router) {
    this.visible = false;
    this.clicked = new EventEmitter();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.visible)
      this.visible = changes.visible.currentValue;
  }

  /**
   * Logs the user out via the AuthService.
   * If successfully logged out, navigates to the login page.
   */
  logout(): void {
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
