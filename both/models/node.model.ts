export interface Node {
  _id?: string;
  x: number;
  y: number;
  //size?: number;
  title: string;
  content: string;
  tags?: string[];
  creator?: string;
  created: Date;
  lastUpdated: Date;
}