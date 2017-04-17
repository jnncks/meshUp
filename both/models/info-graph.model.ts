import { Edge } from './edge.model';
import { Node } from './node.model';

export interface InfoGraph {
  _id?: string;
  metaId: string;
  nodes?: Node[];
  edges?: Edge[];
}
