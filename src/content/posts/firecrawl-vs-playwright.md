---
title: "Firecrawl vs Playwright: what I learned from my news cron"
description: "I compared two news-fetching workflows for my daily cron. Here's what I learned about agent tokens, stale headlines, and the cost of fetching news."
date: 2026-06-09
tags: ["Firecrawl", "Playwright", "AI-Agents", "Context-Engineering"]
featured: true
highlight: "Routine fetching outside the agent loop, and why freshness matters"
---

I run a news cronjob inside Hermes-Agent. It fetches headlines and links from 17 sources and summarizes them every morning. Glorified RSS, and that's exactly the point.

The cron had been running on Playwright for months. I wanted to know how much of the agent's work was necessary for a routine fetch. That led to an experiment with Firecrawl, and to a more uncomfortable question: was the cron delivering current news at all?

## The fetch that returned last week's headlines

The El País session was the clearest failure:

> Playwright path: 89,973 input tokens, 4,106 output tokens, 7 turns, and 0 characters delivered by the browser fetch.

The browser hit DataDome. After three browser calls, the agent tried four `curl` calls and eventually used the Wayback Machine. The fallback returned week-old headlines without telling the user they were stale. The session used 94,079 tokens in total, including the recovery attempts. That is the cost of the whole agent path, not a Playwright API call.

For the same URL, Firecrawl returned 85,038 characters in a reported 0.6 seconds, using one call and one credit. That was a much more useful response than a block. But returned content alone doesn't establish freshness, and I hadn't built an automated check for it.

The failure here was serving archived news as today's news. A cheaper fetch wouldn't fix that on its own.

## What the 30-day session summary shows

I pulled 30 days of Hermes session data:

| Metric | With Playwright, 84 sessions | Without browser, 246 sessions | Difference |
|---|---:|---:|---:|
| Input tokens per session | 49,491 | 39,086 | +27% |
| Output tokens per session | 9,783 | 3,706 | +164% |
| Total tokens per session | 59,274 | 42,792 | +39% |
| Tool calls per session | 23.4 | 12.5 | +87% |

The browser sessions used more tokens on average, but the groups were selected by the agent's choice of tools. The agent can reach for a browser when a site or task is harder. These weren't matched tasks or randomly assigned tools, and the non-browser group isn't a Firecrawl control group. The figures describe the sessions; they don't isolate the browser's contribution or predict savings from switching tools.

The output difference needs investigation too. Browser sessions averaged about 2.64 times as many output tokens. Longer answers, more agent turns, and recovery work are possible explanations, but the aggregate summary doesn't separate them. DOM snapshots enter the model as input, so they don't directly explain the extra output.

## Two workflows in the evaluation

The test set covered five categories:

| Case | Targets or tasks |
|---|---|
| Simple fetch | Gothamist, Hell Gate, City Limits, CoinDesk, El País |
| Search and collect | News searches for XRP, Bitcoin, NYC Mayor |
| Interaction | Wikipedia forms and multi-step navigation, with separate CAPTCHA results |
| Anti-bot protection | El País with DataDome, Politico with Cloudflare |
| Structured data | CoinMarketCap, CoinGecko, Realtor.com |

There were 17 tasks, two execution paths per task, and ten repetitions across ten hours: `17 × 2 × 10 = 340` jobs. Runs were interleaved to reduce time-of-day bias. The per-run records and category aggregation rules aren't available here, so the reported averages can't be independently reconstructed.

The execution paths differed in more than the fetching tool:

- Playwright ran headless with an LLM agent choosing actions and handling recovery in every category. There was no added anti-blocking setup.
- Firecrawl ran as a `no_agent` fetch script in four categories. Only the interaction category used an agent.

This compares my existing browser-agent workflow with a mostly scripted service workflow. It changes orchestration, browser configuration, and the service handling site access at the same time.

