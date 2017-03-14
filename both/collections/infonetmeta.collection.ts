import { MongoObservable } from 'meteor-rxjs';
import { InfoNetMeta } from '../models/infonetmeta.model';

export const InfoNetMetaCollection = new MongoObservable.Collection<InfoNetMeta>('InfoNetMeta-collection');
