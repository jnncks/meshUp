import { Injectable } from '@angular/core';
import { MeteorObservable } from 'meteor-rxjs';
import { Observable } from 'rxjs';

import { InfoNet, InfoNetMeta } from '../../../../both/models';
import { InfoNetCollection, InfoNetMetaCollection } from '../../../../both/collections';


/**
 * The NetService provides InfoNet und InfoNetMeta data.
 * Also, it allows removal of collection entries.
 */
@Injectable()
export class NetService {
  private _net: Observable<InfoNet>;

  constructor() {
    // subscribe to the collections
    MeteorObservable.subscribe('InfoNetCollection').subscribe();
    MeteorObservable.subscribe('InfoNetMetaCollection').subscribe();

  }

  /**
   * Returns an Observable of the requested InfoNet which is selected via
   * the given ID of the related InfoNetMeta element.
   * 
   * @param  {Mongo.ObjectID} netMetaId the id of the related InfoNetMeta item
   * 
   * @returns Observable<InfoNet>
   */
  public getInfoNet(netMetaId: Mongo.ObjectID): Observable<InfoNet> {
    this._net = InfoNetCollection.find({metaId: netMetaId}, {limit: 1})
      .map(infoNet => infoNet[0]); // map the first element to an Observable
    return this._net;
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
