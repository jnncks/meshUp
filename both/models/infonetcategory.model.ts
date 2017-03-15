import { Mongo } from 'meteor/mongo';

export interface InfoNetCategory {
  name: string;
  description: string;
  items?: Mongo.ObjectID[];
}
