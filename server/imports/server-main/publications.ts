import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

// collections
import {
  UsersCollection,
  InfoGraphCategoryCollection,
  InfoGraphMetaCollection,
  InfoGraphCollection
} from '../../../both/collections';

// models
import {
  User,
  InfoGraphCategory,
  InfoGraphMeta,
  InfoGraph
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

Meteor.publish('InfoGraphCategoryCollection', function(): Mongo.Cursor<InfoGraphCategory> {
  if (!this.userId) {
    return;
  }

  return InfoGraphCategoryCollection.collection.find({});
});

Meteor.publish('InfoGraphMetaCollection', function(): Mongo.Cursor<InfoGraphMeta> {
  if (!this.userId) {
    return;
  }
  
  return InfoGraphMetaCollection.collection.find({
    $or: [
      {owner: this.userId},
      {collaborators: this.userId}
    ]
  });
});

 Meteor.publish('InfoGraphCollection', function(): Mongo.Cursor<InfoGraph> {
  if (!this.userId) {
    return;
  }

  return InfoGraphCollection.collection.find({});
 });