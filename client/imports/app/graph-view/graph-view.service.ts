import { Injectable } from '@angular/core';
import { MeteorObservable } from 'meteor-rxjs';
import { Observable } from 'rxjs';

import { InfoGraph, InfoGraphMeta } from '../../../../both/models';
import { InfoGraphCollection, InfoGraphMetaCollection } from '../../../../both/collections';


/**
 * The NetService provides InfoGraph und InfoGraphMeta data.
 */
@Injectable()
export class GraphViewService {
  private _graph: Observable<InfoGraph>;

  constructor() {
    // TODO: actually use this collection for infoGraph settings
    //MeteorObservable.subscribe('InfoGraphMetaCollection');
  }

  /**
   * Subscribes to the InfoGraphCollection and assigns an Observable of the
   * requested infoGraph to the private graph object.
   * 
   * @param  {string} graphMetaId the id of the related InfoGraphMeta item
   */
  public setCurrentInfoGraph(graphMetaId): void {
    // set up the subscriptions
    const graphs = MeteorObservable.subscribe('InfoGraphCollection', graphMetaId);
    const autorun = MeteorObservable.autorun();

    // update the data whenever there was a change
    Observable.merge(graphs, autorun).subscribe(() => {
      // Observable of the first and only element
      this._graph = InfoGraphCollection.find({metaId: graphMetaId}, {limit: 1})
        .map(graph => graph[0]);
    })
   
  }

  /**
   * Returns the private graph object, an Observable of the currently
   * assigned infoGraph.
   *
   * @returns Observable<InfoGraph>
   */
  public getCurrentInfoGraph(): Observable<InfoGraph> {
    return this._graph;
  }

  /**
   * Handles errors. Currently, the errors are print in the console.
   * 
   * @param  {Error} e the error to handle
   */
  private _handleError(e: Error): void {
    console.error(e);
  }
}
