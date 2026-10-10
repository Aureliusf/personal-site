---
title: "Firecrawl vs Playwright: what I learned from my news cron"
description: "A news-fetching experiment exposed stale headlines and costly agent loops. Here's what the results can support, what they can't, and the corrected cost math."
date: 2026-06-09
tags: ["Firecrawl", "Playwright", "AI-Agents", "Context-Engineering"]
featured: true
highlight: "Fetching news outside the agent loop, with freshness checks still missing"
---

Correction, October 10, 2026: The original version overstated the speed, token savings, and cost comparison. I've corrected the arithmetic, removed unsupported claims from the title and results, and made the measurement gaps explicit. The available results don't establish which tool is faster or cheaper for this workload.

I run a news cronjob inside Hermes-Agent. It fetches headlines and links from 17 sources and summarizes them every morning. Glorified RSS, and that's exactly the point.

The cron had been running on Playwright for months. I wanted to know how much of the agent's work was necessary for a routine fetch. That led to an experiment with Firecrawl, and to a more uncomfortable question: was the cron delivering current news at all?

## The fetch that returned last week's headlines

The El País session was the clearest failure in the original notes:

> Playwright path: 89,973 input tokens, 4,106 output tokens, 7 turns, and 0 characters delivered by the browser fetch.

The browser hit DataDome. After three browser calls, the agent tried four `curl` calls and eventually used the Wayback Machine. The fallback returned week-old headlines without telling the user they were stale. The session used 94,079 tokens in total, including the recovery attempts. That is the cost of the whole agent path, not a Playwright API call.

For the same URL, the Firecrawl notes report 0.6 seconds, one call, one credit, and 85,038 characters returned. I originally described that content as current. I hadn't built an automated freshness check, so the returned character count doesn't establish that claim. The request's cache settings and a dated reference capture are also missing from the published results.

The failure here was serving archived news as today's news. A cheaper fetch wouldn't fix that on its own.

## What the 30-day session summary shows

The original post included these session averages:

| Metric | With Playwright, 84 sessions | Without browser, 246 sessions | Difference |
|---|---:|---:|---:|
| Input tokens per session | 49,491 | 39,086 | +27% |
| Output tokens per session | 9,783 | 3,706 | +164% |
| Total tokens per session | 59,274 | 42,792 | +39% |
| Tool calls per session | 23.4 | 12.5 | +87% |

These are different groups of sessions, selected by the agent's choice of tools. The agent can reach for a browser when a site or task is harder. I didn't match tasks, randomly assign tools, or control for site difficulty and recovery attempts. The non-browser group is not a Firecrawl control group either.

The browser sessions used more tokens on average. This doesn't tell me how many tokens the browser caused, or how much switching tools would save. My original statement, "Same tasks. Same agent. The only difference was the browser," was not supported by this comparison.

The output difference needs investigation too. Browser sessions averaged about 2.64 times as many output tokens. Longer answers, more agent turns, and recovery work are possible explanations, but the aggregate summary doesn't separate them. I can't attribute that difference to DOM snapshots, which enter the model as input.

## Two workflows in the evaluation

The test set covered five categories:

| Case | Targets or tasks |
|---|---|
| Simple fetch | Gothamist, Hell Gate, City Limits, CoinDesk, El País |
| Search and collect | News searches for XRP, Bitcoin, NYC Mayor |
| Interaction | Wikipedia forms and multi-step navigation, with separate CAPTCHA notes |
| Anti-bot protection | El País with DataDome, Politico with Cloudflare |
| Structured data | CoinMarketCap, CoinGecko, Realtor.com |

The original setup describes 17 tasks, two execution paths per task, and ten repetitions across ten hours. That gives `17 × 2 × 10 = 340` jobs. Runs were described as interleaved to reduce time-of-day bias. The raw per-run records and category aggregation rules aren't included with this post, so the reported averages can't be independently reconstructed here.

The execution paths differed in more than the fetching tool:

- Playwright ran headless with an LLM agent choosing actions and handling recovery in every category. There was no added anti-blocking setup.
- Firecrawl ran as a `no_agent` fetch script in four categories. Only the interaction category used an agent.

This compares my existing browser-agent workflow with a mostly scripted service workflow. It changes orchestration, browser configuration, and the service handling site access at the same time.

