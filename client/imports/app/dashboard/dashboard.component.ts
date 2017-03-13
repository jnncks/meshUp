import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { DashboardService } from './dashboard.service';
import { Demo } from '../../../../both/models/demo.model';

import template from './dashboard.component.html';
import style from './dashboard.component.scss';

@Component({
  selector: 'dashboard',
  template,
  styles: [ style ]
})
export class DashboardComponent implements OnInit {
  title: string;
  greeting: string;
  user: string;
  categories: Object[];

  constructor(private _dashboardService: DashboardService) {
    this.title = 'Dashboard';
    this.greeting = 'Hallo und viel Spaß mit meshUp';
    this.user = 'Peter'
  }

  ngOnInit() {
    this.categories = this._dashboardService.getCategories();
  }
}
