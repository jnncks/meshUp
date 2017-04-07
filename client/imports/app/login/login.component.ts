import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthenticationService } from '../shared/authentication.service';

import template from './login.component.html';
import style from './login.component.scss';

@Component({
  template,
  styles: [style]
})
export class LoginComponent implements OnInit {
  public user: string;
  public password: string;

  constructor(private _authenticationService: AuthenticationService, private _router: Router) {
  }

  ngOnInit() {
    this.user = '';
    this.password = '';
  }

  login(user: string = this.user, password: string = this.password): void {
    this._authenticationService.login(user, password)
      .then(() => {
        this._router.navigateByUrl('home');
      })
      .catch((e) => {
        this.handleError(e);
      });
  }

  handleError(e: Error): void {
    console.error(e);
  }
}