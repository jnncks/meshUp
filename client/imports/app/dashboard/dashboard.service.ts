import { Injectable } from '@angular/core';
import { MeteorObservable } from 'meteor-rxjs';
import { Observable } from 'rxjs';
import { Mongo } from 'meteor/mongo'

import { InfoNetCategory } from '../../../../both/models/infonetcategory.model';
import { InfoNetCategoryCollection} from '../../../../both/collections/infonetcategory.collection';
import { InfoNetMeta } from '../../../../both/models/infonetmeta.model';
import { InfoNetMetaCollection } from '../../../../both/collections/infonetmeta.collection';

@Injectable()
export class DashboardService {
  private _categories: Observable<InfoNetCategory[]>;
  private _infoNetMetas: Observable<InfoNetMeta[]>;

  constructor() {
    this._categories = InfoNetCategoryCollection.find({});
    this._infoNetMetas = InfoNetMetaCollection.find({});
    MeteorObservable.subscribe('InfoNetCategoryCollection').subscribe();
    MeteorObservable.subscribe('InfoNetMetaCollection').subscribe();
  }

  public getInfoNetCategories(): Observable<InfoNetCategory[]> {
    return this._categories;
  }

  public getInfoNetMetaByID(id: Mongo.ObjectID): Observable<InfoNetMeta> {
    return this._infoNetMetas.findOne({'_id': id});
  }

  public getInfoNetMetaByCategory(category: InfoNetCategory) {
    //return this._infoNetMetas.find()
  }
}
