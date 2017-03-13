import { MongoObservable } from 'meteor-rxjs';
import { InfoNet } from '../models/infonet.model';

export const InfoNetCollection = new MongoObservable.Collection<InfoNet>('InfoNet-collection');
