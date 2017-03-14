import { Injectable } from '@angular/core';
import { ObservableCursor } from 'meteor-rxjs';
import { Mongo } from 'meteor/mongo'

import { InfoNetCategory } from '../../../../both/models/infonetcategory.model';
import { InfoNetCategoryCollection} from '../../../../both/collections/infonetcategory.collection';
import { InfoNetMeta } from '../../../../both/models/infonetmeta.model';
import { InfoNetMetaCollection } from '../../../../both/collections/infonetmeta.collection';

@Injectable()
export class DashboardService {
  private _categories: ObservableCursor<InfoNetCategory>;
  private _infoNetMetas: ObservableCursor<InfoNetMeta>;

  constructor() {
    Meteor.subscribe('InfoNetMetaCollection');
    Meteor.subscribe('InfoNetCategoryCollection');
    this._categories = InfoNetCategoryCollection.find({});
    this._infoNetMetas = InfoNetMetaCollection.find({});
  }

  public getInfoNetCategories(): ObservableCursor<InfoNetCategory> {
    return this._categories;
  }

  public getInfoNetMetaByCategory(category: ObservableCursor<InfoNetCategory>): ObservableCursor<InfoNetMeta[]> {
    return this._infoNetMetas.find({_id: {$in: category.items}});
  }
}
