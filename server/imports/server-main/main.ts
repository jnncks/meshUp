import { Mongo } from 'meteor/mongo';

// collections
import { InfoNetCategoryCollection} from '../../../both/collections/infonetcategory.collection';
import { InfoNetCollection } from '../../../both/collections/infonet.collection';
import { InfoNetMetaCollection } from '../../../both/collections/infonetmeta.collection';

// models
import { InfoNetCategory } from '../../../both/models/infonetcategory.model';
import { InfoNet } from '../../../both/models/infonet.model';
import { InfoNetMeta } from '../../../both/models/infonetmeta.model';


export class Main {
  start(): void {
    this.initFakeData();

    Meteor.publish('InfoNetCategoryCollection', function() {
      return InfoNetCategoryCollection.collection.find({});
    })
    Meteor.publish('InfoNetMetaCollection', function() {
      return InfoNetMetaCollection.collection.find({});
    })
  }

  initFakeData(): void {
    // generate some fake categories if the collection is empty
    if (InfoNetCategoryCollection.find({}).cursor.count() === 0) {
      const data: InfoNetCategory[] = [{
        name: 'Vorlesungen',
        description: 'Alle Netze, die mit Vorlesungen zu tun haben.',
      }, {
        name: 'Privat',
        description: 'Meine privaten Netze.'
      }];

      data.forEach((obj: InfoNetCategory) => {
        InfoNetCategoryCollection.collection.insert(obj);
      });
    }

    // generate some fake InfoNetMeta elements if the collection is empty
    if (InfoNetMetaCollection.find({}).cursor.count() === 0) {
      const data: InfoNetMeta[] = [{
        name: 'Einführung in die Medieninformatik',
        description: 'Was gehört alles zum Medieninformatik-Studium dazu?',
        created: new Date(),
        lastUpdated: new Date()
      }, {
        name: 'Software-Ergonomie',
        description: 'Was gehört alles zum Medieninformatik-Studium dazu?',
        created: new Date(),
        lastUpdated: new Date()
      }, {
        name: 'Analysis',
        description: 'Was gehört alles zum Medieninformatik-Studium dazu?',
        created: new Date(),
        lastUpdated: new Date()
      }, {
        name: 'Ingenieupsychologie',
        description: 'Was gehört alles zum Medieninformatik-Studium dazu?',
        created: new Date(),
        lastUpdated: new Date()
      }, {
        name: 'Einkaufsliste als Netz',
        description: 'Was ich noch kaufen muss.',
        created: new Date(),
        lastUpdated: new Date()
      }];

      data.forEach((obj: InfoNetMeta) => {
        InfoNetMetaCollection.insert(obj);
      });

      // add the first 4 InfoNetMeta _id values to the first category 
      let lectures = InfoNetMetaCollection.collection.find({}, {limit: 4});
      lectures.forEach( (lecture) => {
        InfoNetCategoryCollection.collection.update(
          {name: 'Vorlesungen'},
          {$push: {items: lecture._id}}
        );
      });

      // add the fifth InfoNetMeta _id value to the second category 
      let privateNets = InfoNetMetaCollection.collection.find({}, {skip: 4, limit: 1});
      privateNets.forEach( (net) => {
        InfoNetCategoryCollection.collection.update(
          {name: 'Privat'},
          {$push: {items: net._id}}
        );
      });
    }
  }
}
