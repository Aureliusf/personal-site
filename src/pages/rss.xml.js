import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

function getExcerpt(content, maxLength = 160) {
  // Remove frontmatter
  const cleanContent = content.replace(/^---[\s\S]*?---/, '');
  // Remove markdown formatting and get plain text
  const plainText = cleanContent
    .replace(/#+ /g, '')
    .replace(/\*\*|__/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\n+/g, ' ')
    .trim();

  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength).trim() + '...';
}

export async function GET(context) {
  const posts = await getCollection('posts');
  return rss({
    title: 'Aurelio Florez',
    description: 'Software Engineer focused on reliable systems - from frontend to infrastructure.',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description || getExcerpt(post.body),
      link: `/posts/${post.slug}/`,
    })),
    customData: `<language>en-us</language>`,
  });
}
