import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { DashboardService } from './dashboard.service';
import { InfoNetMeta, InfoNetCategory} from '../../../../both/models';

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
  items;

  constructor(private _dashboardService: DashboardService) {
    this.title = 'Dashboard';
    this.greeting = 'Hallo und viel Spaß mit meshUp';
    this.user = 'Peter'
  }

  ngOnInit() {

    // get the categories
    this.categories = this._dashboardService.getInfoNetCategories();

    let map = this.categories.map(categoryArray => {
      return categoryArray
    })

    console.log(map)
    
    // fill the categories with data
    let test = this.categories.subscribe(() => {
      this.categories.take(2).forEach(categories => {
        categories.forEach(category => {
          return this._dashboardService.getInfoNetMetaByCategory(category)
        })
      })
    });
  }
}
