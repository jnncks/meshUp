import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';

import { InfoGraph, InfoGraphMeta, InfoGraphCategory, User } from '../../../../both/models'
import { InfoGraphCollection, InfoGraphMetaCollection, InfoGraphCategoryCollection, UsersCollection } from '../../../../both/collections';

/**
 * Handles creation, renmoval and updating of InfoGraphCategory, InfoGraph and
 * InfoGraphMeta documents in the designated collections.
 * 
 * @class InfoGraphService
 */
@Injectable()
export class InfoGraphService {

  /**
   * Creates an instance of the InfoGraphService.
   * Prepares the subscriptions.
   * 
   * @constructor
   */
  constructor() {
    // setup the subscriptions
    const categories = MeteorObservable.subscribe('InfoGraphCategoryCollection');
    const metas = MeteorObservable.subscribe('InfoGraphMetaCollection');
    const graphs = MeteorObservable.subscribe('InfoGraphCollection');
    const users = MeteorObservable.subscribe('UsersCollection');
  }

  /**
   * Returns an Observable of all available categories.
   * 
   * @method getInfoGraphCategories
   * @return Observable<InfoGraphCategory[]>
   */
  getInfoGraphCategories(): Observable<InfoGraphCategory[]> {
    return InfoGraphCategoryCollection
      .find({}, { sort: ['name', 'asc'] }).zone();
  }

  /**
   * Creates a new category document and returns an Observable of its ID.
   * 
   * @method createNewCategory
   * @param  {InfoGraphCategory} category The new category document.
   * @return {Observable<string>} The document's ID.
   */
  createNewCategory(category: InfoGraphCategory): Observable<string> {
    return MeteorObservable.call('createInfoGraphCategory', category)
      .zone()
      .map((id: string) => {
          return id;
       }, (err: Error) => {
          this._handleError(err);
       });
  }

  /**
   * Creates a new infoGraphMeta document and returns an Observable of its ID.
   * 
   * @method createNewInfoGraphMeta
   * @param  {InfoGraphMeta} meta The new infoGraphMeta document.
   * @return {Observable<string>} The document's ID.
   */
  createNewInfoGraphMeta(meta: InfoGraphMeta): Observable<string> {
    return MeteorObservable.call('createInfoGraphMeta', meta)
      .zone()
      .map((res: string) => {
          return res;
       }, (err: Error) => {
          this._handleError(err);
       });
  }

  /**
   * Creates a new infoGraph document and returns an Observable of its ID.
   * 
   * @method createNewInfoGraph
   * @param  {InfoGraph} graph The new infoGraph document.
   * @return {Observable<string>} The document's ID.
   */
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
   * Updates a InfoGraphMeta document by calling the server's update method.
   * 
   * @method updateInfoGraphMeta
   * @param  {InfoGraphMeta} meta The updated InfoGraphMeta document.
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
   * Currently, the errors are print in the console.
   * 
   * @method _handleError
   * @param  {Error} e The error to handle.
   */
  private _handleError(e: Error): void {
    console.error(e);
  }
}