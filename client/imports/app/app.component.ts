import { Component, OnInit } from '@angular/core';
import { Router, Route } from '@angular/router';

import template from './app.component.html';
import style from './app.component.scss';

@Component({
  selector: 'app',
  template,
  styles: [ style ],

})
export class AppComponent {

  private pages: Route[];
  appName: string;

  constructor(private _router: Router) {
    this.pages = this._router.config;
    this.appName = 'meshUp';
  }
}
