---
title: Prompt-chess - Tmux Overlay for Opencode
description: A terminal-native chess game that appears automatically when OpenCode is thinking. Built with TypeScript and React for productive breaks during AI coding sessions.
date: 2026-02-20 15:59:22
tags: ["TypeScript", "React", "AI-Agents"]
featured: true
highlight: "Event-driven chess overlay · Terminal-native"
github: "https://github.com/Aureliusf/prompt-chess"
---

# Prompt-chess - Productive time in between inference calls

There's a 30-90 second window in every AI coding session where your cursor blinks and your brain checks Twitter. Most people fill that gap with doomscrolling. I realized something contrarian: that dead space is the point.

Chess is the perfect antidote to AI slop-finite, deterministic, and entirely your own fault when you lose. So I built a chess tui that appears automatically when OpenCode is thinking, and disappears when it's done. No browser tabs. No mouse. Just terminal, keyboard, vim motions, and the sweet distraction of blundering your queen while waiting for a refactor.

---

## The Streak

It started innocently enough. A 50-day streak on chess.com doing daily puzzles. Just a way to fill five minutes. Then came the 1-minute blitz games "quick breaks" that turned into "just one more to recover that lost Elo."

My rank? Around 200. Which, if you don't play chess, means I suck. I blunder queens. I panic in time trouble. I play the King's Gambit because it looks cool and promptly lose because I don't actually know the theory.

But I kept coming back. There's something addictive about chess. The clarity of it, the way it demands complete attention for just a few minutes. It is the perfect antidote to the fractured attention of modern life.

## The Dead Time Problem

When using AI coding agents more heavily. OpenCode and Claude Code like tools that promise to "just handle it" while you wait. And wait. And wait some more.

You know the rhythm: you write a prompt, hit enter, and... cursor blink. Thirty seconds. A minute. Sometimes three minutes if it's a complex refactor. You check Twitter (bad), scroll Reddit (worse), or stare blankly at the terminal (honest, but boring).

This waiting time for inference is the main time I do 1 minute blitz, but the change is massive. Changing from nice color-coordinated terminal, keyboard focused interface to a web based chess site and using the mouse.

I had tried other chess TUIs but combining the new capabilities of the latest models and some time I had, I decided to create my own chess TUI and add it close to opencode so it would automatically start a 60 second blitz game when waiting for LLM responses.

--- 

## The Architecture Decisions

**Why Ink?** Because it's battle-tested for terminal UIs, has excellent React integration, and handles input gracefully across terminals. 

**Why not OpenTUI?** Because Ink has a smaller memory footprint, I don't need 10ms faster responses in my chess game but I could use 30% more RAM.

I aim for maintainability, cross-platform compatibility, and workflow fit.

--- 


## Commit 1: The Hack (6ceebb4)

The idea was stupid. I knew it was stupid. That's why I loved it.

What if I could play chess *in the terminal*? Not switching to a browser, not opening an app; just right there, in the same window where I'm already working. A quick blitz game that starts and ends between AI responses.

Instead of opening a new terminal and start coding or prompting away I delegated the investigation to my OpenClaw instance, Paquita. I needed to figure out how to detect when OpenCode was idle and trigger a chess overlay automatically.

Paquita checked the OpenCode docs and found there's no native plugin API for detecting inference state. OpenCode doesn't expose hooks for "thinking" vs "idle." But Paquita found a workaround: if you run OpenCode inside tmux, you can detect idle states by monitoring the tmux pane for inactivity.

I considered the tradeoffs: running OpenCode through tmux adds a dependency, but it gives us the automatic trigger behavior I wanted. Running it standalone would mean manual chess launches which defeats the point. 

I prompted Paquita for best TUI frameworks for a chess game and came back with a list. I knew that OpenCode is written with OpenTUI so first leaned into using that but after seeing the benchmarks and the memory footprint OpenCode has in my system I decided to use Ink instead.

Once the architecture was set, Paquita scaffolded the initial implementation. I reviewed the output, kept the structure, but rewrote key parts for clarity and correctness. The agent got me 70% there; I got it the rest of the way.

The original index.js was a glorious 400-line wall of code

