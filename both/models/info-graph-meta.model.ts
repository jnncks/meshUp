import { InfoGraph, InfoGraphCategory, User } from './';

export interface InfoGraphMeta {
  _id?: string;
  name: string;
  description?: string;
  tags?: string[];
  owner: string;
  collaborators: string[];
  created: Date;
  lastUpdated: Date;
  categoryId?: string;
}
