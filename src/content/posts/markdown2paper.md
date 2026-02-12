---
title: Markdown2Paper - Ship in 3 hours with Opencode
date: 2025-12-27 15:59:22
tags: [TypeScript, Obsidian, jspdf, "AI-Agents"]
featured: true
metrics: "3 hours to MVP · AI Agents"
---

# Markdown2Paper - My 3‑Hour Sprint with Opencode, MiniMax-M2.1 to Ship an Obsidian plugin

*After using Obsidian for all my notes and assignments for the last 3 years, going back to Word sounded like the worst that could ever happen to me. So with a bit of time in my hands and influenced by the Opencode hype, I dived in.*

Below is a behind‑the‑scenes look at how I combined prompting, TypeScript expertise, and a “make things work” mindset to deliver a usable product in record time.

---
1. The Problem Space
Students and researchers constantly wrestle with two conflicting tasks:
1. Write in Markdown, the lightweight, distraction-free format we all love in Obsidian.
2. Submit a PDF, formatted to strict APA (or MLA) guidelines, complete with citations and references.
Manually copying text into a word processor, tweaking headings, re-doing all the citations and adjusting line spacing is a pain point I’m over with. My goal was simple: press a button, get a PDF that looks like a school‑ready paper.
---
I first looked at the friendly manual. The Obsidian docs are great, with a comprehensive in-depth page on plugins. I did as advised, created a separate vault for my dev work, pasted in some samples, and was off to try new things. Git clone the demo, and here I am.
I did a quick `nix run nixpkgs#opencode`, set up my providers. That same day, Anthropic blocked subscriptions from being used outside Claude Code. Since Anthropic models were out of the question based on really high API pricing and no subscriptions for Opencode, I wanted to try the best next thing, some say GPT-5.2, GLM-4.7, Kimi, or MiniMax-M2.1. I looked at the rates for each in OpenRouter and chose MiniMax-M2 to make my tokens last as long as possible. 

2. Starting with a Prompt
I wanted to see what all the hype was about, so I ditched any architecture scaffolding and jumped straight into prompting. First using the Plan mode.
> “Create a plan for an Obsidian plugin that reads the active markdown file, parses headings, paragraphs, and citations, then exports a PDF with APA formatting, 1 inch margins, 1.5 spacing and 12pt Times New Roman Keep the code modular.”

What followed was a rapid, iterative dialogue:

The model asked me what tools we should use from a list of possible options. jspdf for creating the PDFs, what to do with photos, tables, code blocks; it asked what to expect from the citations, how to handle them, and store them.

After a bit, it tells me the plan is done, I skim through it and sounds reasonable, same structure as the demo plugin form Obsidian's docs with a couple new files that will scan the markdown text and parse it into TypeScript objects jspdf can understand, a basic formatter that sets the text on the PDF and an APA formatter that adds the margins, spacing, font and sizing. 

I let it implement in build mode, let the model do its thing, and by the time it dinged telling me it was ready, I happily opened Obsidian, went and tested, and … nothing.

MiniMax-M2.1 forgot to assign a function to the button, so I prompted the model again.
> "Can you ensure that the button inside the ribbon is calling the plugin? @src/ui/ribbon-manager.ts"

After a `You are absolutly correct`, it edited the file to call the right function and even added a notification.

Great! Now it will generate a PDF. Well, it did, but the text is one line on top of each other, and the margins are at least 4 inches on all sides. Back to prompting, let's see.

> "I tested the plugin but it returns a PDF with really big margins and jumbled text in only 1 line. Can you check what are we doing for wrapping the text? Also add a configuration screen where the user can tweak the margins and select the format, we will only implement APA for now."

A bunch of edits pass by, and it dings again, telling me everything was fixed and the request was successful. It did add the settings page as requested, and I can now change the margins, in the hope of finding out what the model is doing to produce such large margins and why they are not 1 inch. The formatting selector is there, great!