It was ugly. It had bugs. The Unicode chess pieces didn't align properly on every terminal. But you know what? *It worked.* I could play chess while waiting for AI.

I could have stopped at the 400-line mess. Some people would have. "It works on my machine" is the vibe coder's mantra. But I didn't.

The difference between shipping and vibe coding is what happens after the AI stops generating. Vibe coders copy-paste and pray. I want to review, refactor, and own the architecture.

When Paquita generated that initial monolith, I saw the problems immediately: tight coupling, mixed concerns, no separation between UI and game logic. The code worked, but it wouldn't scale. When I tried prompting for more features, I found the last straw, the agent couldn't work with it effectively; every change required reloading the entire context.

So I did what software engineers do: I refactored. Not because the AI told me to. Because I recognized the technical debt.

## Commit 2: The Big Split (4faa079)

The monolith started fighting back. But the real problem wasn't just code organization, it was context management.

Kimi 2.5 was hitting context limits. Every change required re-explaining the entire 400-line file. The tool calls would intercept each other and fail. The agent would fix the timer logic and forget how move validation worked. It would add themes and break the board rendering because the state was tangled across functions. The context window was getting polluted with unrelated code, making it harder for the agent to reason about specific changes.

I realized the agent (and future me) needed smaller scopes. We needed to break the monolith. So I prompted away, Kimi 2.5 came up with a basic structure that split chess logic and themes, but we needed more granularity;  So I split it:

```bash
 src/
 ├── components/
 │   ├── Board.js        # 80 lines: just the grid
 │   ├── Piece.js        # 40 lines: single square logic
 │   ├── StatusBar.js    # 60 lines: timer and turns
 │   └── AIPlayer.js     # 100 lines: engine wrapper
 ├── hooks/
 │   └── useGameState.js # 120 lines: centralized chess logic
 └── utils/
     └── themes.js       # 40 lines: color definitions
```

Twenty-four files changed. Zero new features. But now the model could work on the timer without touching move validation. And I could reason about the codebase without holding 400 lines in my head.


## The Polish Phase: Death by a Thousand Papercuts

What followed was a blur of tiny commits that no user will ever notice but that made the difference between "cool demo" and "actual tool I could use daily."

**9c5ebff**: *"feat: add visible cursor and vim motions (hjkl)"*

Originally, you moved the cursor with arrow keys. Fine, right? Except terminal-based tools often swallow or misinterpret arrow key sequences. And vim users instinctively reach for hjkl anyway.

Adding vim motions wasn't hard. It was five lines of code. But it made the tool feel *right.* Like it belonged in the terminal ecosystem, not like a browser game awkwardly shoved into a terminal window.

**43ad386**: *"Touch ups for styling"*

I made some manual changes here tweaking the Chalk color codes, adjusting spacing, making the dark theme actually dark (instead of "slightly less white"), and obsessing over whether the selected square should be cyan or magenta.


## Commit 3: The Ambition (55e91a2)

I had a working chess game that looked okay in the terminal. You could play against the AI. You could set a timer. You could choose themes. It was *fine.*
But it was missing the main use case, I wanted the chess to *appear automatically* when OpenCode was working, and disappear when it was done. Like a helpful ghost that knows when you need a distraction.

I first implemented the tmux popup controller. Kimi 2.5 had no issues in non-nix environments but both nix-darwin and nixOS had major issues with the global install so I decided we needed an install wizard as well. 

The setup wizard (`bin/setup-opencode-overlay`) detects your OS, finds OpenCode's config directories, and wires everything together
Path detection logic that works on macOS, Linux, and Nix setups without hardcoding `~/.config` everywhere

Then I had the model write the instructions for the README

OpenCode stores its state in different places depending on how you installed it. Some systems use `XDG_CONFIG_HOME`, others don't. I wanted a one-command setup that *just worked* regardless of your setup.

This was the best solution I found for this problem:
```javascript
// From tooling/path-detector.js
function findOpenCodeConfig() {
  const candidates = [
    process.env.XDG_CONFIG_HOME && path.join(process.env.XDG_CONFIG_HOME, 'opencode'),
    path.join(os.homedir(), '.config', 'opencode'),
    path.join(os.homedir(), '.opencode'),
    // nix-darwin special case
    process.env.NIX_USER_PROFILE_DIR && path.join(process.env.NIX_USER_PROFILE_DIR, '...'),
  ].filter(Boolean);
  
  return candidates.find(p => fs.existsSync(p));
}
```

