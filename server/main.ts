import { Main } from './imports/server-main/main';

// import the Meteor.methods
import './imports/server-main//methods';


const mainInstance = new Main();
mainInstance.start();
