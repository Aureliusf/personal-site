import { getCollection } from 'astro:content';
import { absoluteUrl } from '../data/agent-profile';

const escapeXml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

export async function GET() {
  const posts = await getCollection('posts');
  const tags = [...new Set(posts.flatMap((post) => post.data.tags || []))];

  const staticPaths = [
    '/',
    '/about',
    '/projects',
    '/archives',
    '/llms.txt',
    '/llms-full.txt',
    '/.well-known/agent-profile.json',
    '/rss.xml',
  ];

  const urls = [
    ...staticPaths.map((path) => ({ url: absoluteUrl(path) })),
    ...posts.map((post) => ({
      url: absoluteUrl(`/posts/${post.id}`),
      lastmod: post.data.date.toISOString().slice(0, 10),
    })),
    ...tags.map((tag) => ({ url: absoluteUrl(`/tags/${encodeURIComponent(tag)}`) })),
  ].sort((a, b) => a.url.localeCompare(b.url));

  const entries = urls
    .map(
      ({ url, lastmod }) =>
        `  <url>\n    <loc>${escapeXml(url)}</loc>${
          lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''
        }\n  </url>`,
    )
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
