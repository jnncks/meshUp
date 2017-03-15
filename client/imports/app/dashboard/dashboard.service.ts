import { Injectable } from '@angular/core';
import { MeteorObservable } from 'meteor-rxjs';
import { Observable } from 'rxjs';
import { Mongo } from 'meteor/mongo'

import { InfoNetCategory, InfoNetMeta } from '../../../../both/models';
import { InfoNetCategoryCollection, InfoNetMetaCollection } from '../../../../both/collections';


@Injectable()
export class DashboardService {
  private _categories: Observable<InfoNetCategory[]>;

  constructor() {
    this._categories = InfoNetCategoryCollection
      .find({})
      .mergeMap((categories: InfoNetCategory[]) => 
        Observable.combineLatest(
          ...categories.map((category: InfoNetCategory) =>
            InfoNetMetaCollection
              .find({categoryId: category._id})
              .startWith(null)
              .map(infoNetMetas => {
                if (infoNetMetas) category.items = infoNetMetas;
                return category;
              })
          )
        )
      );
    MeteorObservable.subscribe('InfoNetCategoryCollection').subscribe();
    MeteorObservable.subscribe('InfoNetMetaCollection').subscribe();
  }

  public getInfoNetCategories(): Observable<InfoNetCategory[]> {
    return this._categories;
  }
}
