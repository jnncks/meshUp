import { InfoGraph, InfoGraphCategory, User } from './';

export interface InfoGraphMeta {
  _id?: Mongo.ObjectID;
  name: string;
  description?: string;
  tags?: string[];
  owner: string;
  collaborators: string[];
  created: Date;
  lastUpdated: Date;
  categoryId?: Mongo.ObjectID;
}