I tested the plugin, and it wraps around the big margins. Okay, let’s tweak the numbers on the settings screen and see what happens. I changed them from 1 to 0.1 expecting basically no margins. Export PDF, big margins again.

One last prompt before I go in and do it myself; This time in Plan mode:
> "The margins are still really big, can you tell me how the margins are being calculated?"

It returned the type definition of `margins`.

I went in with my regular editor and quickly found that the margin values from the settings page were multiplied by 12 before being passed on, and then again when applied when creating the frame in jspdf. I changed that, and we are back to prompting.

After fixing the margins, I noticed that there was no wrapping to the next page; the document was only one page, no matter how long it was, it would bleed out through the bottom.

Let's see if MiniMax-M2.1 can help.

> "The new document generated has proper margins after my edit but the document bleeds out on the first page and does not wrap into the second page, can you take a look and make sure content goes across pages and does not stay in one page?"

And this time it did, it totally fixed the issue right away, and now I had a good-looking PDF that wraps around as expected with the set margins.

With a working prototype, I went ahead and squashed all the commits the model made into the first proof-of-concept commit.

Let's add more things, 

> "Great! that works and now the PDF wraps properly. Can you help me create page break whenever you see the reference section? it should be something like ## References or ## Citations"

After additional prompting iterations, it created a page break when it saw those exceptions.

Then I remember my Discrete Math notes, LaTeX rendering of equations, and math language is best in class, second to none. If I can make LaTeX work here, with citations already in Obsidian, this can be by far the best paper-writing solution for me!

So I prompted away; first in Plan mode:
> "Can you come up with a plan to render LaTeX into PDF with this plugin. LaTeX in markdown will always be enclosed in single $ for in-line LaTeX and double $$ for single line LaTeX. $2+2$ should be rendered in place of the text $2+2$ and $$2+2$$ should create a new line before and after."

After several attempts, it still did not work. It generated every line on the same spot.

After that, my time was up, and I had to go. Since I do not need any LaTeX for now, I have left that on the back burner until I have some time for it.

---

## February 2026: Refining with OpenAI Codex

**Context:** Two months later, OpenAI released their Codex app. I saw it as an opportunity to revisit the plugin and implement the features that had stalled with MiniMax.

### Testing Codex with Real Work

I decided to test Codex by tackling the LaTeX rendering feature. MiniMax couldn't solve it and I wanted to see if Codex could. This would be a real test of whether the new model could handle the complexity and see how the new tool operates.

### Workflow Differences

**Nix Integration Challenges:** Unlike Opencode, Codex struggled with nix-shell environments. It wouldn't properly prepend nix commands to its build process, even when using the same skills and Codex 5.3 model. This was frustrating since I rely heavily on nix for reproducible environments. I had to manually launch codex from within a nix-shell with the needed tools.

**Screenshot Advantage:** Where Codex shone was in the screenshot workflow. With Opencode, adding images meant dropping them in a directory and referencing them. Codex let me paste directly from clipboard, much more straightforward for this tool that was struggling with rendering on the right place.

### Model Capability Comparison

**Codex 5.3 vs MiniMax 2.1 on LaTeX:**

MiniMax repeatedly failed to implement LaTeX rendering, generating overlapping text or broken layouts. With Codex 5.3 and a few screenshot-assisted prompts explaining the MathJax integration, it worked. 
The model understood the need to integrate mathjax-full for SVG rendering, handle both inline and display math, extract dimensions from SVG viewBox attributes, and fallback gracefully when MathJax fails.

### LaTeX Rendering Implementation

The LaTeX renderer uses MathJax to convert mathematical notation into SVG for PDF embedding:

