// chai uses as asset library
import * as chai from 'chai';
import * as spies from 'chai-spies';
import StubCollections from 'meteor/hwillson:stub-collections';

import { Main } from './main';
import {
  InfoNetCategoryCollection,
  InfoNetMetaCollection
} from '../../../both/collections';


chai.use(spies);


describe('Server Main', () => {
  let mainInstance: Main;

  beforeEach(() => {
    // create a database mock
    StubCollections.stub(InfoNetCategoryCollection);
    StubCollections.stub(InfoNetMetaCollection);

    // create an instance of main class
    mainInstance = new Main();
  });

  afterEach(() => {
    // restore the database
    StubCollections.restore();
  });

  it('Should call initFakeData on startup', () => {
    mainInstance.initFakeData = chai.spy();
    mainInstance.start();

    chai.expect(mainInstance.initFakeData).to.have.been.called();
  });

  it('Should call insert 2 times for InfoNetCategoryCollection when init fake data', () => {
    InfoNetCategoryCollection.collection.insert = chai.spy();
    mainInstance.initFakeData();

    chai.expect(InfoNetCategoryCollection.collection.insert).to.have.been.called.exactly(2);
  });

  it('Should call insert 6 times for InfoNetMetaCollection when init fake data', () => {
    InfoNetMetaCollection.collection.insert = chai.spy();
    mainInstance.initFakeData();

    chai.expect(InfoNetMetaCollection.collection.insert).to.have.been.called.exactly(6);
  });
});