Is this overkill for a chess plugin? Absolutely. But there's a principle at stake: if you're going to do something, do it right. 

I didn't want users (myself) to have to figure out how to tell the npm installer where their config files lived. I wanted `npm install && ./bin/setup-opencode-overlay` to just work.

## The Final Tweaks: Shipping Is Harder Than Building

The last few commits were about getting it ready for other humans:

**9b2758c**: *"Changed to 1 min Blitz"*

5-minute blitz games were too long for AI wait times. Most OpenCode responses finish in 30-90 seconds. A 1-minute blitz game is the perfect length, you can finish most games in the time it takes AI to generate a complex response.

**9ac84bf**: *"Fixed hidden nix commands for first setup, use shell.nix provided"*

The Nix setup was broken for fresh clones. I spent some time debugging why `nix-shell` wasn't finding node_modules, only to realize I was using the wrong Nix commands in the README. Fixed the docs, added a proper `shell.nix`, and verified it worked on a clean machine.

This is the unglamorous reality of shipping: 90% of the work happens after the "it works on my machine" moment that nix promises to solve.

## What I Learned

### 1. The Best Tools Solve Problems You Actually Have

I built Prompt Chess because *I wanted it.* Not because I thought it would be popular. Not because I saw a market opportunity. Just because I was tired of waiting for AI and wished I could play chess instead.

This sounds obvious, but it's easy to forget. We get caught up in "what would users want?" and forget that *we are users.* Build things you want to use. At minimum, you'll have one happy user.


### 2. I Suck at Chess, But I Can Ship

My 200 rank in 1-minute blitz is objectively bad. I've lost games in 8 moves. I've hung my queen on move 6 more times than I can count. But here's the thing: *I don't care.* I'm not trying to become a chess master. I'm just trying to fill dead time with something better than doomscrolling.

Prompt Chess is the same. It's not the best chess interface. It doesn't have the strongest AI. It won't replace Chess.com or Lichess. But it's *mine,* and it solves *my* problem, and that's enough.

Sometimes "good enough" is the goal. And shipping is better than perfect.

## The Numbers (Because We All Love Numbers)

- **12 commits**: From "Paquita's attempt" to shipping the overlay
- **~600 lines**: Total JavaScript (not counting dependencies)
- **3 sessions**: From idea to working prototype
- **2 weeks**: From prototype to "I actually use this daily"
- **1**: Number of people who find this useful (me)

## What's Next?

Honestly? Probably nothing. Prompt Chess does what I need it to do. I'll fix bugs if they come up, and I might add PGN export so I can analyze my blitz games later. But the core tool is *done.*

And that's okay. Not every side project needs to become a startup. Not every tool needs a roadmap. Sometimes you build something, use it, and move on.


## Try It, Break It, Improve It

If you use OpenCode or any AI coding agent, give Prompt Chess a shot. It's not going to make you a better developer, but it might make your dead time a little more enjoyable.

```bash
git clone https://github.com/Aureliusf/prompt-chess.git
cd prompt-chess
npm install
./bin/setup-opencode-overlay
./bin/opencode-with-chess
```

Or just run it standalone:

```bash
npm install
npm start
```

Find a bug? Open an issue. Want to improve the AI? PRs welcome. Want to tell me my 200 rank is embarrassing? I've heard worse.

---

## Postscript: On Shipping "Stupid" Ideas

There's a voice in my head (maybe yours too) that says: *"This is dumb. Don't waste time on this. Build something serious."*

That voice is wrong. The stupid ideas are the best ones. They're the ones nobody else is building because everyone else is being "serious." They're the ones that solve real problems in unexpected ways. They're the ones that remind us that software can be *fun.*

Prompt Chess is a stupid idea. A chess plugin for an AI coding agent? Really?

Yeah, really. And I love it.

---

*Written between AI responses, naturally.*
**Time spent**: Too much  
**Regrets**: Zero
