---
name: hook-check
description: Use when the user wants the opening line of a TikTok, YouTube Short or Reel graded or rewritten. Scores the hook on five criteria from an open benchmark rubric plus two checks, explains each score with a quote, and writes three better hooks.
---

# Hook check

The opening line is where most people decide to keep watching or swipe. This skill grades a hook against the five hook criteria
and two checks of the open short-form script benchmark (https://github.com/viewgum/short-form-script-benchmark), then rewrites
it. It is one grader's reading of a fixed rubric, not the benchmark's averaged and cross-checked score, and it does not predict
views or retention.

A hook here is three parts: the spoken first line, the text on screen during it, and what the viewer sees. Many people watch on
mute, so the on-screen text has to work alone.

Not for: a whole script (use `short-form-script`), or titles and captions (use `post-copy`).

## Workflow

1. Get the hook and, if you can, the topic and the audience. If the user gives only a spoken line, grade it and say the
   on-screen text is missing (H5 and D4h score 0).
2. Run the two checks by counting, not judging:
   - D2 Fast start: 0 if the line opens with a greeting or filler ("hey", "hi", "hello", "welcome", "so", "today", "okay",
     "ok", "alright", "guys", "in this video"); otherwise 2 if the first sentence has 15 words or fewer, 1 if 20 or fewer,
     else 0.
   - D4h Hook text: 2 if the on-screen text has 1 to 7 words, 1 if 8 to 10, else 0.
3. Score H1 to H5, each 0, 1 or 2, against the anchors below. Quote the words that earn each 1 or 2. If nothing earns it, give 0.
4. Write three new hooks, each with spoken line, on-screen text (7 words or fewer) and visual. Each should lift the lowest
   scores and keep the topic and its facts. Never add a statistic, quote or claim the user did not give.
5. Score your three the same way and show the scores. If one scores lower than the original on any criterion, say so.

## Criteria

| Id | Criterion | 0 | 1 | 2 |
|---|---|---|---|---|
| H1 | Topic clarity in the first line | the topic is unclear after the first sentence | the topic is named but vague | a concrete topic and outcome, with one reading |
| H2 | Curiosity or stakes | a plain statement with no gap | a generic tease or a stock "the truth is" contrast | a specific contrast or concrete stakes the viewer wants resolved |
| H3 | Relevance to the audience | about the speaker, no stakes for the viewer | the viewer is implied | speaks to the stated audience with an outcome they need |
| H4 | Promise of what is coming | no signal of what the end holds | an implied ending | a visible promise or mechanism in the first five seconds |
| H5 | Hook on mute | no on-screen hook text, or text that makes no sense without sound | on-screen text that is long, busy or gives the answer away | 7 words or fewer that make sense on mute and hold back the answer |

Hook score out of 100 = 100 x (0.8 x (H1 to H5 total / 10) + 0.2 x ((D2 + D4h) / 4)), which with whole grades is
8 x (H1 + H2 + H3 + H4 + H5) + 5 x (D2 + D4h).

## Output format

```
**Hook score:** 58 / 100
**Weakest:** D2 (opens with a greeting), H2 (no gap)

| Criterion | Score | Quote | Why |
|---|---|---|---|
| H1 Topic clarity | 1 | "..." | ... |
| H2 Curiosity or stakes | 1 | "..." | ... |
| H3 Relevance to the audience | 1 | "..." | ... |
| H4 Promise of what is coming | 1 | "..." | ... |
| H5 Hook on mute | 2 | "..." | ... |
| D2 Fast start | 0 | opens with "Hey" | |
| D4h Hook text | 2 | 6 words | |

### Rewrites
1. **Say:** ... **On screen:** ... **Visual:** ... (score 84: H1 2, H2 2, H3 1, H4 2, H5 1; D2 2, D4h 2; lower than the original on H5,
   1 against 2)
2. ...
3. ...
```

- Plain language, one short reason per row (under 15 words).
- Quotes are the user's exact words.
- Keep the user's facts; flag any line that states a figure the user did not give.

## Common pitfalls

- Do not reward length or polish: a short plain line can score 2 on every criterion.
- Do not count a question alone as curiosity. "Want to save money?" is a plain statement with a question mark (H2 0 or 1).
- Do not put the answer in the on-screen text; it removes the reason to keep watching (H5 1 at most).
- Do not invent numbers to raise the stakes. A rewrite with a made-up statistic is worse than the original.
- Do not grade the visual on taste. It counts only through H4 (does it show the mechanism) and H5 (does the text read on mute).
