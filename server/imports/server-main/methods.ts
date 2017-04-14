import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';

// collections
import {
  InfoGraphCategoryCollection,
  InfoGraphCollection,
  InfoGraphMetaCollection
} from '../../../both/collections';

// models
import {
  InfoGraphCategory,
  InfoGraph,
  InfoGraphMeta
} from '../../../both/models';


const nonEmptyString = Match.Where((str) => {
  check(str, String);
  return str.length > 0;
});

Meteor.methods({
  updateInfoGraphMeta(infoGraphMeta: InfoGraphMeta): void {
    if (!this.userId) {
      throw new Meteor.Error('unauthorized',
        'User must be logged in to update meta information of infoGraphs');
    }

    if (infoGraphMeta) {
      check(infoGraphMeta._id, nonEmptyString);

      if (infoGraphMeta.owner !== this.userId) {
        throw new Meteor.Error('no-permission',
          'The user has no permission to update the infoGraph meta information');
      }

      const infoGraphMetaExists = !!InfoGraphMetaCollection.find({
        _id: infoGraphMeta._id
      }).count();

      if (!infoGraphMetaExists) {
        throw new Meteor.Error('infoGraph-non-existent',
          'The ID of the supplied infoGraphMeta does not exist');
      }

      InfoGraphMetaCollection.update({ _id: infoGraphMeta._id }, infoGraphMeta, (err) => {
        throw new Meteor.Error(err);
      });
    }
  },

  deleteInfoGraphCategory(categoryId: Mongo.ObjectID): void {
    check(categoryId, nonEmptyString);

    const categoryExists = !!InfoGraphCategoryCollection.collection.find(categoryId).count();

    if (!categoryExists) {
      throw new Meteor.Error('category-non-existent',
        'Category doesn\'t exist');
    }

    InfoGraphCategoryCollection.collection.remove(categoryId);
  },

  // currently, this handles only InfoGraphMeta entries!
  deleteInfoGraph(infoGraphId: Mongo.ObjectID): void {
    check(infoGraphId, nonEmptyString);

    const InfoGraphExists = !!InfoGraphMetaCollection.collection.find(infoGraphId).count();

    if (!InfoGraphExists) {
      throw new Meteor.Error('infoGraph-non-existent',
        'infoGraph doesn not exist');
    }

    InfoGraphMetaCollection.collection.remove(infoGraphId);
  }
});