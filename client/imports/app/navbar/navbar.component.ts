import { Component, Input } from '@angular/core';
import { Route } from '@angular/router';

import { AuthService } from '../shared/auth.service';

import template from './navbar.component.html';
import styleUrl from './navbar.component.scss';

@Component({
  selector: 'navbar',
  template,
  styles: [ styleUrl ]
})
export class NavBarComponent{
  @Input() pages: Route[];

  constructor(private _authService: AuthService) {
  }

  isLoggedIn(): boolean {
    return this._authService.isLoggedIn();
  }
}
