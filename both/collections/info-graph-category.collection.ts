import { MongoObservable } from 'meteor-rxjs';
import { InfoGraphCategory } from '../models';

export const InfoGraphCategoryCollection = new MongoObservable.Collection<InfoGraphCategory>('InfoGraphCategory-collection');
