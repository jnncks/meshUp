import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Meteor } from 'meteor/meteor';

import { GraphViewService } from './graph-view.service';

import { InfoGraph, InfoGraphMeta } from '../../../../both/models';

import template from './graph-view.component.html';
import styleUrl from './graph-view.component.scss';

/**
 * Serves as a container for the GraphComponent.
 * 
 * @class GraphViewComponent
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@Component({
  selector: 'graph-view',
  template,
  styles: [ styleUrl ]
})
export class GraphViewComponent implements OnInit, OnDestroy {
  private _graph: Observable<InfoGraph>;
  private _graphMetaId: string;
  private _modeChanged: Subscription
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

        // prevent enabling the editing mode by navigating back to home
        if (params.mode === 'edit') {
          this._graphViewService.getCurrentGraphMeta().subscribe(meta => {
            if (meta.owner !== Meteor.userId())
              this._router.navigate(['/home']);
          });
        }
      });
    
    this._modeChanged = this._graphViewService.modeChanged.subscribe(isEditing =>
      this.isEditing = isEditing);
  }

  /**
   * Handles the destruction of the component.
   * Removes subscriptions.
   * 
   * @method ngOnDestroy
   */
  ngOnDestroy(): void {
    // remove subscriptions to the graphViewService
    this._modeChanged.unsubscribe();
  }
}
