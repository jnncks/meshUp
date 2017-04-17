import { InfoGraphMeta } from './';

export interface InfoGraphCategory {
  _id?: string;
  owner?: string;
  name: string;
  description: string;
  items?: InfoGraphMeta[];
}
