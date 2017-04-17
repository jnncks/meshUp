import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';

import { InfoGraph, InfoGraphMeta, InfoGraphCategory, User } from '../../../../both/models'
import { InfoGraphCollection, InfoGraphMetaCollection, InfoGraphCategoryCollection, UsersCollection } from '../../../../both/collections';

/**
 * The InfoGraph service. [WIP]
 * 
 * Handles creation, renmoval and updating of InfoGraphCategory, InfoGraph and
 * InfoGraphMeta documents in the designated collections.
 * 
 */
@Injectable()
export class InfoGraphService {

  constructor() {
    // setup the subscriptions
    const categories = MeteorObservable.subscribe('InfoGraphCategoryCollection');
    const metas = MeteorObservable.subscribe('InfoGraphMetaCollection');
    const graphs = MeteorObservable.subscribe('InfoGraphCollection');
    const users = MeteorObservable.subscribe('UsersCollection');
  }

  /**
   * Returns all available categories.
   * 
   * @returns Observable
   */
  getInfoGraphCategories(): Observable<InfoGraphCategory[]> {
    return InfoGraphCategoryCollection
      .find({}, { sort: ['name', 'asc'] }).zone();
  }

  createNewCategory(category: InfoGraphCategory): Observable<string> {
    return MeteorObservable.call('createInfoGraphCategory', category)
      .zone()
      .map((id: string) => {
          return id;
       }, (err: Error) => {
          this._handleError(err);
       });
  }

  createNewInfoGraphMeta(meta: InfoGraphMeta): Observable<string> {
    return MeteorObservable.call('createInfoGraphMeta', meta)
      .zone()
      .map((res: string) => {
          return res;
       }, (err: Error) => {
          this._handleError(err);
       });
  }

  createNewInfoGraph(graph: InfoGraph): Observable<string> {
    return MeteorObservable.call('createInfoGraph', graph)
      .zone()
      .map((res: string) => {
          return res;
       }, (err: Error) => {
          this._handleError(err);
       });
  }

  /**
   * Updates InfoGraphMeta data by calling the server's update method.
   * 
   * @param  {InfoGraphMeta} infoGraphMeta The updated InfoGraphMeta element.
   */
  updateInfoGraphMeta(meta: InfoGraphMeta): void {
    MeteorObservable.call('updateInfoGraphMeta', meta)
      .zone()
      .subscribe({
        error: (e: Error) => {
          if (e) {
            this._handleError(e);
          }
        }
      });
  }

  /**
   * Handles errors.
   * 
   * Currently, the errors are print in the console.
   * 
   * @param  {Error} e The error to handle.
   */
  private _handleError(e: Error): void {
    console.error(e);
  }
}