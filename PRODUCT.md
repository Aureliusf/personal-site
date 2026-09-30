# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro 7 static site, Tailwind 3, MDX content collection (`src/content/posts`). Deployed as static output; `static/` is copied to `public/` before build/dev.

## Purpose

Personal site of Aurelio Florez, an AI and operations engineer in Miami. It exists to get him hired into AI, backend, infrastructure, or forward-deployed engineering roles, and to host his technical writing.

## Primary visitor

An engineering hiring manager or senior engineer sizing Aurelio up (confirmed). They want fast evidence that he ships production systems end to end: from an unclear problem through architecture, deployment, evaluation, and handoff to nontechnical users. Secondary visitors are readers arriving on individual posts, and AI agents reading `/llms.txt` and `/.well-known/agent-profile.json`.

## Positioning

- Interested in AI agents that do bounded, reversible work; the evals and infrastructure around them; workflow automation that removes manual steps.
- Principles: bound agent work with scoped permissions, tests, release gates, human approval. Tie measured results to the system and time period that produced them. Treat failed experiments as engineering evidence.
- Voice in posts: first person, concrete, numbers-first, candid about failures, dry humor.

## Evidence (source of truth: `src/data/agent-profile.ts`)

All claims and numbers come from `agent-profile.ts` and post frontmatter. Do not invent metrics, clients, or testimonials.

## Durable constraints

- Keep all routes: `/`, `/projects`, `/archives`, `/about`, `/posts/*`, `/tags/*`, `/resume.pdf`, `/rss.xml`, `/llms.txt`, `/llms-full.txt`, `/.well-known/agent-profile.json`, `/sitemap.xml`, `/robots.txt`.
- Keep the JSON-LD Person schema and agent-readable links in the head.
- Contact: mail@aurelioflorez.com; GitHub aureliusf; LinkedIn aurelioflorez; X @aurelioflorez.

## Anti-references (confirmed)

- Generic dev portfolio: "Hi, I'm X" hero, card grid, skill badges.
- Hype or marketing tone: big claims, gradients, glow.
- Heavy motion that gets in the way of reading.
- A "money site": saturated hero fields, stat rows, and pitch copy with no soul (feedback on the first redesign, 2026-09-30). The site should be tasteful, intentional, and sound like Aurelio.

## Brand commitments

None carried from the previous design (confirmed: old Gruvbox look, toggle, and terminal cursor are not required).
