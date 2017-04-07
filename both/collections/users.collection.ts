import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';
import { User } from '../models';
 
export const UsersCollection = MongoObservable.fromExisting<User>(Meteor.users);