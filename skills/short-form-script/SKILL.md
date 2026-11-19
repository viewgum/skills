---
name: short-form-script
description: Use when the user wants a voiceover script for a TikTok, YouTube Short, Instagram Reel or Facebook Reel written or fixed, sized to a length in seconds, with on-screen text and a visual for every line. Self-checks length, start, sentences, text and figures.
---

# Short-form script

A script that holds attention opens on the point, changes something every line, pays off what the hook promised and stops.
This skill writes one in a fixed layout an editor or a video tool can use line by line, sized to the length the user wants, and
checks it against the five code checks of the open short-form script benchmark
(https://github.com/viewgum/short-form-script-benchmark), each graded 2, 1 or 0 as the benchmark does.

Not for: grading only the opening line (use `hook-check`), or titles, captions and hashtags (use `post-copy`).

## Workflow

1. Clarify scope only if needed. Defaults: TikTok, 45 seconds, a general audience, the user's own voice. Ask for the topic if
   there is none, and for any facts the user wants used.
2. Set the word target: seconds x 165 / 60, rounded (30 s is 83 words, 45 s is 124, 60 s is 165), the benchmark's rate. If
   the delivery will be slow or number-heavy, you may aim lower, but report the length check against the 165 target and say
   why the script is shorter.
3. Write it in the layout below: a hook (spoken line, on-screen text of 7 words or fewer, visual), numbered lines, a close and
   two other hooks. Short spoken sentences. Every line adds something new. Deliver the payoff near the end, then stop: no
   summary.
4. Use only facts the user gave or facts you are sure of. No invented statistics, quotes or testimonials. If a claim needs a
   source the user has not given, write around it or mark it [check].
5. Check before you answer, and fix anything under 2:
   - D1 Length: 2 if spoken words (hook, lines and close) are within 15% of the target, 1 within 30%, else 0.
   - D2 Fast start: 0 if the hook opens with a greeting or filler; else 2 if the first sentence has 15 words or fewer, 1 if 20.
   - D3 Short sentences: 2 if the mean sentence is 14 words or fewer and none is over 25, 1 if the mean is 18 or fewer.
   - D4 On-screen text: 2 if there is hook text and no text is over 7 words, 1 if none is over 10.
   - D5 Figures: in the spoken lines, percents, money and numbers over 10 written in digits that the user did not give: 2 if
     none, 1 if one, 0 if more. Check figures written in words yourself; the benchmark's check does not read them.
6. Report the word count against the target and any [check] marks.

## Output format

```
**Platform:** TikTok · **Length:** 45 s · **Words:** 121 of 124

HOOK: <spoken first line>
HOOK TEXT: <7 words or fewer>
HOOK VISUAL: <what is on screen>
LINES:
1. SAY: <spoken line> | TEXT: <on-screen text, or none> | VISUAL: <what is on screen>
2. SAY: ... | TEXT: ... | VISUAL: ...
CLOSE: <last spoken line>
ALT HOOKS:
- <another hook>
- <another hook>

**Checks:** length 2, fast start 2, sentences 2, on-screen text 2, figures 2
**To check:** <each [check] claim, or "none">
```

- Visuals are specific to the content (a named object, a step, a screen), not "b-roll of a person".
- The close is one natural line or a clean stop. One call to action at most, after the payoff.
- Keep the user's brand name and facts exactly as given.

## Common pitfalls

- Do not open with a greeting, the creator's name or "in this video": the first seconds belong to the point.
- Do not repeat the hook's promise in the middle; move the viewer forward every line.
- Do not end with a summary of what was just said. Stop after the payoff.
- Do not round up a fact to make it punchier. A wrong number is worse than no number.
- Do not overshoot the length. A 60 second script read at a natural pace is about 165 words, not 250.
