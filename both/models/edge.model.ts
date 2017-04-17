import { Node } from './node.model';

export interface Edge {
  _id?: string;
  type?: string;
  source: string;
  target: string;
  creator?: string;
  created: Date;
}