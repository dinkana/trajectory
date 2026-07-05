export interface Resource {
  title: string;
  url: string;
  type: 'video' | 'article' | 'course' | 'docs' | 'tool' | 'book';
}

export interface SkillNode {
  id: string;
  title: string;
  description?: string;
  x: number;
  y: number;
  color?: string;
  resources?: Resource[];
  cheatsheet?: string;
  timeHours?: number;
}

export interface SkillEdge {
  id: string;
  from: string;
  to: string;
}

export interface SkillTree {
  id: string;
  title: string;
  description?: string;
  nodes: SkillNode[];
  edges: SkillEdge[];
}

export type Theme = 'light' | 'dark' | 'system';
export type Locale = 'ru' | 'en';