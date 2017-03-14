import { Mongo } from 'meteor/mongo';

export interface Node {
  title: string;
  detail: string;
  content: string;
  id: Mongo.ObjectID;
  created: Date;
  lastEdited: Date;
}