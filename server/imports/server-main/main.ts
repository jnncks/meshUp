import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

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


export class Main {
  start(): void {
    this.initFakeData();

    
  }

  initFakeData(): void {
    if (Meteor.users.find({}).count() === 0) {
      console.log('no users found, creating a test user')
      Accounts.createUser({
        username: 'test',
        email: 'test@test.test',
        password: 'test',
        profile: {
          name: 'Wolfgang von Testland'
        }
      });
    }

    let lectureId: Mongo.ObjectID;
    let privateCategoryId: Mongo.ObjectID;
    const lectureMetaIds: Mongo.ObjectID[] = [];
    const privateCategoryMetaIds: Mongo.ObjectID[] = [];

    // generate some fake categories if the collection is empty
    if (InfoGraphCategoryCollection.collection.find({}).count() === 0) {
     lectureId = InfoGraphCategoryCollection.collection.insert(
        {
          name: 'Vorlesungen',
          description: 'Alle Netze, die mit Vorlesungen zu tun haben.'
        }
      );

      privateCategoryId = InfoGraphCategoryCollection.collection.insert(
        {
          name: 'Privat',
          description: 'Meine privaten Netze.'
        }
      );
    }

    // generate some fake InfoGraphMeta elements if the collection is empty
    if (InfoGraphMetaCollection.collection.find({}).count() === 0) {

      let user = Meteor.users.findOne({});

      // lecture InfoGraphs meta info
      const lecturesMeta: InfoGraphMeta[] = [{
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

      lecturesMeta.forEach((obj: InfoGraphMeta) => {
        let id = InfoGraphMetaCollection.collection.insert(obj)
        lectureMetaIds.push(id);
      });

      // lecture InfoGraphs
      const lectures: InfoGraph[] = [{
        metaId: lectureMetaIds[0]
      }, {
        metaId: lectureMetaIds[1]
      }, {
        metaId: lectureMetaIds[2]
      }, {
        metaId: lectureMetaIds[3]
      }];

      lectures.forEach((obj: InfoGraph) => {
        InfoGraphCollection.collection.insert(obj);
      });

      // privateCategory InfoGraphs meta info
      const privateGraphsMeta: InfoGraphMeta[] = [{
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

      privateGraphsMeta.forEach((obj: InfoGraphMeta) => {
        let id = InfoGraphMetaCollection.collection.insert(obj)
        privateCategoryMetaIds.push(id);
      });

      // lecture InfoGraphs
      const privateGraphs: InfoGraph[] = [{
        metaId: privateCategoryMetaIds[0]
      }, {
        metaId: privateCategoryMetaIds[1]
      }];

      privateGraphs.forEach((obj: InfoGraph) => {
        InfoGraphCollection.collection.insert(obj);
      });
    }
  }
}
