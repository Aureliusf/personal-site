---
title: "The Real Cost of Browser Tools: 59K Tokens vs $0.027 for Headlines"
description: "I fetched content from 16 different news sites with Playwright and Firecrawl. Here's what I found and the real cost"
date: 2026-06-09
tags: ["Firecrawl", "Playwright", "AI-Agents", "Context-Engineering"]
featured: true
highlight: "~50x cheaper per run · anti-bot without the model in the loop"
---

I run a news cronjob inside Hermes-Agent. 17 sources, headlines and links, summarized every morning. Glorified RSS, and that's exactly the point.

The cron has been running on Playwright for months. It works, most times. The question that nagged me was the bill. Not the dollar bill. The **token bill**. Does a cron job that grabs headlines really need to burn 49K tokens per run?

## The Most Expensive Zero I've Ever Shipped

The worst case in the data was an El País fetch via Playwright:

> **Playwright: 89,973 input tokens, 4,106 output tokens, 7 turns, 0 characters delivered.**

The browser hit DataDome. Three browser calls returned nothing. The agent fell back to `curl` four more times, eventually landing on the Wayback Machine. 95K tokens later, serving last week's headlines. The agent had no idea the content was stale. The session shipped 90,000+ tokens and the user got outdated articles *(~$0.45 at GPT-5.5 API pricing).*

The same URL on Firecrawl: **0.6 seconds, 1 call, 85,038 characters of current content delivered** for $0.027.

This wasn't an outlier. I pulled 30 days of Hermes session data and the pattern was consistent:

| Metric | With Playwright (84 sessions) | Without browser (246 sessions) | Delta |
|---|---:|---:|---:|
| **Input tokens / session** | 49,491 | 39,086 | **+27%** |
| **Output tokens / session** | 9,783 | 3,706 | **+164%** |
| **Total / session** | **59,274** | **42,792** | **+38%** |
| Tool calls / session | 23.4 | 12.5 | +87% |
| Sessions in 30 days | 84 | 246 | — |

Same tasks. Same agent. The only difference was the browser in the loop, and it cost **38% more tokens per run** with **87% more tool calls**.

The 84 Playwright sessions fired **1,586 browser tool calls** (`browser_navigate`, `browser_console`, `browser_snapshot`). Every one of those returns a DOM snapshot or accessibility tree into the model's context window. The agent wanted maybe 200 tokens of headline data. The round-trip was 30,000+.

For an agent that *needs* to reason about the page (login flows, multi-step forms, visual decisions), this is fine. Playwright is also the right call when you're fetching unknown sites where the layout may be different every time and the agent needs to adapt on the fly. I'm not exploring browser security concerns here because my cron only fetches trusted sources, but that's another axis where the browser-in-the-loop model matters. For a cron job fetching known headlines at 7am, it's an overpowered mess.

This case sent me down the rabbit hole and into a head-to-head benchmark.

---

## The Benchmark Setup

I built a set of evals mirroring the tasks in my Hermes news cronjob. 5 different categories aimed at different information with multiple target websites. Text based, search and collect, Interaction, Blockers and Structured information.

| # | Case | What it tests |
|---|---|---|
| 01 | **Simple fetch** | Gothamist, Hell Gate, City Limits, CoinDesk, El País |
| 02 | **Search + collect** | News searches for XRP, Bitcoin, NYC Mayor |
| 03 | **Interaction** | Wikipedia forms, multi-step navigation |
| 04 | **Anti-bot protection** | El País (DataDome), Politico (Cloudflare) |
| 05 | **Structured data** | CoinMarketCap, CoinGecko, Realtor.com |


17 tests total. Each ran **the same fetch twice**: once via Playwright, once via Firecrawl. Same target, same goal, two different execution paths.

The full test ran 10 times across 10 hours to avoid rate limits and produce a more significant result. In total 340 jobs were ran. Playwright and Firecrawl runs were interleaved to avoid time-of-day bias. No meaningful content differences were observed between runs (no new headlines appeared during the test window).

---

## The Results

| # | Case | Playwright Avg Time | Firecrawl Avg Time | Playwright Avg Tokens | Firecrawl Avg Tokens |
|---|---:|---:|---:|---:|---:|
| 01 | Simple fetch | 55.5s* | 11.4s | ~49K in / ~10K out | 0 (no agent) |
| 02 | Search + collect | 5.2s | 4.2s | ~49K in / ~10K out | 0 (no agent) |
| 03a | Interaction (no CAPTCHA) | 176s | 128s | ~176K in / ~5.8K out | ~7.7K in / ~5.8K out |
| 03b | Interaction (w/ CAPTCHA) | — | 128s | ~763K in / ~5.8K out | ~62K total |
| 04 | Anti-bot protection | 4.3s | 0.6s | ~49K in / ~10K out | 0 (no agent) |
| 05 | Structured data | 7.1s | 4.0s | ~49K in / ~10K out | 0 (no agent) |


