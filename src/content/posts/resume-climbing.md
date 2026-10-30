---
title: "Building a hill-climbing agent for my own resume"
description: "A task-specific evaluation and hill-climbing workflow that selects resume evidence for a job posting, with blind grading, measured constraints, and regression-aware feedback."
date: 2026-10-29
tags: ["AI-Agents", "Evaluations", "TypeScript"]
featured: false
---

I built a custom evaluation and hill-climbing workflow to choose which parts of my experience to put on a resume for a specific job posting.

My resume already lived in YAML. It contained more experience bullets than I could fit on one page, with selection flags controlling what appeared in the PDF. That gave me a concrete search space: different selections of existing, truthful evidence.

Instead of asking an agent to "make my resume better," I wanted to give it a loop. Evaluate the current document, propose a different selection, measure the result, and use that feedback to decide what to try next.

The resume was a practical use case for something I wanted to build myself: a task-specific evaluator and the workflow around it that lets an agent search, compare candidates, and respond to regressions.

## Turning tailoring into a search problem

For each posting, the question was narrow:

> Which selection of my existing experience makes the strongest documented case for this role, within one rendered page?

That required separating three things:

- **The candidate:** the resume document someone would actually read.
- **The objective:** how well that document demonstrates the posting's requirements.
- **The constraints:** use existing evidence, change selections rather than invent claims, and fit on one page.

Those boundaries matter. A system that evaluates my entire experience pool will reward evidence that never appears in the submitted document. A system that can rewrite anything can make its score rise by adding claims I cannot support.

I started by proposing a split between a fitness skill and an optimizer, then asked whether extracting recruiting goals deserved a third skill. That became the structure of the system.

## Three skills with different information

### Posting intake

`posting-intake` captures the original posting and creates a frozen requirements fixture. It records the requirements, their classes, evidence expectations, and eligibility gates.

Both the evaluator and optimizer consume that same fixture. They do not independently reinterpret the posting for every candidate.

Otherwise, a change in score could come from a change in the question. Freezing the fixture makes candidate comparisons more meaningful, while leaving the fixture itself open to review and explicit revision.

Eligibility stays distinct from document quality. An unresolved authorization question should remain an unresolved question, not silently become a penalty that the optimizer tries to fix by swapping bullets.

### Posting fitness

`posting-fitness` sees the frozen fixture and a projection of the selected resume. It does not see the unused bullets or the optimizer's argument for why a candidate should win.

That projection has to match the renderer. If an empty project disappears from the PDF, its header cannot count as evidence. If a field exists in YAML but never prints, the evaluator should not see it either.

The judgment task is requirement-level: identify the supporting evidence and classify it as direct, transferable, skills-only, not evidenced, or contradictory. The implemented rubric distinguishes stronger and weaker transferable evidence.

### Resume optimizer

`resume-optimizer` gets the full evidence pool, the current selection, and the evaluation feedback. It proposes selection changes and evaluates the resulting candidate.

The information split is deliberate. The optimizer needs to know what is available. The evaluator needs to judge what is visible.

I built this using Pi, with skills defining the workflow and JavaScript helpers handling projection, scoring, and comparison. I used isolated subagents for parts of the implementation, review, and grading. I directed the design and interventions; the agents helped implement and exercise it.

## The hill-climbing workflow

The search happens over selection flags rather than unrestricted prose.

```text
Capture posting and freeze the requirements
                    |
                    v
Choose an initial resume selection
                    |
                    v
Render PDF and check the page constraint
                    |
                    v
Build the selected-document projection
                    |
                    v
Collect blind requirement-level judgments
                    |
                    v
Compute score and compare with the incumbent
                    |
                    v
Accept, reject, or inspect the trade-offs
                    |
                    v
Use the comparison to steer the next proposal
```

The search controller in this session was the parent agent, operating the skills and code helpers. I did not build an unattended service that exhaustively searches every possible resume. We exercised a guided, tool-assisted hill-climbing workflow on concrete candidates.

The distinction I cared about was moving beyond a one-shot suggestion. Each proposal should produce an inspectable result that changes what the agent tries next.

## Code should own the things it can measure

The first version used a bullet budget as a proxy for page fit. Rendering disproved that assumption: one resume source with nine selected bullets occupied two pages, while another with eleven fit on one.

The constraint was the complete layout, not a count. We replaced the heuristic with actual PDF page measurement. A candidate that renders to two pages is invalid even if its evidence score improves.

