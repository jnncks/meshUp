export interface Node {
  _id?: Mongo.ObjectID;
  x: number;
  y: number;
  //size?: number;
  title: string;
  //detail: string;
  content: string;
  tags: string[];
  creator: Mongo.ObjectID;
  creationDate: Date;
  lastEdited: Date;
}