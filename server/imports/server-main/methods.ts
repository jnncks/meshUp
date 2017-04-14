import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';

// collections
import {
  InfoNetCategoryCollection,
  InfoNetCollection,
  InfoNetMetaCollection
} from '../../../both/collections';

// models
import {
  InfoNetCategory,
  InfoNet,
  InfoNetMeta
} from '../../../both/models';


const nonEmptyString = Match.Where((str) => {
  check(str, String);
  return str.length > 0;
});

Meteor.methods({
  updateInfoNetMeta(infoNetMeta: InfoNetMeta): void {
    if (!this.userId) {
      throw new Meteor.Error('unauthorized',
        'User must be logged in to update meta information of infoNets');
    }

    if (infoNetMeta) {
      check(infoNetMeta._id, nonEmptyString);

      if (infoNetMeta.owner !== this.userId) {
        throw new Meteor.Error('no-permission',
          'The user has no permission to update the infoNet meta information');
      }

      const infoNetMetaExists = !!InfoNetMetaCollection.find({
        _id: infoNetMeta._id
      }).count();

      if (!infoNetMetaExists) {
        throw new Meteor.Error('infoNet-non-existent',
          'The ID of the supplied InfoNetMeta does not exist');
      }

      console.log(infoNetMeta._id)
      InfoNetMetaCollection.update({ _id: infoNetMeta._id }, infoNetMeta, (err) => {
        throw new Meteor.Error(err);
      });
    }
  },

  deleteInfoNetCategory(categoryId: Mongo.ObjectID): void {
    check(categoryId, nonEmptyString);

    const categoryExists = !!InfoNetCategoryCollection.collection.find(categoryId).count();

    if (!categoryExists) {
      throw new Meteor.Error('category-not-exists',
        'Category doesn\'t exist');
    }

    InfoNetCategoryCollection.collection.remove(categoryId);
  },

  // currently, this handles only InfoNetMeta entries!
  deleteInfoNet(infoNetId: Mongo.ObjectID): void {
    check(infoNetId, nonEmptyString);

    const InfoNetExists = !!InfoNetMetaCollection.collection.find(infoNetId).count();

    if (!InfoNetExists) {
      throw new Meteor.Error('infonet-not-exists',
        'InfoNet doesn\'t exist');
    }

    InfoNetMetaCollection.collection.remove(infoNetId);
  }
});