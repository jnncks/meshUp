import { Component, OnInit} from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs';

import { GraphViewService } from './graph-view.service';

import { InfoGraph, InfoGraphMeta} from '../../../../both/models';

import template from './graph-view.component.html';
import styleUrl from './graph-view.component.scss';

/**
 * The GraphViewComponent serves as a container for the GraphComponent.
 */
@Component({
  selector: 'graph-view',
  template,
  styles: [ styleUrl ]
})
export class GraphViewComponent implements OnInit {
  private _graph: Observable<InfoGraph>;
  private _graphMetaId: string;

  constructor(private _route: ActivatedRoute, private _router: Router, private _graphViewService: GraphViewService) {
  }
  
  ngOnInit() {
    this._route.params
      .subscribe((params: Params) => {
        this._graphViewService.setCurrentInfoGraph(params.id);
        this._graph = this._graphViewService.getCurrentInfoGraph().zone();
      });
  }
}
