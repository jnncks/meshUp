import { Node } from './node.model';
import { Relation } from './relation.model';

export interface InfoNet {
  _id?: Mongo.ObjectID;
  metaId: Mongo.ObjectID;
  nodes?: Node[];
  relations?: Relation[];
}
