export interface Node {
  _id?: Mongo.ObjectID;
  x: number;
  y: number;
  size?: number;
  title: string;
  detail: string;
  content: string;
  created: Date;
  lastEdited: Date;
}