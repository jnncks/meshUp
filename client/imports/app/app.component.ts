import { Component, OnInit } from '@angular/core';
import { Router, Route, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Observable } from 'rxjs';

import template from './app.component.html';
import style from './app.component.scss';

@Component({
  selector: 'app',
  template,
  styles: [ style ],

})
export class AppComponent implements OnInit {
  pages: Route[];
  appName: string;

  constructor(
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _titleService: Title) {
      this.pages = this._router.config;
      this.appName = 'meshUp';
  }

  ngOnInit() {
    // set the page title on initilization
    this._titleService.setTitle(this.appName);

    /** update the page title on route changes
     * 
     * taken from https://toddmotto.com/dynamic-page-titles-angular-2-router-events
     */
    this._router.events
      .filter(event => event instanceof NavigationEnd)
      .map(() => this._activatedRoute)
      .map(route => {
        while (route.firstChild) route = route.firstChild;
        return route;
      })
      .filter(route => route.outlet === 'primary')
      .mergeMap(route => route.data)
      .subscribe(routeData => {
        let routeName = routeData.name ? ' | ' + routeData.name : '';
        this._titleService.setTitle(this.appName + routeName);
      });
  }
}