I made the same separation for scoring. When the initial graders miscalculated totals from their own evidence rows, I explicitly asked to move arithmetic into code.

The models now supply judgments. Code applies the evidence-value mapping and requirement weights, validates the rows, and calculates the result. It also derives document metadata rather than trusting a model to report what was selected or how many pages rendered.

The code helpers included:

```text
project.mjs     Build the selected projection and measure pages
lib.mjs         Shared scoring definitions
grade.mjs       Validate judgments and compute score records
compare.mjs     Compare candidates and produce regression feedback
panel.mjs       Construct the common grading packet
consensus.mjs   Combine requirement-level panel votes
```

We tested missing rows, unknown evidence classes, oversized documents, and a model-supplied score that the code ignored. Replaying a fixed judgment file returned the same score three times.

That gives me reproducible arithmetic. Whether a bullet demonstrates a requirement is still a judgment call.

## Feedback needs to say what was lost

A total score alone is a poor instruction for the next iteration.

In an early HRT test, a candidate moved from 52.2 to 59.6 under that version of the evaluator. It also lost evidence on three requirement rows. The aggregate gain hid trade-offs involving design explanation, performance, and independent/team work.

My instruction was that the climbing workflow should factor this in and nudge the next agent when a candidate regresses.

So the comparator reports improved and regressed rows, their weighted movement, and a concrete steer for the next proposal. In this case, it named the lost requirements to recover while preserving the gains.

That turns "try again" into a specific search direction. It also leaves a place for human judgment when a trade-off is acceptable. The strict comparison option can reject a candidate with regressions rather than treating every aggregate increase as a win.

## Using multiple models for the judgment step

I initially pushed back on grading every application twice just to estimate variability. I wanted a useful workflow without doubling the sequential work by default.

Testing still exposed an important problem: different readings of the same evidence could produce different scores and even different candidate rankings. Once the arithmetic was code-owned, those disagreements could no longer be mistaken for addition errors.

I asked to try multiple model families within the grading round. After dropping a model that failed through the adapter/backend path, the panel used DeepSeek, GPT, and Kimi through Pi.

They receive the same grading packet. The consensus helper takes the median evidence value for each requirement, then code computes the document score. It retains disagreement information rather than presenting consensus as certainty.

This is row-level aggregation, not a vote on which whole resume wins. The combined ranking can therefore differ from the direction favored by a majority of individual document scores.

The panel changed an earlier HRT recommendation: the recorded baseline scored 66.2 and the revision 64.7. That showed the recommendation was sensitive to the evaluation method. It did not establish which document a recruiter would prefer.

The panel is one component I can inspect and improve, not a guarantee of a calibrated objective. Freezing a rubric and combining models do not make the rubric correct.

## A complete iteration on a new posting

I then supplied an Asymptote Capital new-grad posting and ran the workflow through intake, candidate construction, page validation, panel judgments, and comparison.

The recorded candidates scored:

```text
Candidate       Internal match score
Baseline                 77.1
Alternative v3           74.3
Alternative v2           73.6
```

Both alternatives introduced database/schema evidence but removed evidence that supported other requirements. The comparator rejected them, and we kept the baseline.

That is a useful search result. The agent proposed changes, the evaluation identified their cost, and the workflow did not force an edit simply because it had been asked to optimize.

It also exposed a requirement that the selected page did not demonstrate. That is different from discovering unused evidence that can be selected. Sometimes another selection can help; sometimes the next step is to ask whether I have a real example worth documenting. The system should not manufacture one.

These were two tested alternatives, not an exhaustive search or proof of a local optimum. The baseline's panel confidence was also low. The numbers describe the internal rubric, not interview probabilities.

## What I built

The reusable part is the separation between candidate generation, evaluation, and search control. I can change the proposal strategy without changing the rubric, revise the evaluator and reassess saved candidates, or tighten the acceptance policy without asking a model to remember a new constraint.

My role was to define the problem, propose the skill split, choose the test cases, and change the design when results exposed weaknesses. I pushed arithmetic into code, asked for regression-aware steering, and requested the multi-model judgment approach. The detailed implementation evolved with the agents through testing and review.

I now have a custom evaluation and hill-climbing workflow for a need I actually have. It compares different presentations of the same experience against a particular posting, within a real document constraint.

I have not measured whether it improves hiring outcomes. What I built and exercised is the loop: propose, evaluate, compare, and use the result to decide what to try next.