**Speed:** Firecrawl averaged **29.6s/category** (148.2s total) vs Playwright's **41.0s/category** (205.1s total), about **1.4x faster** overall. For simple unblocked fetches (cases 01 and 02), Playwright is perfectly adequate. 2 or 3 calls, no anti-bot to navigate, job done. Firecrawl adds latency and a credit cost for no upside in those cases. The speed advantage comes from anti-bot and interaction scenarios.

**Anti-bot coverage:** Firecrawl walked through DataDome and Cloudflare with no config. Playwright headless got blocked on both.

**Tokens:** Across all 5 categories, Playwright burned **~800K+ total tokens** vs Firecrawl's **~13.5K**, a **~60x difference**. In the Interaction case, the only one where both tools used an agent, Playwright consumed **~176K input tokens** (no CAPTCHA) to Firecrawl's **~7.7K** (~23x fewer), while output tokens were identical (~5.8K each). With CAPTCHA protection, Playwright's interaction cost balloons to **~763K** vs Firecrawl's **~62K**, still a 12x gap in the scenario where you'd expect Playwright to have the edge.

For the other 4 categories, Firecrawl ran in `no_agent` mode. The extraction executes without invoking an LLM, writing results directly to disk. The agent reads a 200-token summary instead of a 70K-character page, so those sessions cost **zero LLM tokens**. Playwright spent ~59K every time.

The key insight isn't that Firecrawl uses fewer tokens per call. It's that Firecrawl's reliability makes the `no_agent` pattern viable. When Playwright hits anti-bot protection mid-fetch, you need the model in the loop to recover. When Firecrawl handles it transparently, you can run the fetch outside the context window entirely.


---

## The Real Headline: 4x Faster, but Tokens Are the Real Cost

Speed is the shiny number. Tokens are the number that actually hits the bill.

From the same-task El País test:

- **Playwright:** 89,973 input tokens, 7 turns, landed on Wayback Machine with stale content
- **Firecrawl:** 0.6s, 1 credit, 85,038 chars of **current** content delivered

In `no_agent` mode, the browser doesn't go through the model's context at all. Firecrawl writes the result to disk and the agent reads a 200-token summary, not a 70K-character page. The model gets the headline, not the DOM.

Two possible outcomes for the El País cron, depending on whether Firecrawl stays in the agent loop:

| Pattern | Input tokens / session | Cost |
|---|---:|---:|
| Playwright in agent loop | ~59,274 (avg) | LLM rates apply |
| Firecrawl in agent loop | ~35,000 (estimated) | LLM rates + $0.0032/credit |
| Firecrawl as `no_agent` script | **0** | $0.0032/credit only |

The third row is the one that scales. The El País cron is already running on it.

---

## What I Did With the Numbers

The same daily workload, two price tags:

| Pattern | Cost / day | Cost / month |
|---|---:|---:|
| Playwright in agent loop | ~$0.42 (LLM tokens) | $3–8 |
| Firecrawl `no_agent` | **~$0.002** (credits only) | **$0.06** |

Firecrawl pricing: $16/month for 5,000 credits at the Hobby tier (~$0.0032/credit, ~1.18 credits per visit). The Playwright figure is input tokens alone. Output tokens and failed retries add more. 

---


## Lessons Learned

**Context is the real cost.** Runtime cost is a rounding error. Context cost is the line item that grows without you noticing. Any time you can do work *outside* the model's context window, you should.

**The right tool depends on whether the model needs to see the page, and whether the site will let it.** For visual decisions, Playwright. For simple fetches, Firecrawl outside the loop. The recovery loop is where the tokens pile up.

**From hunch to evals.** I assumed Playwright was "fast enough" and that per-visit costs were unavoidable. Instead of migrating on a feeling, I built evals, ran 340 jobs, and let the numbers decide. The data changed my architecture, not just my tool.


---

## What's Next

A few things on the migration roadmap:

- **Webhook-based fetches**: recently introduced, instead of polling, let Firecrawl call me when a page changes.
- **Add a fallback chain**: Firecrawl first, then Playwright only if Firecrawl's anti-bot coverage misses something. The order matters.

The pattern that scaled this was simple: **anything the model doesn't need to read, the model should not be reading.**

---

## Postscript: Optimization: The Skill That Compounds

Right now, most of us are running LLM agents on flat-rate subscriptions (Codex, Claude Code, Cursor, and many more). The per-token cost is invisible. We feel the latency, the rate limits, the context rot, but not the bill.

It looks subsidized today. It may not last forever.

The unit economics of frontier inference probably don't survive flat-rate at the current quality bar. If the subsidies end, the agents that scale will be the ones that already learned to *not* call the model when the model isn't needed.

A cron job that fetches a headline, writes a row, and exits is not really an LLM task. Treating it like one was convenient when tokens were free. That calculation may change.

The migration above is one example. The principle is older: **learn where the model earns its keep, and don't pay for it anywhere else.** That's a skill that compounds regardless of what the pricing page says next year.

