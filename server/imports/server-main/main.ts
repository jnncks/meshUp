// collections
import {
  InfoNetCategoryCollection,
  InfoNetMetaCollection,
  InfoNetCollection
} from '../../../both/collections';

// models
import {
  InfoNetCategory,
  InfoNetMeta,
  InfoNet
} from '../../../both/models';


export class Main {
  start(): void {
    this.initFakeData();

    Meteor.publish('InfoNetCategoryCollection', function() {
      return InfoNetCategoryCollection.collection.find({});
    });
    Meteor.publish('InfoNetMetaCollection', function() {
      return InfoNetMetaCollection.collection.find({});
    });
    Meteor.publish('InfoNetCollection', function() {
      return InfoNetCollection.collection.find({});
    });
  }

  initFakeData(): void {
    let lectureId: Mongo.ObjectID;
    let privateCategoryId: Mongo.ObjectID;
    const lectureMetaIds: Mongo.ObjectID[] = [];
    const privateCategoryMetaIds: Mongo.ObjectID[] = [];

    // generate some fake categories if the collection is empty
    if (InfoNetCategoryCollection.collection.find({}).count() === 0) {
     lectureId = InfoNetCategoryCollection.collection.insert(
        {
          name: 'Vorlesungen',
          description: 'Alle Netze, die mit Vorlesungen zu tun haben.'
        }
      );

      privateCategoryId = InfoNetCategoryCollection.collection.insert(
        {
          name: 'Privat',
          description: 'Meine privaten Netze.'
        }
      );
    }

    // generate some fake InfoNetMeta elements if the collection is empty
    if (InfoNetMetaCollection.collection.find({}).count() === 0) {

      // lecture InfoNets meta info
      const lecturesMeta: InfoNetMeta[] = [{
        name: 'Einführung in die Medieninformatik',
        description: 'Was gehört alles zum Medieninformatik-Studium dazu?',
        created: new Date(),
        lastUpdated: new Date(),
        categoryId: lectureId
      }, {
        name: 'Software-Ergonomie',
        description: 'Grundlagen menschzentrierter Softwareentwicklung.',
        created: new Date(),
        lastUpdated: new Date(),
        categoryId: lectureId
      }, {
        name: 'Analysis',
        description: 'Integration. Fourier.',
        created: new Date(),
        lastUpdated: new Date(),
        categoryId: lectureId
      }, {
        name: 'Ingenieupsychologie',
        description: 'Gaps und mehr.',
        created: new Date(),
        lastUpdated: new Date(),
        categoryId: lectureId
      }];

      lecturesMeta.forEach((obj: InfoNetMeta) => {
        let id = InfoNetMetaCollection.collection.insert(obj)
        lectureMetaIds.push(id);
      });

      // lecture InfoNets
      const lectures: InfoNet[] = [{
        metaId: lectureMetaIds[0]
      }, {
        metaId: lectureMetaIds[1]
      }, {
        metaId: lectureMetaIds[2]
      }, {
        metaId: lectureMetaIds[3]
      }];

      lectures.forEach((obj: InfoNet) => {
        InfoNetCollection.collection.insert(obj);
      });

      // privateCategory InfoNets meta info
      const privateNetsMeta: InfoNetMeta[] = [{
        name: 'Todo-Liste',
        description: 'Arbeit, Arbeit!',
        created: new Date(),
        lastUpdated: new Date(),
        categoryId: privateCategoryId
      }, {
        name: 'Einkaufsliste als Netz',
        description: 'Was ich noch kaufen muss.',
        created: new Date(),
        lastUpdated: new Date(),
        categoryId: privateCategoryId
      }];

      privateNetsMeta.forEach((obj: InfoNetMeta) => {
        let id = InfoNetMetaCollection.collection.insert(obj)
        privateCategoryMetaIds.push(id);
      });

      // lecture InfoNets
      const privateNets: InfoNet[] = [{
        metaId: privateCategoryMetaIds[0]
      }, {
        metaId: privateCategoryMetaIds[1]
      }];

      privateNets.forEach((obj: InfoNet) => {
        InfoNetCollection.collection.insert(obj);
      });
    }
  }
}
