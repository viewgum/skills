---
name: post-copy
description: Use when the user wants the title, caption and hashtags for one short video written for TikTok, YouTube Shorts, Instagram Reels and Facebook Reels, each inside that app's published limits, from a script, a transcript or a description of the video.
---

# Post copy

Each app reads the words around a video differently: YouTube has a title and a description, TikTok and Reels have one caption.
This skill writes the copy for each app from what the video actually says, and keeps every field inside the limit the app
publishes. Limits come from https://github.com/viewgum/short-form-video-specs, where each has its source and the date it was read.

Not for: the script itself (use `short-form-script`) or the opening line (use `hook-check`).

## Workflow

1. Clarify scope only if needed. Defaults: all four apps, the language of the script, no brand name unless the user gives one.
   Read the script or transcript first; if there is none, ask what the video says and shows.
2. Find the one thing the video promises and the words a viewer would search for it with. Use those words early in the title
   and the first line of each caption, where they show before the text is cut off in the feed.
3. Write each app's fields within its limits:

| App | Fields and limits, with where each figure applies |
|---|---|
| YouTube Shorts | Title up to 100 characters. Description up to 5,000 characters in YouTube Studio (the Data API counts 5,000 bytes, so accented letters and emoji use more). A video with more than 60 hashtags has all of them ignored. |
| TikTok | Caption up to 2,200 UTF-16 code units through TikTok's Content Posting API; TikTok publishes no separate figure for the app. |
| Instagram Reels | Caption up to 2,200 characters through Meta's publishing API. Up to 5 hashtags on a reel in the app (the API accepts 30). |
| Facebook Reels | No caption limit found in Meta's Reels publishing documentation; through the Page Reels API a reel can also carry a title. |

4. Hashtags: 3 to 5 that describe the topic, the format or the audience, the same set or close to it on every app. No
   tags unrelated to the video.
5. Count the characters of every field and show the counts. With a code tool, count exactly: in JavaScript, `s.length` gives
   UTF-16 code units (TikTok's count) and `Buffer.byteLength(s, "utf8")` gives bytes (YouTube's Data API). Without one, stay at
   least 10% under each limit and mark the counts as approximate. Cut anything over a limit; never rely on the app to cut it.

## Output format

```
**Promise:** <one line: what the viewer gets>
**Search words:** <3 to 6 words or phrases>

### YouTube Shorts
**Title** (54/100): ...
**Description** (212/5000): ...

### TikTok
**Caption** (148/2200): ...

### Instagram Reels
**Caption** (151/2200, 4 hashtags): ...

### Facebook Reels
**Caption** (96): ...
```

- Plain words a person would type into search. No clickbait the video does not pay off.
- The first line of every caption stands alone: it is often the only line people see.

## Common pitfalls

- Do not promise what the video does not show. A title that misleads costs the viewer's trust and the watch time.
- Do not stuff hashtags. Use a few that describe the video; on Instagram more than 5 is not allowed in the app, and on YouTube more than 60 voids them all.
- Do not copy the same caption into the YouTube title: the title has its own limit and shows differently.
- Do not count characters by eye when you can count them. Most emoji count as two or more UTF-16 code units in TikTok's count.
- Do not invent facts, numbers or quotes to make the caption stronger. Use only what the video says.