Playwright can also run without an LLM. Its [library documentation](https://playwright.dev/docs/library) demonstrates standalone browser scripts. A fixed extraction script could write results to disk and return a short summary too. Whether that script can reliably fetch these particular sites still needs testing. The current evaluation doesn't isolate a token-saving property of Firecrawl itself.

## Reported timings and their limits

These are the original timing entries, retained for transparency. Their timing boundaries and per-run outcomes are not documented well enough to treat them as validated end-to-end averages.

| Case | Playwright, reported time | Firecrawl, reported time | Measurement concern |
|---|---:|---:|---|
| Simple fetch | 55.5s | 11.4s | The original 55.5s had an unexplained asterisk. The group also includes a protected site. |
| Search and collect | 5.2s | 4.2s | Unclear whether the timer includes the model loop and collection of results. |
| Interaction without CAPTCHA | 176s | 128s | No per-run spread or verified completion counts. |
| Interaction with CAPTCHA | Not reported | 128s | Missing Playwright timing; Firecrawl repeats the other interaction timing without explanation. |
| Anti-bot protection | 4.3s to a blocked result | 0.6s | Playwright failed to retrieve the requested content. This isn't a successful-fetch speed comparison. |
| Structured data | 7.1s | 4.0s | No field-level correctness scores or clear timing boundary. |

For the five rows with timings on both sides, excluding the CAPTCHA variant, the arithmetic is:

```text
Playwright: 55.5 + 5.2 + 176 + 4.3 + 7.1 = 248.1 seconds
Firecrawl:  11.4 + 4.2 + 128 + 0.6 + 4.0 = 148.2 seconds
248.1 / 148.2 ≈ 1.67
```

The original Playwright total of 205.1 seconds was wrong. Dividing these corrected sums by five gives 49.62 and 29.64 seconds per category. Neither the original 1.4x claim nor the "4x faster" section title followed from the table.

The corrected 1.67 ratio is only arithmetic on the reported entries. Summing category means weights each category equally, regardless of its task count, and includes a failed browser fetch. It isn't the measured duration of the 340-job workload or a valid overall speedup.

The table also contradicts my earlier claim that Firecrawl adds latency for simple fetches: its reported simple-fetch time is lower. But that group includes El País, and the unexplained qualifier on 55.5 seconds remains unresolved. It doesn't establish the relative latency of unblocked fetches. Likewise, the 5.2-second search entry cannot be paired with a generic 59K-token session estimate and presented as a timed agent run.

The anti-bot notes report that Firecrawl retrieved content where this headless Playwright setup was blocked. That is an observation about these runs and configurations. It doesn't establish universal anti-bot coverage, and time to a block must be reported separately from time to correct content.

## Why I withdrew the token ratios

Four Playwright categories originally showed the same `~49K in / ~10K out`. Those figures match the 30-day browser-session average. I can't substantiate them as measurements of each category, so I've removed them from the results table.

The interaction notes list approximately 176K input tokens for Playwright and 7.7K for Firecrawl without CAPTCHA, with approximately 5.8K output tokens for each. The CAPTCHA variant lists approximately 763K input plus 5.8K output for Playwright, and 62K total for Firecrawl. The identical output estimates and the mix of input-only and total figures need per-run usage records before they support a comparison.

Even taken literally, the old entries don't produce the claimed `~800K versus ~13.5K` total. Four estimated 59K-token categories plus the non-CAPTCHA interaction row add to about 417.8K for Playwright. Adding the CAPTCHA variant as another row gives about 1.187M. Firecrawl's non-CAPTCHA interaction row adds to 13.5K, but including its CAPTCHA row gives 75.5K. Counting the CAPTCHA case on only one side was inconsistent.

Those reconstructed sums still mix session estimates, interaction variants, and undocumented aggregation. I withdraw the overall 60x claim and the interaction token ratios rather than replacing them with another unsupported ratio.

For Firecrawl's four `no_agent` categories, "zero LLM tokens" describes only the fetch phase making no calls to my agent's model. Reading a summary and generating the morning digest still use tokens. Any model work inside the service is outside that count. The equivalent scripted Playwright fetch would also avoid calls to my model during extraction. A fair workflow comparison must count fetch, retries, validation, summary reading, and digest generation on both sides.

## Corrected cost math

The original estimate assumed 17 source visits per day, 1.18 credits per visit, and a $16 plan with 5,000 included credits. The 1.18-credit figure isn't backed by a usage export here; I'm keeping it as an assumption to show the correction.

```text
Allocated value per included credit: $16 / 5,000 = $0.0032
Daily credits: 17 × 1.18 = 20.06
Daily allocated credit cost: 20.06 × $0.0032 = $0.064192
30-day credits: 20.06 × 30 = 601.8
30-day allocated credit cost: $0.064192 × 30 = $1.92576
```

That is about $0.064 per day and $1.93 per 30 days of allocated credit value. The original $0.002 per day and $0.06 per month were wrong.

Allocated credit value is not the subscription bill. If I buy the assumed Hobby plan just for this cron, I pay the full $16 monthly equivalent even when I use only about 602 credits. I don't add $1.93 on top of that bill; those credits are included. If I already pay for the plan, using spare credits may add no cash expense until an allowance or limit is exceeded.

The [current Firecrawl pricing page](https://www.firecrawl.dev/pricing), checked October 10, 2026, lists Hobby at $16 per month billed annually, or $19 with monthly billing, for 5,000 credits per month. The annual rate implies a $192 yearly commitment. It also lists a free allowance of 1,000 credits per month. The assumed 602-credit workload fits that allowance numerically, subject to its limits and actual endpoint charges. This current pricing doesn't establish what the June experiment was billed.

The corrected comparison under the original paid-plan assumptions is:

| Cost basis | Per day | Per 30 days or billing month |
|---|---:|---:|
| Original Playwright-path input-token estimate | ~$0.42 | ~$12.60 over 30 days |
| Firecrawl allocated included-credit value | ~$0.064 | ~$1.93 over 30 days |
| Dedicated Hobby subscription at the assumed annual rate | Fixed subscription | $16 monthly equivalent, paid annually |

The Playwright figure remains an estimate, not a measured invoice. It excludes output tokens and browser hosting; the handling of cached input and retries isn't documented. Firecrawl also needs any downstream model costs and hosting counted. The earlier $3–8 Playwright monthly figure doesn't follow from $0.42 per day, and the paid Firecrawl subscription exceeds that $12.60 input-only projection. The available figures don't establish the cheaper complete workflow.

The $0.027 in the old title was unsupported too. At the assumed allocation rate, one credit is $0.0032. I don't have a reconciled charge that explains $0.027 for the reported one-credit El País fetch, so I've removed it. I've also removed the unmeasured 35K-token Firecrawl-in-the-loop projection and the cost attached to the individual El País agent session.

## What a useful rerun needs

Ten repetitions don't establish statistical significance by themselves. The post doesn't report per-run values, variance, confidence intervals, or success rates. The claim that no headlines changed during the test window wasn't backed by a freshness audit either.

Before publishing a new speed or savings ratio, I'd need to:

1. Define success for each task. A news result needs the expected source, correct headline and link, and a timestamp checked against a reference captured at test time. Record redirects and archive use. Archived content must fail a current-news task; missing freshness evidence must remain unverified. Score structured fields and interaction completion separately.
2. Hold orchestration constant when comparing tools. Test scripted Firecrawl against scripted Playwright for fixed extraction, and compare agent-driven paths separately with the same model, prompt, output requirements, and retry budget. Record browser versions, headless settings, proxies, and anti-blocking configuration. Test additional configurations as separate conditions with their costs included.
3. Use the same freshness policy. Firecrawl's [scrape documentation](https://docs.firecrawl.dev/features/scrape#caching-and-maxage) says cached results may be returned by default and `maxAge: 0` requests a fresh fetch. Record cache settings and returned metadata on both paths. Bypassing a cache still doesn't prove that the source content is current.
4. Measure the complete workflow. Start the timer before the task and stop after validated output is stored. Record fetching, model calls, retries, and validation separately, along with actual input, cached-input, output tokens, and service credits for every run.
5. Publish paired per-task results. Report correct-and-fresh success rates, failure types, median and tail latency for successful runs, and time spent on failures. Include the per-run records, aggregation weights, uncertainty intervals, and total cost per correct-and-fresh result. Randomize or counterbalance execution order and account for cache warming across repetitions.

These are requirements for a rerun, not checks the existing experiment passed. I haven't added a freshness validator or rerun the benchmark as part of this correction.

## What I changed in the cron

I moved the El País fetch to a Firecrawl script outside the agent loop. The experiment gave me a reason to try that architecture, but it didn't prove a general speed or cost advantage over Playwright.

For this cron, I want fetching to produce a small, validated record before the model summarizes it. Either tool can support that design. Firecrawl was the implementation I tried; its speed and cost advantages still need a fair comparison.

The clearest lesson from this experiment is that archived headlines must never silently pass as current news.
