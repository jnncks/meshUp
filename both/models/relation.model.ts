import { Node } from './node.model';

export interface Relation {
  _id?: Mongo.ObjectID;
  type?: string;
  source: Mongo.ObjectID;
  target: Mongo.ObjectID;
  creator: Mongo.ObjectID;
  creationDate: Date;
}