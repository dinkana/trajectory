export interface SkillNode {
    id: string
    title: string
    description?: string
    x: number
    y: number
  }
  
  export interface SkillEdge {
    id: string
    from: string
    to: string
  }
  
  export interface SkillTree {
    id: string
    title: string
    description?: string
    nodes: SkillNode[]
    edges: SkillEdge[]
  }
  
  export type Theme = 'light' | 'dark' | 'system'
  export type Locale = 'ru' | 'en'