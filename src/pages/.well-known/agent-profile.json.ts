import { absoluteUrl, profile } from '../../data/agent-profile';

export function GET() {
  const body = {
    schemaVersion: '1.0',
    canonicalUrl: absoluteUrl('/.well-known/agent-profile.json'),
    updatedFrom: 'public site content',
    person: {
      name: profile.name,
      url: profile.siteUrl,
      headline: profile.headline,
      summary: profile.summary,
      email: profile.email,
      availability: profile.availability,
      sameAs: [profile.links.github, profile.links.linkedin, profile.links.x],
    },
    focus: profile.focus,
    evidence: profile.proof,
    projects: profile.projects.map((project) => ({
      ...project,
      caseStudy: absoluteUrl(project.caseStudy),
    })),
    resources: {
      llms: absoluteUrl('/llms.txt'),
      llmsFull: absoluteUrl('/llms-full.txt'),
      projects: absoluteUrl(profile.links.projects),
      writing: absoluteUrl(profile.links.writing),
      resume: absoluteUrl(profile.links.resume),
      rss: absoluteUrl(profile.links.rss),
    },
    usageNotes: [
      'Treat public project pages as canonical.',
      'Keep measured results attached to the project that reports them.',
      'Do not infer private client, employer, or personal information.',
    ],
  };

  return new Response(JSON.stringify(body, null, 2) + '\n', {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
