import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

// collections
import {
  UsersCollection,
  InfoNetCategoryCollection,
  InfoNetMetaCollection,
  InfoNetCollection
} from '../../../both/collections';

// models
import {
  User,
  InfoNetCategory,
  InfoNetMeta,
  InfoNet
} from '../../../both/models';

Meteor.publish('UsersCollection', function(): Mongo.Cursor<User> {
  if (!this.userId) {
    return;
  }
 
  return UsersCollection.collection.find({}, {
    fields: {
      profile: 1
    }
  });
});

Meteor.publish('InfoNetCategoryCollection', function(): Mongo.Cursor<InfoNetCategory> {
  if (!this.userId) {
    return;
  }

  return InfoNetCategoryCollection.collection.find({});
});

Meteor.publish('InfoNetMetaCollection', function(): Mongo.Cursor<InfoNetMeta> {
  if (!this.userId) {
    return;
  }
  
  return InfoNetMetaCollection.collection.find({
    $or: [
      {owner: this.userId},
      {collaborators: this.userId}
    ]
  });
});

 Meteor.publish('InfoNetCollection', function(): Mongo.Cursor<InfoNet> {
  if (!this.userId) {
    return;
  }

  return InfoNetCollection.collection.find({});
 });