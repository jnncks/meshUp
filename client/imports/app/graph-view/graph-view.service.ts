import { Injectable, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Meteor } from 'meteor/meteor';
import { MeteorObservable } from 'meteor-rxjs';
import { Observable } from 'rxjs';

import { InfoGraph, InfoGraphMeta } from '../../../../both/models';
import { InfoGraphCollection, InfoGraphMetaCollection } from '../../../../both/collections';


/**
 * Provides InfoGraph und InfoGraphMeta data.
 * 
 * @class GraphViewService
 */
@Injectable()
export class GraphViewService {
  private _graph: Observable<InfoGraph>;
  private _graphMeta: Observable<InfoGraphMeta>;
  private _isEditing: boolean;
  public modeChanged = new EventEmitter<boolean>();

  /**
   * Creates an instance of the GraphViewService.
   * 
   * @param {Router} _router 
   * @constructor
   */
  constructor(private _router: Router) {
    // TODO: actually use this collection for infoGraph settings
    //
  }

  /**
   * Subscribes to the InfoGraphCollection and assigns an Observable of the
   * requested infoGraph to the private graph object.
   * 
   * @method setCurrentInfoGraph
   * @param  {string} graphMetaId The ID of the related InfoGraphMeta document.
   */
  public setCurrentInfoGraph(graphMetaId): void {
    // set up the subscriptions
    const graphs = MeteorObservable.subscribe('InfoGraphCollection', graphMetaId);
    const graphMetas = MeteorObservable.subscribe('InfoGraphMetaCollection');
    const autorun = MeteorObservable.autorun();

    // update the data whenever there was a change
    Observable.merge(graphs, graphMetas, autorun).subscribe(() => {
      // Observable of the first and only element
      this._graph = InfoGraphCollection.find({metaId: graphMetaId}, {limit: 1})
        .map(graph => graph[0]);
    });
  }

  /**
   * Returns the private graph object, an Observable of the currently
   * assigned infoGraph.
   * 
   * @method getCurrentInfoGraph
   * @returns Observable<InfoGraph>
   */
  public getCurrentInfoGraph(): Observable<InfoGraph> {
    return this._graph;
  }

  /**
   * Handles errors. Currently, the errors are print in the console.
   * 
   * @method _handleError
   * @param  {Error} e The error to handle.
   */
  private _handleError(e: Error): void {
    console.error(e);
  }


  /**
   * Toggles between the editing and viewing mode.
   * 
   * @method toggleMode
   */
  toggleMode(): void {
    let currentRoute: string = this._router.url;
    if (currentRoute.includes('/edit') || currentRoute.includes('/view'))
      currentRoute = currentRoute.substring(0, currentRoute.length - 5);

    if (this.getGraphMeta().owner !== Meteor.userId()){
      // the user has no editing permissions
      return;
    }
    
    this._isEditing = !this._isEditing;

    if (this._isEditing) {
      this._router.navigate([currentRoute, 'edit']);
    } else {
      this._router.navigate([currentRoute, 'view']);
    }

    this.modeChanged.emit(this._isEditing);
  }

  /**
   * Returns the current mode: true if editing, else false.
   * 
   * @method getCurrentMode
   * @return {boolean} current Mode
   */
  getCurrentMode(): boolean {
    return this._isEditing;
  }

  getGraphMeta(): InfoGraphMeta {
    let metaId: string;
    this._graph.subscribe(graph => metaId = graph.metaId);

    return InfoGraphMetaCollection.findOne({_id: metaId});
  }
}
