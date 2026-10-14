import { z } from 'zod';

const basicsFieldSchema = z.enum(['email', 'phone', 'location', 'website', 'linkedin', 'github']);

const bulletSchema = z.object({
  id: z.string(),
  text: z.string(),
  tags: z.array(z.string()).optional().default([]),
  selected: z.boolean().optional().default(true),
  aiGenerated: z.boolean().optional(),
});

const educationSchema = z.object({
  id: z.string(),
  school: z.string(),
  location: z.string(),
  degree: z.string(),
  dates: z.string(),
  bullets: z.array(bulletSchema),
  selected: z.boolean().optional().default(true),
});

const experienceSchema = z.object({
  id: z.string(),
  company: z.string(),
  role: z.string(),
  location: z.string(),
  bullets: z.array(bulletSchema),
  startDate: z.string(),
  endDate: z.string(),
});

const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  technologies: z.array(z.string()),
  bullets: z.array(bulletSchema),
  startDate: z.string(),
  endDate: z.string(),
  url: z.string().optional(),
  selected: z.boolean().optional().default(true),
});

const skillCategorySchema = z.object({
  category: z.string(),
  items: z.array(z.string()),
  selected: z.boolean().optional().default(true),
});

const basicsSchema = z.object({
  name: z.string(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  location: z.string().optional().or(z.literal('')),
  website: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  summary: z.string().optional().or(z.literal('')),
  hiddenFields: z.array(basicsFieldSchema).optional().default([]),
});

export const resumeSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  version: z.number().default(1),
  basics: basicsSchema,
  education: z.array(educationSchema),
  experience: z.array(experienceSchema),
  projects: z.array(projectSchema),
  skills: z.array(skillCategorySchema),
});
