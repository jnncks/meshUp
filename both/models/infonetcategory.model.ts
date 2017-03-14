import { Observable } from 'rxjs';
import { Mongo } from 'meteor/mongo';

export interface InfoNetCategory {
  name: string;
  description: string;
  items?: Observable<Mongo.ObjectID[]>;
}
