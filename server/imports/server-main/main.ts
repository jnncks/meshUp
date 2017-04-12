import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

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


export class Main {
  start(): void {
    this.initFakeData();

    
  }

  initFakeData(): void {
    if (Meteor.users.find({}).count() === 0) {
      console.log('no users found')
      Accounts.createUser({
        username: 'test',
        email: 'test@test.test',
        password: 'test',
        profile: {
          name: 'Testuser'
        }
      });
    }

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

      let user = Meteor.users.findOne({});

      // lecture InfoNets meta info
      const lecturesMeta: InfoNetMeta[] = [{
        name: 'Einführung in die Medieninformatik',
        description: 'Was gehört alles zum Medieninformatik-Studium dazu?',
        owner: '',
        collaborators: [ user._id ],
        created: new Date(),
        lastUpdated: new Date(),
        categoryId: lectureId
      }, {
        name: 'Software-Ergonomie',
        description: 'Grundlagen menschzentrierter Softwareentwicklung.',
        owner: '',
        collaborators: [ user._id ],
        created: new Date(),
        lastUpdated: new Date(),
        categoryId: lectureId
      }, {
        name: 'Analysis',
        description: 'Integration. Fourier.',
        owner: '',
        collaborators: [ user._id ],
        created: new Date(),
        lastUpdated: new Date(),
        categoryId: lectureId
      }, {
        name: 'Ingenieurpsychologie',
        description: 'Gaps und mehr.',
        owner: '',
        collaborators: [ user._id ],
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
        tags: [ 'Arbeit', 'Todos', 'Liste', 'Test', 'Test' ],
        owner: user._id,
        collaborators: [],
        created: new Date(),
        lastUpdated: new Date(),
        categoryId: privateCategoryId
      }, {
        name: 'Einkaufsliste als Netz',
        description: 'Was ich noch kaufen muss.',
        owner: user._id,
        collaborators: [],
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
