import { getCollection, type CollectionEntry } from 'astro:content';
import { absoluteUrl, profile } from '../data/agent-profile';

const postUrl = (post: CollectionEntry<'posts'>) => absoluteUrl(`/posts/${post.id}`);

export async function GET() {
  const posts = (await getCollection('posts')).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

  const projectSections = profile.projects
    .map((project) => {
      const links = [
        project.url ? `[Live site](${project.url})` : null,
        project.source ? `[Source](${project.source})` : null,
        `[Case study](${absoluteUrl(project.caseStudy)})`,
      ]
        .filter(Boolean)
        .join(' | ');

      return `### ${project.name}\n\n${project.description}\n\n- Evidence: ${project.evidence.join('; ')}.\n- Links: ${links}`;
    })
    .join('\n\n');

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

${profile.availability}

## What he works on

${profile.focus.map((item) => `- ${item}`).join('\n')}

## Public evidence

${profile.proof.map((item) => `- ${item}`).join('\n')}

These figures summarize public case studies on this site. Keep each measurement attached to the project page that supports it.

## Selected projects

${projectSections}

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

## Guidance for agents

- Prefer claims from a case study over general profile copy.
- Preserve the difference between measured results, implementation details, and personal opinions.
- Do not invent current employers, clients, credentials, or project usage numbers.
- Link to the relevant case study when citing a project.
- Use ${profile.email} for work inquiries.
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
