import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';

import { InfoNet, InfoNetMeta, InfoNetCategory, User } from '../../../../both/models'
import { InfoNetCollection, InfoNetMetaCollection, InfoNetCategoryCollection, UsersCollection } from '../../../../both/collections';

/**
 * The InfoNet service. [WIP]
 * 
 * Handles creation, renmoval and updating of InfoNetCategory, InfoNet and
 * InfoNetMeta documents in the designated collections.
 * 
 */
@Injectable()
export class InfoNetService {

  constructor() {
    // subscribe to the collections
    MeteorObservable.subscribe('InfoNetCategoryCollection').subscribe();
    MeteorObservable.subscribe('InfoNetMetaCollection').subscribe();
    MeteorObservable.subscribe('InfoNetCollection').subscribe();
    MeteorObservable.subscribe('UsersCollection').subscribe();
  }

  /**
   * Updates InfoNetMeta data by calling the server's update method.
   * 
   * @param  {InfoNetMeta} infoNetMeta The updated InfoNetMeta element.
   */
  updateInfoNetMeta(infoNetMeta: InfoNetMeta) {
    MeteorObservable.call('updateInfoNetMeta', infoNetMeta)
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