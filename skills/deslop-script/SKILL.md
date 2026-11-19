---
name: deslop-script
description: Use when the user wants a TikTok, Short or Reel script to stop sounding machine-written. Finds the habits viewers recognise (filler openers, announced twists, fake contrasts, reflexive threes, hype words, stock phrases, explained endings, generic calls to action, dashes), quotes each one, and rewrites only those lines, keeping the user's facts and voice.
---

# Deslop a script

People scroll past narration that sounds generated, and they can tell within a line or two. The giveaways are habits, not
topics: an opening that talks about the video, a twist announced before it happens, a contrast with a view nobody held, words
of size where a fact should be, an ending that explains the point. This skill finds those habits in a script, shows each one,
and fixes only the lines that have them. The facts, names, numbers and the creator's own way of talking stay as they are.

Not for: writing a script from nothing (use `short-form-script`) or grading only the first line (use `hook-check`).

## Workflow

1. Get the script, in any layout. Ask one thing only if it is unclear: may lines be rewritten, or should the words stay as the
   creator wrote them? If they stay, report the habits and do not rewrite.
2. If `scan.mjs` sits next to this file and Node is available, run it for a first pass:
   `node scan.mjs script.txt` (or `--json`). It catches the listed phrases, dashes, ellipses, emoji, instant answers, fragment
   runs, pet words and explained endings. It cannot judge meaning, so read the script yourself as well.
3. Read the script as if hearing it once, out loud, and go through the checklist below. Quote every habit you find.
4. Rewrite only the flagged lines. Say the plain thing each habit was standing in for. Keep every fact, name and number; never
   add a figure, quote or claim. If the creator clearly talks a certain way (they greet, they say "so"), keep it.
5. Read the result once more for new habits the rewrite brought in, and for length: it should be about as long as before or
   shorter, never padded.
6. Optional scoring: count the habits before and after, and give the count per 100 spoken words. Say that the count measures
   habits, not quality; a script can have none and still be dull.

## Checklist

| Habit | What it looks like | What to do instead |
|---|---|---|
| Talking about the video | "In today's video", "welcome back", "let's dive in", "without further ado", "stick around to the end" | Start with the first real sentence of the story |
| Stock openings | "Have you ever wondered", "What if I told you", "Picture this", "In today's fast-paced world", "When it comes to" | Open on the strangest true detail, the number, or what someone was trying to do |
| Slide-deck signposting | "First, let's look at... Second..." in a 40 second script | Cause and effect in order: this happened, so that happened |
| Announcing the turn | "Here's the thing", "But here's the twist", "Now get this", "Let that sink in", "And that's when everything changed" | Just tell the turn; if it is good, it lands on its own |
| Fake contrast | "It's not a diet, it's a lifestyle", "Not because he was lazy, but because he was tired" | Say what the thing is. Keep a contrast only if someone in the story really believed the first half |
| Instant answers | "The result? Chaos." "Her plan? Simple." | State it: "It went badly." Keep a question only if it stays open for a while |
| Drama fragments | "No warning. No plan. Nothing." | One whole sentence that carries the same facts |
| Threes by reflex | Three adjectives or three examples because three sounds finished | Use as many as the story actually has |
| Words of size | insane, mind-blowing, game-changer, incredible, literally, absolutely, truly | Give the fact that made it big |
| Telling the feeling | shocking, heartbreaking, you won't believe | Say what happened and let the viewer react |
| Stock phrasing | little did they know, the rest is history, a testament to, in a world where, unlock, delve, intricate, underscore, showcase, pivotal, crucial, elevate, seamless | The plain words a person would use |
| Words for the page | moreover, furthermore, utilize, numerous, individuals, in order to | Spoken words: also, use, many, people, to |
| Vague sources | "Studies show", "experts say" | Name the source, or say it as your own claim, or cut it |
| Pet words | actually, honestly, just, basically, really, on repeat | Keep the first, cut the rest |
| Even beat | Every sentence the same short length | Let some sentences run and some stop short, as speech does |
| Explained endings | "And that's why you should...", "So remember...", "In conclusion", "Ultimately, small habits...", "What would you do?" | End on the last thing that happens, or the one useful line |
| Generic calls to action | "Like and subscribe", "Follow for more", "Comment below" | One specific ask that fits this video, or none |
| Punctuation for drama | dashes, ellipses, "Here's the truth:", semicolons, emoji in spoken lines | Full stops and commas; the voice does the pausing |
| Leftovers | `**bold**`, `### headings`, "[Hook]", "Voiceover:", "Sure, here's your script" | Remove everything that is not said or shown |

## Flag, do not force

Some habits are fine once, or are the creator's own voice: a real list of three, one honest contrast, a dash in a writer's style,
a call to action the creator always uses, a greeting they open every video with. Flag them, say why, and leave them unless the
user wants them gone. The scanner marks the commonest of these as "check" rather than "tell".

## Why these habits

Most of them show up in published lists of how generated text reads, such as Wikipedia's guide to signs of AI writing
(https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing), and some words rose sharply in writing after chat assistants
arrived, measured across millions of papers (Kobak and others, "Delving into LLM-assisted writing in biomedical publications
through excess vocabulary", https://arxiv.org/abs/2406.07016). Treat the lists as habits to check, not proof that a script was
generated: people write these too.

## Output format

```
**Habits found:** 9 in 118 spoken words (7.6 per 100 words)
**After:** 0 in 104 words

| Line | Habit | Before | After |
|---|---|---|---|
| 1 | Talking about the video | "In today's video, we're talking about..." | "..." |
| 3 | Instant answer | "The result? Chaos." | "..." |

### Clean script
<the full script, with only the flagged lines changed, in the user's layout>

**Kept on purpose:** <any habit left in, and why: the creator's voice, a real contrast, a list that really has three>
```

- Quote the user's exact words in Before. Keep the user's layout (plain text, numbered lines, or HOOK / LINES / CLOSE).
- One reason per change, under 15 words.
- If the user asked for the words to stay, give only the table and the counts, with suggestions in After.

## Common pitfalls

- Do not swap one stock phrase for its cousin ("here's the thing" for "here's the deal"). Say the plain thing it stood for.
- Do not flatten the creator's real voice. A greeting or a pet phrase that is theirs on every video stays.
- Do not fix facts by rewriting. If a claim looks wrong, flag it; changing a number silently is worse than a slop word.
- Do not pad to make up length after cuts. Shorter and clearer is the goal.
- Do not trust the scanner alone. It misses meaning (a fake contrast in unusual words) and flags some fine lines (a real list
  of three). Read every flag.

If you'd rather skip writing and editing altogether, ViewGum makes the whole short from one line:
https://viewgum.com
