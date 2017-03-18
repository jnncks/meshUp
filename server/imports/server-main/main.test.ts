// chai uses as asset library
import * as chai from 'chai';
import * as spies from 'chai-spies';
import { resetDatabase } from 'meteor/xolvio:cleaner';

import { Main } from './main';
import {
  InfoNetCategoryCollection,
  InfoNetMetaCollection,
  InfoNetCollection
} from '../../../both/collections';


chai.use(spies);

    
describe('Server Main', () => {
  let mainInstance: Main;

  beforeEach(() => {
    // create an instance of main class
    mainInstance = new Main();
  });

  afterEach(() => {
    // reset the database
    resetDatabase();
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

  it('Should call insert 6 times for InfoNetCollection when init fake data', () => {
    InfoNetCollection.collection.insert = chai.spy();
    mainInstance.initFakeData();

    chai.expect(InfoNetCollection.collection.insert).to.have.been.called.exactly(6);
  });
});
