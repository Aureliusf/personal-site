import { absoluteUrl } from '../data/agent-profile';

export function GET() {
  const body = `User-agent: *
Allow: /

# Machine-readable profile and site map
# ${absoluteUrl('/llms.txt')}
# ${absoluteUrl('/llms-full.txt')}
# ${absoluteUrl('/.well-known/agent-profile.json')}
Sitemap: ${absoluteUrl('/sitemap.xml')}
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
