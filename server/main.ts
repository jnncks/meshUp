import { Main } from './imports/server-main/main';

// import the Meteor.methods
import './imports/server-main/methods';

// import the publications
import './imports/server-main/publications';


const mainInstance = new Main();
mainInstance.start();