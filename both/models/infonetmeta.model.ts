import { InfoNet, InfoNetCategory, User } from './';

export interface InfoNetMeta {
  _id?: Mongo.ObjectID;
  name: string;
  description?: string;
  owner: string;
  collaborators: string[];
  created: Date;
  lastUpdated: Date;
  categoryId?: Mongo.ObjectID;
  //infonet: Mongo.ObjectID;
}
