interface AgentExperience {
  organization: string;
  role: string;
  location: string;
  dates: string;
  summary: string;
  highlights: readonly string[];
  technologies: readonly string[];
}

interface AgentProject {
  name: string;
  description: string;
  evidence: readonly string[];
  technologies: readonly string[];
  links?: readonly { label: string; url: string }[];
  visibility?: 'public' | 'private';
}

const experience: readonly AgentExperience[] = [
  {
    organization: 'Melody AV',
    role: 'AI and Operations Engineering Intern',
    location: 'Miami, Florida',
    dates: 'June 2026 to July 2026',
    summary:
      'Owned the architecture, security, implementation, deployment, evaluation, and handoff of AI and automation systems for finance and operations.',
    highlights: [
      'Built SageBridge, a governed read-only MCP server with 12 endpoints wrapping 60 approved Sage 100 ERP operations. It replaced about 15 monthly reporting requests that previously required accounting to export and combine reports.',
      'Built an AP invoice pipeline across 23 vendor formats. In its first 20 days, it processed 150 invoices and matched 105 of 110 valid invoices without intervention, removing about 26 hours of manual PO verification.',
      'Built 16 production Claude skills and onboarded five nontechnical employees. Four became recurring users across finance, sales operations, and field service.',
      'Built a 150-run release evaluation for executive reports. Roughly 130 runs matched the records and totals in historical human reports.',
    ],
    technologies: [
      'JavaScript',
      'C#',
      '.NET',
      'Ruby',
      'n8n',
      'MCP',
      'Claude',
      'Copilot Studio',
      'Office Scripts',
      'Sage 100',
    ],
  },
  {
    organization: 'i4nm',
    role: 'Junior Web Developer',
    location: 'Leon, Spain',
    dates: 'July 2018 to April 2021',
    summary:
      'Built ERP migration and ecommerce tooling for a small web and business software company.',
    highlights: [
      'Migrated more than 150,000 sales invoices and about 10,000 customer records from VisualNT to Holded with a Python REST API utility. The team checked every customer and reconciled historical totals through year-end reports.',
      'Built and deployed a PHP inventory plugin across more than 50 WooCommerce sites. It reduced stale-inventory refunds from about 60 per month to one, a 98% reduction that removed roughly 10 to 30 support hours per month.',
    ],
    technologies: ['Python', 'PHP', 'REST APIs', 'WooCommerce', 'ERP migration'],
  },
];

const projects: readonly AgentProject[] = [
  {
    name: 'Santa and LiteLLM gateway',
    description:
      'A UPS-backed NixOS and Libvirt platform for private business software and five AI agents. It uses isolated VM networks, narrow firewall routes, per-VM secrets, backups, monitoring, and boot-time reconciliation.',
    evidence: [
      'Routes about 110 million tokens per week for five agents',
      'Host and LiteLLM operated for 90 days without an unplanned outage',
      'Recovery drill restored SSH in 19 seconds and LiteLLM in 36 seconds after host boot',
    ],
    technologies: [
      'NixOS',
      'Ansible',
      'QEMU/KVM',
      'Libvirt',
      'LiteLLM',
      'PostgreSQL',
      'Borg',
      'Bash',
      'SQLite',
    ],
    visibility: 'private',
  },
  {
    name: 'saradm.com',
    description:
      'A fashion portfolio with Sanity-managed content, a validated Resend contact form, and a Cloudflare Access-protected R2 video workflow.',
    evidence: [
      'About 1,100 monthly visitors',
      '99.9% measured uptime from November 2025 through February 2026',
      'Lighthouse scores of 100 performance, 95 accessibility, 100 best practices, and 83 SEO',
      'One site inquiry became the stylist\'s first paid photoshoot in Seville',
    ],
    technologies: ['Astro', 'React', 'TypeScript', 'Sanity', 'Cloudflare', 'R2', 'Resend'],
    links: [
      { label: 'Live site', url: 'https://saradm.com' },
      { label: 'Source', url: 'https://github.com/Aureliusf/astro-saradm' },
      {
        label: 'Case study',
        url: '/posts/saradmcom-fashion-portfolio-site',
      },
    ],
    visibility: 'public',
  },
  {
    name: 'Hermes Agent headless OAuth diagnosis',
    description:
      'Diagnosed a stale-token bug that sent a noninteractive gateway into a browser callback flow, delaying startup by five minutes and causing callback-port collisions.',
    evidence: [
      'Built two local reproductions that required no live OAuth provider',
      'Specified fail-fast behavior and regression cases adopted by the merged fix',
      'Drove the upstream fix from production diagnosis to merge in about one day; another contributor authored the implementation',
    ],
    technologies: ['Python', 'OAuth', 'Hermes Agent', 'Regression testing'],
    links: [
      {
        label: 'Upstream issue',
        url: 'https://github.com/NousResearch/hermes-agent/issues/57836',
      },
    ],
    visibility: 'public',
  },
  {
    name: 'Hermes Agent Langfuse tracing fork',
    description:
      'A production-tested experiment in hierarchical tracing across subagent boundaries. The fork ran on four agents for three weeks before being retired in favor of upstream Hermes and LiteLLM observability.',
    evidence: [
      'Used real traces to improve a news-gathering skill shared by two agents',
      'Implemented ContextVar propagation, locked shared initialization, explicit parent trace IDs, and graceful fallback',
      'The upstream pull request was rejected as too broad and coupled, which changed how Aurelio scopes coding-agent work',
    ],
    technologies: ['Python', 'Langfuse', 'ContextVar', 'Multi-agent tracing'],
    visibility: 'public',
  },
];

