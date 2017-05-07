import { Component, OnInit} from '@angular/core';
import { trigger, state, style, animate, transition, keyframes} from '@angular/core';
import { Observable } from 'rxjs';

import { GraphViewService } from './graph-view.service';

import { InfoGraph, InfoGraphMeta } from '../../../../both/models';

import template from './graph-toolbar.component.html';
import styleUrl from './graph-toolbar.component.scss';

/**
 * A toolbar for editing graphs.
 * 
 * @class GraphToolbarComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'graph-toolbar',
  template,
  styles: [ styleUrl ],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        animate('0.125s ease-in', keyframes([
          style({height: 0}),
          style({height: '*'})
        ]))
      ]),
      transition(':leave', [
        animate('0.125s ease-out', keyframes([
          style({height: '*'}),
          style({height: 0})
        ]))
      ])
    ])
  ],
  host: {
    '[@slideInOut]': 'true',
    'style': 'display: block;'
  }
})
export class GraphToolbarComponent implements OnInit {

  /**
   * Creates an instance of the GraphToolbarComponent.
   * 
   * @param {GraphViewService} _graphViewService The GraphViewService.
   */
  constructor(private _graphViewService: GraphViewService) {
  }
  
  /**
   * Called when the component is initialized.
   * ...
   * 
   * @method ngOnInit
   */
  ngOnInit(): void {
  }
}
