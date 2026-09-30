import { getCollection, type CollectionEntry } from 'astro:content';

/** Screenshots for projects that have one. */
export const projectImages: Record<string, { src: string; webp: string; alt: string }> = {
  'saradm.com': {
    src: '/images/saradm-preview.png',
    webp: '/images/webp/saradm-preview.webp',
    alt: 'saradm.com: a grid of editorial fashion photographs under the heading “Todos mis Proyectos”',
  },
  ResumeQuiver: {
    src: '/images/resumequiver-preview.png',
    webp: '/images/webp/resumequiver.webp',
    alt: 'ResumeQuiver editor with bullet library, live resume preview, and YAML editor side by side',
  },
};

export const sortedPosts = async () =>
  (await getCollection('posts')).sort(
    (a: CollectionEntry<'posts'>, b: CollectionEntry<'posts'>) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

export const formatDate = (date: Date, style: 'month' | 'long' | 'short' = 'short') =>
  date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: style === 'long' ? 'long' : 'short',
    day: style === 'month' ? undefined : 'numeric',
    timeZone: 'UTC',
  });

export const readingMinutes = (body: string | undefined) => {
  const words = (body ?? '').replace(/```[\s\S]*?```/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
};

export const isExternal = (url: string) => /^https?:\/\//.test(url);

/** Short project name from a post title like "Prompt-chess - Tmux Overlay for Opencode". */
export const shortTitle = (title: string) => title.split(' - ')[0];

/** One line from each post, in the post's own words. */
export const pullQuotes: Record<string, string> = {
  'firecrawl-vs-playwright': 'The most expensive zero I’ve ever shipped.',
  resumequiver: 'Resume tools usually force a choice: fight Word formatting or pay $20/month for generic AI buzzwords.',
  'prompt-chess': 'Chess is the perfect antidote to AI slop.',
  'nixos-fixing-unstable-packages': 'New features arrive daily, but nixpkgs can take weeks to update.',
  'tunneling-solutions': 'I use all four in my own homelab!',
  markdown2paper: 'Going back to Word sounded like the worst that could ever happen to me.',
  nixos: 'Something my father could actually use without IT support.',
  'saradmcom-fashion-portfolio-site': 'This isn’t “zero DevOps.” It is “right-sized DevOps.”',
  'spotify-analyzer': 'One of my first Python projects.',
};

const hues = ['red', 'green', 'yellow', 'blue', 'purple', 'aqua', 'orange'];

/** A stable Gruvbox hue per tag, so a topic keeps its color everywhere. */
export const tagHue = (tag: string) => {
  let h = 0;
  for (const ch of tag.toLowerCase()) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return `var(--gb-${hues[h % hues.length]})`;
};
