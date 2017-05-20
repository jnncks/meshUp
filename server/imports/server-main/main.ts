import {
  Meteor
} from 'meteor/meteor';
import {
  Random
} from 'meteor/random';
import {
  Accounts
} from 'meteor/accounts-base';

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
  InfoGraph,
  Node,
  Edge
} from '../../../both/models';


export class Main {
  start(): void {
    this.initFakeData();
  }

  initFakeData(): void {
    if (Meteor.users.find({}).count() === 0) {
      console.log('no users found, creating a test user')
      Accounts.createUser({
        username: 'evaluation',
        email: 'evaluation@meshup.de',
        password: 'evaluation',
        profile: {
          name: 'meshUp Evaluation'
        }
      });

      Accounts.createUser({
        username: 'mathe',
        email: 'mathe@meshup.de',
        password: 'mathe',
        profile: {
          name: 'Institut für Mathematik'
        }
      });

      Accounts.createUser({
        username: 'imis',
        email: 'imis@meshup.de',
        password: 'imis',
        profile: {
          name: 'IMIS'
        }
      });

      
    }

    let lectureId: string;
    let privateCategoryId: string;
    const lectureMetaIds: string[] = [];
    const privateCategoryMetaIds: string[] = [];

    // generate some fake categories if the collection is empty
    if (InfoGraphCategoryCollection.collection.find({}).count() === 0) {
      lectureId = InfoGraphCategoryCollection.collection.insert({
        name: 'Vorlesungen',
        description: 'Alle Netze, die mit Vorlesungen zu tun haben.'
      });

      privateCategoryId = InfoGraphCategoryCollection.collection.insert({
        name: 'Privat',
        description: 'Meine privaten Netze.'
      });
    }

    // generate some fake InfoGraphMeta elements if the collection is empty
    if (InfoGraphMetaCollection.collection.find({}).count() === 0) {

      let user = Meteor.users.findOne({username: 'evaluation'});
      let imis = Meteor.users.findOne({username: 'imis'});
      let math = Meteor.users.findOne({username: 'mathe'});

      // lecture InfoGraphs meta info
      const lecturesMeta: InfoGraphMeta[] = [{
        name: 'Einführung in die Medieninformatik',
        description: 'Was gehört alles zum Medieninformatik-Studium dazu?',
        owner: imis._id,
        collaborators: [user._id],
        created: new Date(),
        lastUpdated: new Date(),
        categoryId: lectureId
      }, {
        name: 'Software-Ergonomie',
        description: 'Grundlagen menschzentrierter Softwareentwicklung.',
        owner: imis._id,
        collaborators: [user._id],
        created: new Date(),
        lastUpdated: new Date(),
        categoryId: lectureId
      }, {
        name: 'Analysis',
        description: 'Integration. Fourier.',
        owner: math._id,
        collaborators: [user._id],
        created: new Date(),
        lastUpdated: new Date(),
        categoryId: lectureId
      }, {
        name: 'Ingenieurpsychologie',
        description: 'Gaps und mehr.',
        owner: imis._id,
        collaborators: [user._id],
        created: new Date(),
        lastUpdated: new Date(),
        categoryId: lectureId
      }];

      lecturesMeta.forEach((obj: InfoGraphMeta) => {
        let id = InfoGraphMetaCollection.collection.insert(obj)
        lectureMetaIds.push(id);
      });

      let nodes: Node[];
      let edges: Edge[];

      // lecture InfoGraphs
      const lectures: InfoGraph[] = [{
        metaId: lectureMetaIds[0],
        nodes: nodes = this.randomNodes(imis),
        edges: edges = this.randomEdges(nodes, imis)
      }, {
        metaId: lectureMetaIds[1],
        nodes: nodes = this.randomNodes(imis),
        edges: edges = this.randomEdges(nodes, imis)
      }, {
        metaId: lectureMetaIds[2],
        nodes: nodes = this.randomNodes(math),
        edges: edges = this.randomEdges(nodes, math)
      }, {
        metaId: lectureMetaIds[3],
        nodes: nodes = this.randomNodes(imis),
        edges: edges = this.randomEdges(nodes, imis)
      }];

      lectures.forEach((obj: InfoGraph) => {
        InfoGraphCollection.collection.insert(obj);
      });

      // privateCategory InfoGraphs meta info
      const privateGraphsMeta: InfoGraphMeta[] = [{
        name: 'Todo-Liste',
        description: 'Arbeit, Arbeit!',
        tags: ['Arbeit', 'Todos', 'Liste', 'Test', 'Test'],
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
        metaId: privateCategoryMetaIds[0],
        nodes: nodes = this.randomNodes(user),
        edges: edges = this.randomEdges(nodes, user)
      }, {
        metaId: privateCategoryMetaIds[1],
        nodes: nodes = this.randomNodes(user),
        edges: edges = this.randomEdges(nodes, user)
      }];

      privateGraphs.forEach((obj: InfoGraph) => {
        InfoGraphCollection.collection.insert(obj);
      });
    }
  }

  randomNodes(user: User): Node[] {
    return [{
      _id: Random.id(),
      x: 200,
      y: 500,
      title: 'Testnode 1',
      content: 'Testcontent 1',
      creator: user._id,
      created: new Date(),
      lastUpdated: new Date()
    }, {
      _id: Random.id(),
      x: 50,
      y: 20,
      title: 'Testnode 2',
      content: 'Testcontent 2',
      creator: user._id,
      created: new Date(),
      lastUpdated: new Date()
    }, {
      _id: Random.id(),
      x: 500,
      y: 750,
      title: 'Testnode 3',
      content: 'Testcontent 3',
      creator: user._id,
      created: new Date(),
      lastUpdated: new Date()
    }, {
      _id: Random.id(),
      x: 400,
      y: 100,
      title: 'Testnode 4',
      content: 'Testcontent 4',
      creator: user._id,
      created: new Date(),
      lastUpdated: new Date()
    }, {
      _id: Random.id(),
      x: 750,
      y: 350,
      title: 'Testnode 5',
      content: 'Testcontent 5',
      creator: user._id,
      created: new Date(),
      lastUpdated: new Date()
    }];
  }

  randomEdges(nodes: Node[], user: User): Edge[] {
    return [{
      _id: Random.id(),
      source: nodes[0]._id,
      target: nodes[4]._id,
      creator: user._id,
      created: new Date()
    }, {
      _id: Random.id(),
      source: nodes[2]._id,
      target: nodes[4]._id,
      creator: user._id,
      created: new Date()
    }, {
      _id: Random.id(),
      source: nodes[1]._id,
      target: nodes[4]._id,
      creator: user._id,
      created: new Date()
    }, {
      _id: Random.id(),
      source: nodes[3]._id,
      target: nodes[2]._id,
      creator: user._id,
      created: new Date()
    }, {
      _id: Random.id(),
      source: nodes[1]._id,
      target: nodes[3]._id,
      creator: user._id,
      created: new Date()
    }, {
      _id: Random.id(),
      source: nodes[3]._id,
      target: nodes[4]._id,
      creator: user._id,
      created: new Date()
    }];
  }
}