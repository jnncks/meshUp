export interface Node {
  _id?: Mongo.ObjectID;
  title: string;
  detail: string;
  content: string;
  created: Date;
  lastEdited: Date;
}