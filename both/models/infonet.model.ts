import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Node } from './node.model';
import { Relation } from './relation.model';

export interface InfoNet {
  id: Mongo.ObjectID;
  nodes: Node[];
  relations: Relation[];
}
