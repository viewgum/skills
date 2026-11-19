# deslop-script: a personal finance tip

Run on 2026-11-19 by an agent following `skills/deslop-script/SKILL.md`. The script is a made-up first draft of the kind an assistant writes when asked for "a TikTok about paying yourself first". The person allowed rewrites and gave no set length.

## Before

```
Hey guys, welcome back! In today's video we're talking about why your savings never grow.
Here's the thing: it's not about willpower, it's about order.
Most people pay their bills, buy groceries, go out, and then save whatever's left. The result? Nothing. No cushion. No plan. Zero.
Studies show that automating your savings is literally a game-changer.
So set up an automatic transfer the morning your paycheck lands, before you can touch it.
Even twenty-five dollars counts. Honestly, it's that simple.
And that's why you should always pay yourself first. Like and subscribe for more money tips!
```

Scanner (`node scan.mjs before.txt`):

```
9 tells and 3 to check in 97 spoken words, about 35 s at 165 words a minute (9.3 tells per 100 words, grade D)
  line   1  check  greeting          "welcome back": a greeting; keep it only if the creator opens every video this way
  line   1  check  greeting          "Hey guys": a greeting; keep it only if the creator opens every video this way
  line   1  tell   meta-opener       "In today's video": talks about the video instead of starting it
  line   2  tell   announced-turn    "Here's the thing": announces a turn instead of letting it land
  line   2  tell   fake-contrast     "not about willpower, it's about": knocks down a view nobody held; say what the thing is
  line   3  tell   fragments         "The result? Nothing. No cushion.": chopped fragments for drama; a person speaks in whole thoughts
  line   3  tell   instant-answer    "The result? Nothing.": a stock question answered in the next breath; just say it
  line   4  tell   vague-source      "Studies show": a source nobody can check: name it, or flag the claim
  line   4  check  intensifier       "literally": fine in speech once; stacked, it stands in for a fact
  line   4  tell   hype              "game-changer": a word of size standing in for a fact
  line   7  tell   explained-ending  "And that's why you should always pay yourself first.": the ending explains the point; stop one line earlier
  line   7  tell   generic-cta       "Like and subscribe": a call to action or engagement bait that could end any video
```

## Changes

| Line | Habit | Before | After |
|---|---|---|---|
| 1 | Talking about the video; a greeting that is not this creator's habit | "Hey guys, welcome back! In today's video we're talking about why your savings never grow." | "Your savings aren't growing because you save last." |
| 2 | Announced turn, fake contrast | "Here's the thing: it's not about willpower, it's about order." | cut; line 1 now says it |
| 3 | Instant answer, fragments | "The result? Nothing. No cushion. No plan. Zero." | "...and then save whatever's left, which is usually nothing." and a new short line, "Flip the order.", which says the turn line 2 announced |
| 4 | Vague source, words of size | "Studies show that automating your savings is literally a game-changer." | cut, and flagged to the creator: no source was given, so it is not restated as their own claim |
| 6 | Filler | "Honestly, it's that simple." | cut |
| 7 | Explained ending, generic call to action | "And that's why you should always pay yourself first. Like and subscribe for more money tips!" | "By the time you look at your balance, the saving already happened." |

## After

```
Your savings aren't growing because you save last.
Most people pay their bills, buy groceries, go out, and then save whatever's left, which is usually nothing.
Flip the order.
So set up an automatic transfer the morning your paycheck lands, before you can touch it.
Even twenty-five dollars counts.
By the time you look at your balance, the saving already happened.
```

Scanner:

```
0 tells and 0 to check in 61 spoken words, about 22 s at 165 words a minute (0 tells per 100 words, grade A)
```

**Kept on purpose:** the list in line 2 (pay bills, buy groceries, go out) is the draft's own, and the story has those
three; the transfer instruction in line 4 is the draft's words, unchanged.
**Flagged to the creator:** "Studies show" had no source. If there is one, name it in a line of its own.
**Runtime:** about 35 s before and 22 s after at 165 words a minute. If this is meant to fill 45 seconds, it needs another real
step from the creator, not padding.
**Counts:** the scanner found 9 tells and 3 to check before, none after. The edit also removed the filler line 6, which the
scanner does not count. The count measures habits, not quality.
