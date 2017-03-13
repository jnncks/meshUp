import { Meteor } from 'meteor/meteor';
import { Node } from './node.model';

export interface InfoNet {
  name: string;
  created: Date;
  lastUpdated: Date;
  owner: Meteor.User;
  collaborators: [ Meteor.User ];
  nodes: [ Node ];
}
