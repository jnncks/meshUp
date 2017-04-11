import { InfoNetMeta } from './infonetmeta.model';

export interface InfoNetCategory {
  _id?: Mongo.ObjectID;
  owner?: Mongo.ObjectID;
  name: string;
  description: string;
  items?: InfoNetMeta[];
}
