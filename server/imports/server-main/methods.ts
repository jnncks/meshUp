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
  createInfoGraphCategory(category: InfoGraphCategory): string {
    if (!this.userId) {
      throw new Meteor.Error('unauthorized',
        'User must be logged in to create infoGraphCategorie documents');
    }

    if (category) {
      const infoGraphCategoryExists = !!InfoGraphCategoryCollection.collection.find({
        name: category.name
      }).count();

      if (infoGraphCategoryExists) {
        throw new Meteor.Error('infoGraphCategory-exists',
          'The infoGraphCategory does already exist');
      }

      return InfoGraphCategoryCollection.collection.insert(category);
    }
  },

  createInfoGraphMeta(meta: InfoGraphMeta): string {
    if (!this.userId) {
      throw new Meteor.Error('unauthorized',
        'User must be logged in create InfoGraphMeta documents');
    }

    return InfoGraphMetaCollection.collection.insert(meta);
  },

  createInfoGraph(graph: InfoGraph): string {
    if (!this.userId) {
      throw new Meteor.Error('unauthorized',
        'User must be logged in create InfoGraph documents');
    }

    return InfoGraphCollection.collection.insert(graph);
  },

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

      const infoGraphMetaExists = !!InfoGraphMetaCollection.collection.find({
        _id: infoGraphMeta._id
      }).count();

      if (!infoGraphMetaExists) {
        throw new Meteor.Error('infoGraph-non-existent',
          'The ID of the supplied infoGraphMeta is not linked to any existing infoGraphMeta');
      }

      InfoGraphMetaCollection.collection.update({ _id: infoGraphMeta._id }, infoGraphMeta, (err) => {
        if (err)
          throw new Meteor.Error(err);
      });
    }
  },

  updateInfoGraph(infoGraph: InfoGraph): void {
    if (!this.userId) {
      throw new Meteor.Error('unauthorized',
        'User must be logged in to update infoGraphs');
    }

    if (infoGraph) {
      check(infoGraph._id, nonEmptyString);

      let infoGraphMeta = InfoGraphMetaCollection.findOne({_id: infoGraph.metaId})
      if (infoGraphMeta.owner !== this.userId) {
        throw new Meteor.Error('no-permission',
          'The user has no permission to update the infoGraph\'s contents');
      }

      const infoGraphExists = !!InfoGraphCollection.collection.find({
        _id: infoGraph._id
      }).count();

      if (!infoGraphExists) {
        throw new Meteor.Error('infoGraph-non-existent',
          'The ID of the supplied infoGraph is not linked to any existing infoGraph');
      }

      InfoGraphCollection.collection.update({ _id: infoGraph._id }, infoGraph, (err) => {
        if (err)
          throw new Meteor.Error(err);
      });

      InfoGraphMetaCollection.collection.update({ _id: infoGraph.metaId },
        { $set: { lastUpdated: new Date() } }, (err) => {
          if (err)
            throw new Meteor.Error(err);
        });
    }
  },

  deleteInfoGraphCategory(categoryId: string): void {
    check(categoryId, nonEmptyString);

    const categoryExists = !!InfoGraphCategoryCollection.collection.find(categoryId).count();

    if (!categoryExists) {
      throw new Meteor.Error('category-non-existent',
        'Category does not exist');
    }

    InfoGraphCategoryCollection.collection.remove(categoryId);
  },

  deleteInfoGraph(infoGraphMetaId: string): void {
    check(infoGraphMetaId, nonEmptyString);

    const InfoGraphExists = !!InfoGraphMetaCollection.collection.find(infoGraphMetaId).count();

    if (!InfoGraphExists) {
      throw new Meteor.Error('infoGraph-non-existent',
        'infoGraph does not exist');
    }

    InfoGraphCollection.remove({metaId: infoGraphMetaId})
    InfoGraphMetaCollection.collection.remove(infoGraphMetaId);
  }
});