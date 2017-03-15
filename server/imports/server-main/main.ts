import { Mongo } from 'meteor/mongo';

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

    let lectureIds = [];
    let privateCategoryIds = [];

    // generate some fake InfoNetMeta elements if the collection is empty
    if (InfoNetMetaCollection.find({}).cursor.count() === 0) {

      // lectures
      const lectures: InfoNetMeta[] = [{
        name: 'Einführung in die Medieninformatik',
        description: 'Was gehört alles zum Medieninformatik-Studium dazu?',
        created: new Date(),
        lastUpdated: new Date()
      }, {
        name: 'Software-Ergonomie',
        description: 'Grundlagen menschzentrierter Softwareentwicklung.',
        created: new Date(),
        lastUpdated: new Date()
      }, {
        name: 'Analysis',
        description: 'Integration. Fourier.',
        created: new Date(),
        lastUpdated: new Date()
      }, {
        name: 'Ingenieupsychologie',
        description: 'Gaps und mehr.',
        created: new Date(),
        lastUpdated: new Date()
      }];

      lectures.forEach((obj: InfoNetMeta) => {
        InfoNetMetaCollection
          .insert(obj) // returns an Observable of the ID of the inserted obj
          .subscribe(id => lectureIds.push(id));
      });

      // privateCategory nets
      const privateNets: InfoNetMeta[] = [{
        name: 'Todo-Liste',
        description: 'Arbeit, Arbeit!',
        created: new Date(),
        lastUpdated: new Date()
      }, {
        name: 'Einkaufsliste als Netz',
        description: 'Was ich noch kaufen muss.',
        created: new Date(),
        lastUpdated: new Date()
      }];

      privateNets.forEach((obj: InfoNetMeta) => {
        InfoNetMetaCollection
          .insert(obj) // returns an Observable of the ID of the inserted obj
          .subscribe(id => privateCategoryIds.push(id));
      });
    }

    // generate some fake categories if the collection is empty
    if (InfoNetCategoryCollection.find({}).cursor.count() === 0) {
      const data: InfoNetCategory[] = [{
        name: 'Vorlesungen',
        description: 'Alle Netze, die mit Vorlesungen zu tun haben.',
        items: lectureIds
      }, {
        name: 'Privat',
        description: 'Meine privaten Netze.',
        items: privateCategoryIds
      }];

      data.forEach((obj: InfoNetMeta) => {
        InfoNetCategoryCollection.insert(obj)
      });
    }
  }
}
