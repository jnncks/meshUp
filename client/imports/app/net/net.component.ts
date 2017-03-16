import { Component, OnInit } from '@angular/core';

import template from './net.component.html';
import style from './net.component.scss';

@Component({
  selector: 'net',
  template,
  styles: [ style ]
})
export class NetComponent implements OnInit {
  title: string;

  constructor() {
    this.title = 'meshUp';
  }

  ngOnInit() {
  }
}
