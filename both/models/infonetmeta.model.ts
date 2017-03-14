import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { InfoNet } from './infonet.model';
import { InfoNetCategory } from './infonetcategory.model';

export interface InfoNetMeta {
  name: string;
  description: string;
  created: Date;
  lastUpdated: Date;
  //owner: Meteor.User;
  //collaborators: Meteor.User[];
  //infonet: Mongo.ObjectID;
}
