import { Node } from './node.model';

export interface Relation {
  _id?: Mongo.ObjectID;
  type: string;
  nodes: Node[];
}