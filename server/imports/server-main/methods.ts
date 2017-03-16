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