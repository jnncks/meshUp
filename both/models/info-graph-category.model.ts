import { InfoGraphMeta } from './';

export interface InfoGraphCategory {
  _id?: Mongo.ObjectID;
  owner?: Mongo.ObjectID;
  name: string;
  description: string;
  items?: InfoGraphMeta[];
}
