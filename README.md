# meshUp
An app for visual-spatial exploration of graph-based information networks (like _Mind Maps_ or _Concept Maps_).

## Installation
Make sure you have [Meteor 1.4](https://www.meteor.com/install) and a current node.js version installed. If so, you can skip (1.) and (2.), as well as the optional (3.).

1. Download and install node.js from [nodejs.org](https://nodejs.org/).
2. Install Meteor 1.4 from [meteor.com/install](https://www.meteor.com/install).
3. (Optional) Install yarn for faster packet installation: `npm install -g yarn`.
4. Run `npm install` or `yarn install` (preferred) inside this directory.
5. Run Meteor initially to install the required Meteor packets: `npm run start`. 


## Usage

### NPM Scripts
This project comes with predefined NPM scripts, defined in the `package.json`:

- `npm run start` - Run the Meteor application.
- `npm run start:prod` - Run the Meteor application in production mode.
- `npm run build` - Creates a Meteor build version under `./build/` directory.
- `npm run clear` - Resets Meteor's cache and clears the MongoDB collections.
- `npm run meteor:update` - Updates Meteor's version and it's dependencies.
- `npm run test` - Executes Meteor in test mode with Mocha.
- `npm run test:ci` - Executes Meteor in test mode with Mocha for CI (run once).

### Using the app
The server will be running on port 3000. If the server is running on your machine, simply connect to `http://localhost:3000` in your browser. Oherwise, you may connect to the server's IP on the same port.


## Package Contents
This package contains:

- TypeScript support (with `@types`) and Angular 2 compilers for Meteor
- Angular2-Meteor
- Angular 2 (core, common, compiler, platform, router, forms)
- SASS, LESS, CSS support (aso supports styles encapsulation for Angular 2)
- Testing with Mocha and Chai
- [Meteor-RxJS](http://angular-meteor.com/meteor-rxjs/) support and usage
- D3.js for interactive visualizations


## Folder Structure
The folder structure is a mix between the [Angular 2 recommendation](https://johnpapa.net/angular-2-styles/) and the [Meteor recommendation](https://guide.meteor.com/structure.html).

### Client
The `client` folder contains a single TypeScript (`.ts`) file which is the main file (`/client/main.ts`), and bootstraps the Angular 2 application (`/client/imports/app/app.module.ts`).

The `index.html` file is the main HTML document which loads the application by using the main component selector (`<app>`).

All the other client files are under `client/imports/app` and organized by the context of the components.


### Server
The `server` folder contains a single TypeScript (`.ts`) file which is the main file (`/server/main.ts`).
All other server files should be located under `/server/imports`, thus the `/server/main.ts` imports methods, publications and also dummy data from `/server/imports/server-main`.


### Common
Common files in the app are the MongoDB collections and models - they are located under `/both/collections/` and `/both/models/` and can be imported from both client and server code.


## Testing
The testing environment in this boilerplate is based on [Meteor recommendations](https://guide.meteor.com/testing.html), and uses Mocha as testing framework along with Chai for assertion.

There is a main test file that initializes the Angular 2 tests library, it's located under `/client/init.test.ts`.

All other test files are located near the component/service it tests, with the `.test.ts` extension. [WIP]


## Debugging
For an overview about the Mongo data collections, this package provides Mongol.
When running the client you may use `Ctrl + M` in the Browser to open Mongol for an overview about the collections.


## Credits
Based on [Urigo's Angular2-Meteor Boilerplate](https://github.com/Urigo/angular2-meteor-base).