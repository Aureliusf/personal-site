export interface Bullet {
  id: string;
  text: string;
  tags?: string[];
  selected?: boolean;
  aiGenerated?: boolean;
}

export type BasicsField = 'email' | 'phone' | 'location' | 'website' | 'linkedin' | 'github';

export interface Education {
  id: string;
  school: string;
  location: string;
  degree: string;
  dates: string;
  bullets: Bullet[];
  selected?: boolean;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  location: string;
  bullets: Bullet[];
  startDate: string;
  endDate: string;
}

export interface Project {
  id: string;
  name: string;
  technologies: string[];
  bullets: Bullet[];
  startDate: string;
  endDate: string;
  url?: string;
  selected?: boolean;
}

export interface SkillCategory {
  category: string;
  items: string[];
  selected?: boolean;
}

export interface Basics {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  summary?: string;
  hiddenFields?: BasicsField[];
}

export interface Resume {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  basics: Basics;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: SkillCategory[];
}