Playwright can also run without an LLM. Its [library documentation](https://playwright.dev/docs/library) demonstrates standalone browser scripts. A fixed extraction script could write results to disk and return a short summary too. Whether that script can reliably fetch these particular sites still needs testing.

## Timings

These are reported category timings. The timing boundaries and per-run outcomes aren't documented well enough to treat them as validated end-to-end averages.

| Case | Playwright, reported time | Firecrawl, reported time | Scope |
|---|---:|---:|---|
| Simple fetch | 55.5s | 11.4s | Includes protected El País; doesn't isolate unblocked fetches. |
| Search and collect | 5.2s | 4.2s | Unclear whether timing includes the full model loop and collection of results. |
| Interaction without CAPTCHA | 176s | 128s | Both paths used an agent; completion rates aren't available. |
| Interaction with CAPTCHA | Not reported | 128s | Incomplete timing pair; the Firecrawl value needs verification against run logs. |
| Anti-bot protection | 4.3s to a blocked result | 0.6s | Playwright failed to retrieve the requested content. |
| Structured data | 7.1s | 4.0s | Field-level correctness wasn't scored. |

For the five rows with timings on both sides, excluding the CAPTCHA variant:

```text
Playwright: 55.5 + 5.2 + 176 + 4.3 + 7.1 = 248.1 seconds
Firecrawl:  11.4 + 4.2 + 128 + 0.6 + 4.0 = 148.2 seconds
248.1 / 148.2 ≈ 1.67
```

Dividing the sums by five gives 49.62 and 29.64 seconds per category. The 1.67 ratio is arithmetic on the reported entries, not a measured overall speedup. Summing category means weights each category equally regardless of its task count, includes a failed browser fetch, and doesn't give the duration of the 340-job workload.

Firecrawl's reported simple-fetch time is lower, but that group includes a protected site, so it doesn't establish relative latency for unblocked fetches. The anti-bot runs show that Firecrawl retrieved content where this headless Playwright setup was blocked. Time to a block needs to stay separate from time to correct content, and these runs don't establish universal anti-bot coverage.

## Where the model uses tokens

The approximately 49K input and 10K output tokens above are averages across browser sessions. They aren't measurements of individual evaluation categories. The available interaction estimates also lack per-run usage records, so there's no consistent basis for a benchmark-wide token total or reduction ratio.

For Firecrawl's four `no_agent` categories, the fetch phase made no calls to my agent's model. Reading a summary and generating the morning digest still use tokens. Any model work inside the service is outside that count.

An equivalent scripted Playwright fetch would also avoid calls to my model during extraction. The architecture change is moving routine fetching outside the agent loop. A fair workflow comparison needs to count fetching, retries, validation, summary reading, and digest generation on both sides.

## The cost of a daily cron

For a budget estimate, assume 17 source visits per day, 1.18 credits per visit, and a $16 plan with 5,000 included credits. The 1.18-credit figure is an assumption, not a measured average supported by a usage export.

```text
Allocated value per included credit: $16 / 5,000 = $0.0032
Daily credits: 17 × 1.18 = 20.06
Daily allocated credit cost: 20.06 × $0.0032 = $0.064192
30-day credits: 20.06 × 30 = 601.8
30-day allocated credit cost: $0.064192 × 30 = $1.92576
```

That is about $0.064 per day and $1.93 per 30 days of allocated credit value. One credit, such as the reported El País fetch, has an allocated value of $0.0032 under this assumption.

Allocated credit value is not the subscription bill. If I buy the Hobby plan just for this cron, I pay the full $16 monthly equivalent even when I use only about 602 credits. Those credits are included in the bill. If I already pay for the plan, using spare credits may add no cash expense until an allowance or limit is exceeded.

The [Firecrawl pricing page](https://www.firecrawl.dev/pricing) lists Hobby at $16 per month billed annually, or $19 with monthly billing, for 5,000 credits per month. The annual rate implies a $192 yearly commitment. It also lists a free allowance of 1,000 credits per month. The assumed 602-credit workload fits that allowance numerically, subject to its limits and actual endpoint charges. These plan prices are a basis for budgeting, not an invoice for the evaluation runs.

| Cost basis | Per day | Per 30 days or billing month |
|---|---:|---:|
| Playwright-path input-token estimate | ~$0.42 | ~$12.60 over 30 days |
| Firecrawl allocated included-credit value | ~$0.064 | ~$1.93 over 30 days |
| Dedicated Hobby subscription at the assumed annual rate | Fixed subscription | $16 monthly equivalent, paid annually |

The Playwright figure is an estimate. It excludes output tokens and browser hosting; the handling of cached input and retries isn't documented. Firecrawl also needs downstream model costs and hosting counted. A dedicated paid Firecrawl subscription exceeds the $12.60 input-only Playwright projection, while spare paid credits or a suitable free allowance change the cash cost. These figures don't establish the cheaper complete workflow.

## What I'd measure next

The evaluation doesn't include success rates, per-run spread, or confidence intervals. Ten repetitions alone don't establish statistical significance. Freshness also needs an explicit check on both paths.

A useful follow-up would:

1. Define success per task. Check news headlines, links, sources, and timestamps against a reference captured at test time. Record redirects and archive use. Archived content must fail a current-news task; missing freshness evidence must remain unverified. Score structured fields and interaction completion separately.
2. Hold orchestration constant. Compare scripted Firecrawl with scripted Playwright, then compare agent-driven paths separately using the same model, prompt, output requirements, and retry budget. Record browser and anti-blocking configurations, and include their costs.
3. Use the same freshness policy. Firecrawl's [scrape documentation](https://docs.firecrawl.dev/features/scrape#caching-and-maxage) says cached results may be returned by default and `maxAge: 0` requests a fresh fetch. Record cache settings and metadata on both paths. Bypassing a cache still doesn't prove that source content is current.
4. Measure the complete workflow through validated output. Record fetching, model calls, retries, validation, actual input and output tokens, cached-input tokens, and service credits for every run.
5. Publish paired per-task results. Include correct-and-fresh success rates, latency distributions for successful runs, time spent on failures, uncertainty intervals, aggregation weights, and total cost per correct-and-fresh result. Counterbalance execution order and account for cache warming.

## What I changed in the cron

I moved the El País fetch to a Firecrawl script outside the agent loop. The experiment gave me a reason to try that architecture, but it didn't prove a general speed or cost advantage over Playwright.

For this cron, I want fetching to produce a small, validated record before the model summarizes it. Either tool can support that design. Firecrawl was the implementation I tried; its speed and cost advantages still need a fair comparison.

The clearest lesson from this experiment is that archived headlines must never silently pass as current news.