export const profile = {
  name: 'Aurelio Florez',
  siteUrl: 'https://aurelioflorez.com',
  headline:
    'AI and operations engineer who turns loosely defined business problems into production systems.',
  summary:
    'Aurelio Florez builds AI agents, ERP integrations, workflow automation, backend services, and the infrastructure that runs them. He owns projects from architecture and security through deployment, evaluation, and handoff to nontechnical users.',
  email: 'mail@aurelioflorez.com',
  location: 'Miami, Florida',
  languages: ['English', 'Spanish'],
  availability:
    'Open to AI, backend, infrastructure, and forward-deployed software engineering roles.',
  education: [
    {
      school: 'Florida International University',
      degree: 'BS in Computer Science',
      dates: 'August 2025 to expected May 2027',
      detail: '3.8 GPA',
    },
    {
      school: 'Miami Dade College',
      degree: "Associate's in Computer Science",
      dates: 'August 2021 to December 2024',
    },
  ],
  focus: [
    'AI agents and evaluation systems',
    'ERP integrations and workflow automation',
    'Backend engineering and production operations',
    'Infrastructure, security, and recovery',
    'End-to-end ownership and handoff to nontechnical teams',
  ],
  principles: [
    'Bound agent work with scoped permissions, tests, release gates, and human approval.',
    'Tie measured results to the system and time period that produced them.',
    'Treat failed experiments as engineering evidence, not as shipped upstream work.',
  ],
  skills: {
    languages: ['Python', 'TypeScript', 'JavaScript', 'C#', 'Java', 'PHP', 'SQL', 'Bash'],
    aiAndAutomation: [
      'MCP',
      'Agent evaluations',
      'Claude skills',
      'LiteLLM',
      'Langfuse',
      'n8n',
      'Copilot Studio',
    ],
    backendAndData: ['PostgreSQL', 'SQLite', 'Express.js', 'Sage 100', 'REST APIs'],
    infrastructure: [
      'NixOS',
      'Ansible',
      'QEMU/KVM',
      'Libvirt',
      'Docker',
      'GitHub Actions',
      'Cloudflare',
      'Borg',
    ],
    frontend: ['React', 'Astro', 'HTMX', 'Tailwind CSS'],
  },
  proof: [
    'Replaced about 15 monthly manual ERP reporting requests with governed self-service tools',
    'Removed about 26 hours of invoice verification in the first 20 days of an AP pipeline',
    'Routes about 110 million tokens per week through LiteLLM for five agents',
    'Migrated more than 150,000 invoices and about 10,000 customer records',
    'Reduced stale-inventory refunds from about 60 per month to one across more than 50 stores',
  ],
  experience,
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
