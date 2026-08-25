import { getCollection, type CollectionEntry } from 'astro:content';
import { absoluteUrl, profile } from '../data/agent-profile';

const postUrl = (post: CollectionEntry<'posts'>) => absoluteUrl(`/posts/${post.id}`);
const resolveLink = (url: string) => (url.startsWith('/') ? absoluteUrl(url) : url);

export async function GET() {
  const posts = (await getCollection('posts')).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

  const experienceSections = profile.experience
    .map(
      (item) => `### ${item.role}, ${item.organization}

- Location: ${item.location}
- Dates: ${item.dates}
- Technologies: ${item.technologies.join(', ')}

${item.summary}

${item.highlights.map((highlight) => `- ${highlight}`).join('\n')}`,
    )
    .join('\n\n');

  const projectSections = profile.projects
    .map((project) => {
      const links = project.links
        ?.map((link) => `[${link.label}](${resolveLink(link.url)})`)
        .join(' | ');
      const metadata = [
        `- Technologies: ${project.technologies.join(', ')}`,
        `- Visibility: ${project.visibility === 'private' ? 'Private project' : 'Public work'}`,
        links ? `- Links: ${links}` : null,
      ]
        .filter(Boolean)
        .join('\n');

      return `### ${project.name}\n\n${project.description}\n\n${metadata}\n\n${project.evidence
        .map((evidence) => `- ${evidence}`)
        .join('\n')}`;
    })
    .join('\n\n');

  const education = profile.education
    .map(
      (item) =>
        `- ${item.degree}, ${item.school}, ${item.dates}${'detail' in item ? `, ${item.detail}` : ''}`,
    )
    .join('\n');

  const skills = Object.entries(profile.skills)
    .map(([category, items]) => `- ${category}: ${items.join(', ')}`)
    .join('\n');

  const writing = posts
    .map((post) => {
      const date = post.data.date.toISOString().slice(0, 10);
      const description = post.data.description ? ` - ${post.data.description}` : '';
      return `- ${date}: [${post.data.title}](${postUrl(post)})${description}`;
    })
    .join('\n');

  const body = `# ${profile.name}: full agent context

> ${profile.headline}

## Profile

${profile.summary}

- Location: ${profile.location}
- Languages: ${profile.languages.join(', ')}
- Availability: ${profile.availability}

## What he works on

${profile.focus.map((item) => `- ${item}`).join('\n')}

## Engineering approach

${profile.principles.map((item) => `- ${item}`).join('\n')}

## Experience

${experienceSections}

## Selected projects and open-source work

${projectSections}

## Education

${education}

## Skills

${skills}

## Writing and case studies

${writing}

## Canonical links

- Website: ${profile.siteUrl}
- Projects: ${absoluteUrl(profile.links.projects)}
- Writing archive: ${absoluteUrl(profile.links.writing)}
- RSS: ${absoluteUrl(profile.links.rss)}
- Resume: ${absoluteUrl(profile.links.resume)}
- GitHub: ${profile.links.github}
- LinkedIn: ${profile.links.linkedin}
- X: ${profile.links.x}

## Claim guardrails

- Holded migration: say the team checked every customer and reconciled year-end totals. Do not claim perfect data integrity.
- WooCommerce inventory: use the measured change from about 60 refunds per month to one, or about 98%.
- SageBridge: distinguish its 12 MCP endpoints from the 60 approved ERP operations they wrap.
- SageBridge evaluations: do not use older 1.6x accuracy or 2.2x speed claims. The supported release result is roughly 130 passing reports out of 150 runs.
- AP pipeline: 105 of 110 valid invoices matched without intervention. Across all invoices, 120 of 150 eventually completed matching.
- Santa uptime: 90 days covers the host and LiteLLM, not every VM. Do not claim automated restore testing or automated UPS shutdown.
- Hermes OAuth: Aurelio diagnosed the bug, built reproductions, wrote the regression plan, and drove the fix. Another contributor authored the merged code.
- Langfuse: describe it as a production-tested fork that was rejected upstream and retired, not as a merged contribution.
- SaraDM Lighthouse scores are 100 performance, 95 accessibility, 100 best practices, and 83 SEO.

## Contact

Use ${profile.email} for work inquiries.
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
