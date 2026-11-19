# deslop-script: a personal finance tip, 45 seconds

Run on 2026-11-19 by an agent following `skills/deslop-script/SKILL.md`. The script is a made-up first draft of the kind an
assistant writes when asked for "a TikTok about paying yourself first". The person allowed rewrites.

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
11 tells and 1 to check in 97 spoken words (11.3 tells per 100 words, grade D)
  line   1  tell   meta-opener      "welcome back": talks about the video instead of starting it
  line   1  tell   meta-opener      "In today's video": talks about the video instead of starting it
  line   1  tell   stock-opener     "Hey guys": a stock way in that viewers have heard a thousand times
  line   2  tell   announced-turn   "Here's the thing": announces a turn instead of letting it land
  line   2  tell   fake-contrast    "it's not about willpower, it's": knocks down a view nobody held; say what the thing is
  line   3  tell   instant-answer   "The result? Nothing.": a question answered in the next breath; just say it
  line   3  tell   fragments        "The result? Nothing. No cushion.": chopped fragments for drama; a person speaks in whole thoughts
  line   3  check  three            "buy groceries, go out, and then save": a list of three; keep it only if the story has three
  line   4  tell   hype             "literally": a word of size standing in for a fact
  line   4  tell   hype             "game-changer": a word of size standing in for a fact
  line   4  tell   vague-source     "Studies show": a source nobody can check; name it or cut it
  line   7  tell   generic-cta      "Like and subscribe": a call to action that could end any video
```

## Changes

| Line | Habit | Before | After |
|---|---|---|---|
| 1 | Talking about the video, stock opening | "Hey guys, welcome back! In today's video we're talking about why your savings never grow." | "Your savings aren't growing because you save last." |
| 2 | Announced turn, fake contrast | "Here's the thing: it's not about willpower, it's about order." | cut; line 1 now says it |
| 3 | Instant answer, fragments | "The result? Nothing. No cushion. No plan. Zero." | "...and savings gets whatever is left, which is usually nothing." |
| 4 | Vague source, words of size | "Studies show that automating your savings is literally a game-changer." | cut; the next line shows the step instead |
| 6 | Pet word | "Honestly, it's that simple." | cut |
| 7 | Explained ending, generic call to action | "And that's why you should always pay yourself first. Like and subscribe for more money tips!" | "By the time you look at your balance, the saving already happened." |

## After

```
Your savings aren't growing because you save last.
Paycheck lands, rent goes out, groceries, a night out, and savings gets whatever is left, which is usually nothing.
Flip the order.
Set an automatic transfer for the morning your paycheck arrives, before you can touch it.
Even twenty-five dollars counts.
By the time you look at your balance, the saving already happened.
```

Scanner: `0 tells and 1 to check in 61 spoken words (0 tells per 100 words, grade A)`.

**Kept on purpose:** the list in line 2 (rent, groceries, a night out) is what the story has, not a reflex.
**Habits:** 11 in 97 words before, 0 in 61 after. The count measures habits, not quality.
