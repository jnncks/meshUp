import { MongoObservable } from 'meteor-rxjs';
import { InfoNetCategory } from '../models/infonetcategory.model';

export const InfoNetCategoryCollection = new MongoObservable.Collection<InfoNetCategory>('InfoNetCategory-collection');
