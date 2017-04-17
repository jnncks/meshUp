import { Injectable } from '@angular/core';
import { MeteorObservable } from 'meteor-rxjs';
import { Observable } from 'rxjs';

import { InfoGraph, InfoGraphMeta } from '../../../../both/models';
import { InfoGraphCollection, InfoGraphMetaCollection } from '../../../../both/collections';


/**
 * The NetService provides InfoGraph und InfoGraphMeta data.
 * Also, it allows removal of collection entries.
 */
@Injectable()
export class NetService {
  private _Graph: Observable<InfoGraph>;

  constructor() {
    // subscribe to the collections
    MeteorObservable.subscribe('InfoGraphCollection').subscribe();
    MeteorObservable.subscribe('InfoGraphMetaCollection').subscribe();

  }

  /**
   * Returns an Observable of the requested InfoGraph which is selected via
   * the given ID of the related InfoGraphMeta element.
   * 
   * @param  {string} GraphMetaId the id of the related InfoGraphMeta item
   * 
   * @returns Observable<InfoGraph>
   */
  public getInfoGraph(GraphMetaId: string): Observable<InfoGraph> {
    this._Graph = InfoGraphCollection.find({metaId: GraphMetaId}, {limit: 1})
      .map(infoGraph => infoGraph[0]); // map the first element to an Observable
    return this._Graph;
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
