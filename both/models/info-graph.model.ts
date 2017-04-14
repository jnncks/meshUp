import { Edge } from './edge.model';
import { Node } from './node.model';

export interface InfoGraph {
  _id?: Mongo.ObjectID;
  metaId: Mongo.ObjectID;
  nodes?: Node[];
  edges?: Edge[];
}
