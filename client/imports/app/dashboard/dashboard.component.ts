import { Component, OnInit } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';

import { MeteorObservable } from 'meteor-rxjs';

import { DashboardService } from './dashboard.service';
import { InfoNetMeta, InfoNetCategory} from '../../../../both/models';

import { InfoNetMetaCollection, InfoNetCategoryCollection } from '../../../../both/collections';

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
  categories: Observable<InfoNetCategory[]>;

  constructor(private _dashboardService: DashboardService) {
    this.title = 'Dashboard';
    this.greeting = 'Hallo und viel Spaß mit meshUp';
    this.user = 'Peter'
  }

  ngOnInit() {
    // get the categories and its contents
    this.categories = this._dashboardService.getInfoNetCategories();
  }   
}
