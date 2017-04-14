import { MongoObservable } from 'meteor-rxjs';
import { InfoGraph } from '../models';

export const InfoGraphCollection = new MongoObservable.Collection<InfoGraph>('InfoGraph-collection');
