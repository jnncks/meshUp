import { Meteor } from 'meteor/meteor';
 
export interface Profile {
  name?: string;
}
 
export interface User extends Meteor.User {
  profile?: Profile;
}