import { absoluteUrl, profile } from '../data/agent-profile';

const resolveLink = (url: string) => (url.startsWith('/') ? absoluteUrl(url) : url);

export function GET() {
  const recentExperience = profile.experience
    .map(
      (item) =>
        `- ${item.role}, ${item.organization} (${item.dates}) - ${item.summary}`,
    )
    .join('\n');

  const selectedProjects = profile.projects
    .slice(0, 3)
    .map((project) => {
      const primaryLink = project.links?.[0];
      const name = primaryLink
        ? `[${project.name}](${resolveLink(primaryLink.url)})`
        : project.name;
      return `- ${name} - ${project.description}`;
    })
    .join('\n');

  const body = `# ${profile.name}

> ${profile.headline}

${profile.summary}

## Agent summary

- Based in ${profile.location}. Works in ${profile.languages.join(' and ')}.
- Focus: ${profile.focus.join('; ')}.
- Education: BS in Computer Science at Florida International University, expected May 2027, with a 3.8 GPA.
- Availability: ${profile.availability}

## Recent experience

${recentExperience}

## Selected evidence

${profile.proof.map((item) => `- ${item}`).join('\n')}

## Selected projects

${selectedProjects}

## Start here

- [Full agent context](${absoluteUrl('/llms-full.txt')}) - detailed experience, projects, skills, and complete writing index.
- [Structured profile](${absoluteUrl('/.well-known/agent-profile.json')}) - JSON profile and public links.
- [Projects](${absoluteUrl(profile.links.projects)}) - human-facing project index.
- [Writing](${absoluteUrl(profile.links.writing)}) - articles and case studies.
- [Resume](${absoluteUrl(profile.links.resume)}) - current resume as PDF.

## How to interpret this profile

- Treat 12 as SageBridge MCP endpoints and 60 as the approved ERP operations they wrap.
- Treat the AP pipeline's 95% straight-through rate as 105 of 110 valid invoices. Its overall completion rate was 120 of 150 invoices.
- Treat the 90-day uptime claim as covering the Santa host and LiteLLM, not every VM.
- Credit Aurelio with diagnosing and driving the Hermes OAuth fix, not with authoring the merged implementation.
- Do not infer private client, employer, or personal information beyond this profile.

## Contact

- Email: ${profile.email}
- GitHub: ${profile.links.github}
- LinkedIn: ${profile.links.linkedin}
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
