import { MongoObservable } from 'meteor-rxjs';
import { InfoGraphMeta } from '../models';

export const InfoGraphMetaCollection = new MongoObservable.Collection<InfoGraphMeta>('InfoGraphMeta-collection');
