import { InfoNet } from './infonet.model';
import { InfoNetCategory } from './infonetcategory.model';

export interface InfoNetMeta {
  _id?: Mongo.ObjectID;
  name: string;
  description?: string;
  created: Date;
  lastUpdated: Date;
  categoryId?: Mongo.ObjectID;
  //owner: Meteor.User;
  //collaborators: Meteor.User[];
  //infonet: Mongo.ObjectID;
}
