import { Component, OnInit} from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs';

import { GraphViewService } from './graph-view.service';

import { InfoGraph, InfoGraphMeta} from '../../../../both/models';

import template from './graph-view.component.html';
import styleUrl from './graph-view.component.scss';

/**
 * 
 */
/**
 * Serves as a container for the GraphComponent.
 * 
 * @class GraphViewComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'graph-view',
  template,
  styles: [ styleUrl ]
})
export class GraphViewComponent implements OnInit {
  private _graph: Observable<InfoGraph>;
  private _graphMetaId: string;
  public isEditing: boolean = false;

  /**
   * Creates an instance of the GraphViewComponent.
   * 
   * @param {ActivatedRoute} _route The currently active route.
   * @param {Router} _router The Router.
   * @param {GraphViewService} _graphViewService The GraphViewService.
   */
  constructor(private _route: ActivatedRoute, private _router: Router, private _graphViewService: GraphViewService) {
  }
  
  /**
   * Called when the component is initialized.
   * Populates the _graph object.
   * 
   * @method ngOnInit
   */
  ngOnInit(): void {
    this._route.params
      .subscribe((params: Params) => {
        this._graphViewService.setCurrentInfoGraph(params.id);
        this._graph = this._graphViewService.getCurrentInfoGraph();
      });

    this._graphViewService.modeChanged.subscribe(isEditing =>
      this.isEditing = isEditing);
  }
}
