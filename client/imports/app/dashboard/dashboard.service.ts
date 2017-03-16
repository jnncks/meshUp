import { Injectable } from '@angular/core';
import { MeteorObservable } from 'meteor-rxjs';
import { Observable } from 'rxjs';

import { InfoNetCategory, InfoNetMeta } from '../../../../both/models';

import {
  InfoNetCategoryCollection,
  InfoNetMetaCollection
} from '../../../../both/collections';


/**
 * The DashboardService provides InfoNetCategory und InfoNetMeta data.
 * Also, it allows removal of collection entries.
 */
@Injectable()
export class DashboardService {
  private _categories: Observable<InfoNetCategory[]>;

  constructor() {
    // subscribe to the collections
    MeteorObservable.subscribe('InfoNetCategoryCollection').subscribe();
    MeteorObservable.subscribe('InfoNetMetaCollection').subscribe();

    // merge streams of categories and their contents
    this._categories = InfoNetCategoryCollection
      .find({})
      .mergeMap((categories: InfoNetCategory[]) => {
        return Observable.combineLatest(
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
      })
       // debounce data (and thus UI) updates for better performance;
      .debounce(() => Observable.interval(50));
  }

  /**
   * Returns an Observable for the aggregated streams of the categories collections
   * and the contents (InfoNetMeta elements) of those categories.
   * 
   * @returns Observable
   */
  public getInfoNetCategories(): Observable<InfoNetCategory[]> {
    return this._categories;
  }
  
  /**
   * Removes the give InfoNetCategory but not its InfoNets.
   * 
   * TODO: Handle the InfoNets!
   * 
   * @param  {InfoNetCategory} category the InfoNetCategory to remove
   */
  public deleteCategory(category: InfoNetCategory): void {
    MeteorObservable.call('deleteInfoNetCategory', category._id).zone().subscribe({
      error: (e: Error) => {
        if (e) {
          this._handleError(e);
        }
      }
    });
  }

  /**
   * Removes the given InfoNet from the InfoNetCollection.
   * 
   * TODO: Currently only removes the InfoNetMeta entry!
   * 
   * @param  {InfoNetMeta} infoNet the InfoNet to remove
   */
  public deleteInfoNet(infoNet: InfoNetMeta): void {
    MeteorObservable.call('deleteInfoNet', infoNet._id).zone().subscribe({
      error: (e: Error) => {
        if (e) {
          this._handleError(e);
        }
      }
    });
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
