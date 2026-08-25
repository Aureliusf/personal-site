import { absoluteUrl, profile } from '../../data/agent-profile';

export function GET() {
  const body = {
    schemaVersion: '1.0',
    canonicalUrl: absoluteUrl('/.well-known/agent-profile.json'),
    updatedFrom: 'curated career context, resume, and public site content',
    person: {
      name: profile.name,
      url: profile.siteUrl,
      headline: profile.headline,
      summary: profile.summary,
      email: profile.email,
      location: profile.location,
      languages: profile.languages,
      availability: profile.availability,
      education: profile.education,
      sameAs: [profile.links.github, profile.links.linkedin, profile.links.x],
    },
    focus: profile.focus,
    principles: profile.principles,
    skills: profile.skills,
    evidence: profile.proof,
    experience: profile.experience,
    projects: profile.projects.map((project) => ({
      ...project,
      links: project.links?.map((link) => ({
        ...link,
        url: link.url.startsWith('/') ? absoluteUrl(link.url) : link.url,
      })),
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
      'Keep measured results attached to the system and time period that produced them.',
      'Distinguish SageBridge MCP endpoints from the ERP operations they wrap.',
      'Do not claim Aurelio authored the merged Hermes OAuth implementation.',
      'Do not infer private client, employer, or personal information beyond this profile.',
    ],
  };

  return new Response(JSON.stringify(body, null, 2) + '\n', {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