```typescript
// src/pdf/latex-renderer.ts
import { mathjax } from "mathjax-full/js/mathjax.js";
import { TeX } from "mathjax-full/js/input/tex.js";
import { SVG } from "mathjax-full/js/output/svg.js";

const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);
const tex = new TeX({ packages: AllPackages });
const svg = new SVG({ fontCache: "none" });
const html = mathjax.document("", { InputJax: tex, OutputJax: svg });

export const latexRenderer = {
  async renderInline(latex: string): Promise<SvgResult | null> {
    try {
      const node = html.convert(latex, { display: false });
      const svgNode = adaptor.firstChild(node);
      const svgMarkup = adaptor.outerHTML(svgNode);
      // Parse SVG and extract dimensions for PDF placement
      const parsedSvg = new DOMParser().parseFromString(svgMarkup, "image/svg+xml")
        .documentElement as SVGElement;
      return { svg: parsedSvg, width, height };
    } catch (error) {
      console.error("MathJax rendering error:", error);
      return null;
    }
  }
};
```

### Final Implementation

After the February updates the plugin now has support for:

- **LaTeX:** Full MathJax integration for mathematical notation
- **Image Embedding:** Local vault images render in PDFs  
- **Table Support:** Basic rendering (not APA/MLA perfect, but functional)
- **MLA Format:** Added alongside APA for more academic flexibility

### Reflecting on the Tools

**Opencode vs Codex Tradeoffs:**

Both tools excel in different areas. Opencode handles complex development environments better (nix support), while Codex offers a more fluid UI for rapid iteration (clipboard screenshots). Codex 5.3 demonstrated noticeably better capability on complex tasks like LaTeX rendering, where MiniMax 2.1 struggled despite multiple attempts.

**I am keeping Opencode**
Opencode still remains the most open option out there and even though interesting, Codex is too limited in extensibility for me to be considered an option to keep around.

**The Models**

The Codex models in the other hand are great, they are not as expensive as Opus and are similar in quality. 
My main model today remains Kimi 2.5 based on a quota and price but if I could have Codex 5.3 at the same $10/month i have Kimi 2.5, I would chose Codex any time of the week. 

I will use Codex to get some of Codex 5.3 tokens to fix specific issues but I will not use it day-to day as my main AI-tool.

---

##  The Final Product
After three hours of back‑and‑forth with the AI, the plugin now offers:

| Feature | Status | Added |
|---------|--------|-------|
| Export active markdown to APA‑styled PDF | ✅ | Dec 2025 |
| Font selection (Times, Helvetica, Courier) | ✅ | Dec 2025 |
| Adjustable margins, double‑spacing, first‑line indent | ✅ | Dec 2025 |
| Citation parsing ([@key]) and reference list generation | ✅ | Dec 2025 |
| Table support via jspdf-autotable | ✅ | Dec 2025 |
| Settings UI - Customize fonts and margins | ✅ | Dec 2025 |
| LaTeX math rendering (inline and display) | ✅ | Feb 2026 |
| Image embedding from vault | ✅ | Feb 2026 |
| MLA formatting option | ✅ | Feb 2026 |

The plugin can be built with npm run build and dropped directly into an Obsidian vault, or installed from source by developers following the README.

---

## Takeaways for me
* Prompt‑first development is here, and it is not a shortcut; it’s a catalyst. It accelerates boilerplate creation, lets you focus on logic.
* You still need to know what you are doing. The AI supplies the scaffolding. You provide the critical decisions: type safety, UX polish, and edge-case handling.  
* Iterative feedback loops (run → observe → prompt → refine) compress the traditional development cycle dramatically.  
	* Wiring a feedback loop into the model makes it 10x better.

---

## Looking Ahead

The plugin is currently available as a personal tool on GitHub. If there's interest from the Obsidian community, I'll package it for the official marketplace.

**Try it yourself:** [github.com/Aureliusf/Markdown2Paper](https://github.com/Aureliusf/Markdown2Paper)

---

**TLDR;** AI-assisted development isn't about replacing engineers. It's about accelerating iteration. This plugin went from idea to working product in 3 hours by combining TypeScript knowledge with strategic prompting, and after a second pass and a couple hours is feature complete. The lesson: provide tight feedback loops, know when to switch tools, and verify the AI's output. Everything points to SWEs moving to managers and code review professionals.
