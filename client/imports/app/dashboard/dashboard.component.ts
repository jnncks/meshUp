import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { DashboardService } from './dashboard.service';

import { InfoNetMeta, InfoNetCategory } from '../../../../both/models';

import {
  InfoNetMetaCollection,
  InfoNetCategoryCollection
} from '../../../../both/collections';

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
    // get the categories and their contents (InfoNetMeta elements)
    this.categories = this._dashboardService.getInfoNetCategories().zone();
  }

  deleteCategory(category: InfoNetCategory): void {
    let number = this._dashboardService.deleteCategory(category);
  }

  deleteNet(infoNet: InfoNetMeta): void {
    let number = this._dashboardService.deleteInfoNet(infoNet);
  }
}
