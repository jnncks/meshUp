//import { DemoCollection } from '../../../both/collections/demo.collection';
import { InfoNetCategoryCollection} from '../../../both/collections/infonetcategory.collection';
import { InfoNetCollection } from '../../../both/collections/infonet.collection';
import { InfoNetMetaCollection } from '../../../both/collections/infonetmeta.collection';
import { Mongo } from 'meteor/mongo';
//import { Demo } from '../../../both/models/demo.model';
import { InfoNetCategory } from '../../../both/models/infonetcategory.model';
import { InfoNet } from '../../../both/models/infonet.model';
import { InfoNetMeta } from '../../../both/models/infonetmeta.model';

export class Main {
  start(): void {
    this.initFakeData();

    Meteor.publish('InfoNetCategoryCollection', function() {
      return InfoNetCategoryCollection.find({});
    })
    Meteor.publish('InfoNetMetaCollection', function() {
      return InfoNetMetaCollection.find({});
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
        InfoNetCategoryCollection.insert(obj);
      });
    }

    // generate some fake data if the collection is empty
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

      let lectures = InfoNetMetaCollection.find({}, {limit: 4});

      lectures.forEach( (lecture) => {
        InfoNetCategoryCollection.update(
          {name: 'Vorlesungen'},
          {$push: {items: lecture._id}} // throws an error but does work?!
        );
      });

      let privateNets = InfoNetMetaCollection.find({}, {skip: 4, limit: 1});

      privateNets.forEach( (net) => {
        InfoNetCategoryCollection.update(
          {name: 'Privat'},
          {$push: {items: net._id}} // throws an error but does work?!
        );
      });
    }

    

    

    /*if (DemoCollection.find({}).cursor.count() === 0) {
      const data: Demo[] = [{
        name: 'Dotan',
        age: 25
      }, {
        name: 'Liran',
        age: 26
      }, {
        name: 'Uri',
        age: 30
      }];
      data.forEach((obj: Demo) => {
        DemoCollection.insert(obj);
      });
    }*/
  }
}
