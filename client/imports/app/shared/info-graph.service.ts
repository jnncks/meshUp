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
    // subscribe to the collections
    MeteorObservable.subscribe('InfoGraphCategoryCollection').subscribe();
    MeteorObservable.subscribe('InfoGraphMetaCollection').subscribe();
    MeteorObservable.subscribe('InfoGraphCollection').subscribe();
    MeteorObservable.subscribe('UsersCollection').subscribe();
  }

  /**
   * Updates InfoGraphMeta data by calling the server's update method.
   * 
   * @param  {InfoGraphMeta} infoGraphMeta The updated InfoGraphMeta element.
   */
  updateInfoGraphMeta(infoGraphMeta: InfoGraphMeta) {
    MeteorObservable.call('updateInfoGraphMeta', infoGraphMeta)
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