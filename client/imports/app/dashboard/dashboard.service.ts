import { Injectable } from '@angular/core';
import { MeteorObservable } from 'meteor-rxjs';
import { Observable } from 'rxjs';

import {
  InfoGraphCategory,
  InfoGraphMeta,
  User
} from '../../../../both/models';

import {
  InfoGraphCategoryCollection,
  InfoGraphMetaCollection,
  UsersCollection
} from '../../../../both/collections';

/**
 * The DashboardService provides InfoGraphCategory und InfoGraphMeta data.
 * Also, it allows removal of collection entries.
 * 
 * @class DashboardService
 */
@Injectable()
export class DashboardService {
  private _categories: Observable<InfoGraphCategory[]>;

  /**
   * Creates an instance of the DashboardService.
   * 
   * @constructor
   */
  constructor() {
    // set up the subscriptions
    const categories = MeteorObservable.subscribe('InfoGraphCategoryCollection');
    const metas = MeteorObservable.subscribe('InfoGraphMetaCollection');
    const users = MeteorObservable.subscribe('UsersCollection');
    const autorun = MeteorObservable.autorun();

    // update the data whenever there is a change in one of the subscriptions
    Observable.merge(categories, metas, users, autorun)
      .subscribe(() => {
        // merge streams of categories and their contents
        this._categories = InfoGraphCategoryCollection
          .find({}, { sort: [['name', 'asc'], ['description', 'asc']] })
          .mergeMap((categories: InfoGraphCategory[]) => {
            return Observable.combineLatest(
              ...categories.map((category: InfoGraphCategory) =>
                InfoGraphMetaCollection
                  .find(
                    {categoryId: category._id},
                    { sort: [['name', 'asc'], ['lastUpdated', 'desc']] }
                  )
                  .startWith(null)
                  .map(infoGraphMetas => {
                    if (infoGraphMetas) category.items = infoGraphMetas;
                    return category;
                  })
              )
            )
          })
          // debounce data (and thus UI) updates for better performance;
          .debounce(() => Observable.interval(50));
      });
  }

  /**
   * Returns an Observable for the aggregated streams of the categories
   * collections and the contents (InfoGraphMeta elements) of those categories.
   * 
   * @method getInfoGraphCategories
   * @return Observable<InfoGraphCategory[]>
   */
  public getInfoGraphCategories(): Observable<InfoGraphCategory[]> {
    return this._categories;
  }
  
  /**
   * Removes the given infoGraphCategory but not its infoGraphs.
   * 
   * @method deleteCategory
   * @param  {InfoGraphCategory} category The InfoGraphCategory to remove.
   */
  public deleteCategory(category: InfoGraphCategory): void {
    // TODO: Handle the infoGraphs!
    MeteorObservable.call('deleteInfoGraphCategory', category._id)
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
   * Removes the given InfoGraph from the InfoGraphCollection.
   * 
   * @method deleteInfoGraph
   * @param  {InfoGraphMeta} infoGraph The InfoGraph to remove.
   */
  public deleteInfoGraph(infoGraph: InfoGraphMeta): void {
    // TODO: Currently only removes the InfoGraphMeta entry!
    MeteorObservable.call('deleteInfoGraph', infoGraph._id)
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
   * Returns an Observable of the name of the user whose ID has been passed in.
   * 
   * @method getUserName
   * @param  {string} userId The ID of the user whose name will be returned.
   * @return {Observable<string>}
   */
  public getUserName(userId: string): Observable<string> {
    return Observable.from(
      UsersCollection.collection.find(
        {_id: userId},
        {limit: 1, fields: { profile: 1, } }
      ).map(user => {
        if(!user) {
          return 'unbekanntem Benutzer';
        }
        return user.profile.name;
      })
    );
  }

  /**
   * Handles errors. Currently, the errors are print in the console.
   * 
   * @method _handleError
   * @param  {Error} e The error to handle.
   */
  private _handleError(e: Error): void {
    console.error(e);
  }
}
