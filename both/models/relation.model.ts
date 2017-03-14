import { Node } from './node.model';

export interface Relation {
  type: string;
  nodes: Node[];
}