interface AgentProject {
  name: string;
  url?: string;
  caseStudy: string;
  source?: string;
  description: string;
  evidence: readonly string[];
}

const projects: readonly AgentProject[] = [
  {
    name: 'saradm.com',
    url: 'https://saradm.com',
    caseStudy: '/posts/saradmcom-fashion-portfolio-site',
    source: 'https://github.com/Aureliusf/astro-saradm',
    description:
      'A fashion portfolio built with Astro, React, Sanity, and Cloudflare, with a custom CMS and serverless contact form.',
    evidence: ['1,100+ monthly visitors', '99.9% uptime', '100 Lighthouse score'],
  },
  {
    name: 'ResumeQuiver',
    url: 'https://resume-quiver.vercel.app',
    caseStudy: '/posts/resumequiver',
    source: 'https://github.com/Aureliusf/resumequiver',
    description:
      'A privacy-first YAML resume builder with bullet management, bring-your-own-key AI copywriting, PDF export, and Sentry observability.',
    evidence: ['TypeScript and React', 'BYOK AI', 'Vercel and Sentry'],
  },
  {
    name: 'Markdown2Paper',
    source: 'https://github.com/Aureliusf/Markdown2Paper',
    caseStudy: '/posts/markdown2paper',
    description:
      'An Obsidian plugin that converts Markdown notes to formatted PDFs, shipped as a three-hour MVP.',
    evidence: ['Three hours to MVP', 'TypeScript and jsPDF'],
  },
  {
    name: 'prompt-chess',
    source: 'https://github.com/Aureliusf/prompt-chess',
    caseStudy: '/posts/prompt-chess',
    description:
      'A terminal-native chess overlay that appears while OpenCode is working.',
    evidence: ['TypeScript and React', 'Event-driven terminal UI'],
  },
];

export const profile = {
  name: 'Aurelio Florez',
  siteUrl: 'https://aurelioflorez.com',
  headline: 'Software engineer focused on reliable systems, from frontend to infrastructure.',
  summary:
    'Aurelio Florez builds and operates production web applications. His work covers product development, CI/CD, observability, infrastructure, and practical AI-assisted workflows.',
  email: 'mail@aurelioflorez.com',
  availability:
    'Open to software engineering roles with end-to-end ownership across product and infrastructure.',
  focus: [
    'Reliable production web applications',
    'End-to-end feature ownership',
    'CI/CD, observability, and error handling',
    'AI-assisted development and bounded agent workflows',
    'Self-hosted and cloud infrastructure',
  ],
  proof: [
    'Production work serving 1,100+ monthly users',
    '99.9% measured uptime',
    '100 Lighthouse scores',
  ],
  projects,
  links: {
    github: 'https://github.com/aureliusf',
    linkedin: 'https://www.linkedin.com/in/aurelioflorez/',
    x: 'https://twitter.com/aurelioflorez',
    resume: '/resume.pdf',
    projects: '/projects',
    writing: '/archives',
    rss: '/rss.xml',
  },
} as const;

export const absoluteUrl = (path: string) => new URL(path, profile.siteUrl).toString();
