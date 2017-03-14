import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { DashboardService } from './dashboard.service';
import { InfoNetMeta } from '../../../../both/models/infonetmeta.model';
import { InfoNetCategory } from '../../../../both/models/infonetcategory.model';

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
  items: Observable<InfoNetMeta[]>;

  constructor(private _dashboardService: DashboardService) {
    this.title = 'Dashboard';
    this.greeting = 'Hallo und viel Spaß mit meshUp';
    this.user = 'Peter'
  }

  ngOnInit() {

    // get the categories
    this.categories = this._dashboardService.getInfoNetCategories().zone();
    
    // TODO
    this.items = this._dashboardService.getInfoNetMetaByCategory(this.categories[0]);


    // fill the categories with data
    /*this.categories.forEach((category) => {
      category.items = this._dashboardService.getInfoNetMetaByCategory(category.name).zone()
    });*/
  }
}
