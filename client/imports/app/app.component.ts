import { Component, OnInit } from '@angular/core';
import { Router, Route, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Observable } from 'rxjs';

import { ModalPlaceholderComponent } from './shared/modal.module';

import template from './app.component.html';
import styleUrl from './app.component.scss';

/**
 * The app.
 * 
 * @class AppComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app',
  template,
  styles: [ styleUrl ]
})
export class AppComponent implements OnInit {
  appName: string;

  /**
   * Creates an instance of AppComponent.
   * 
   * @constructor
   * @param {Router} _router The Router
   * @param {ActivatedRoute} _activatedRoute The ActivatedRoute.
   * @param {Title} _titleService The TitleService.
   */
  constructor(
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _titleService: Title) {
      this.appName = 'meshUp';
  }

  /**
   * Called when the component is initialized.
   * 
   * @method ngOnInit
   */
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
