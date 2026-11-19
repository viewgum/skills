---
name: short-form-specs
description: Safe zones, length limits, caption limits and script word counts for vertical short video on TikTok, YouTube Shorts, Instagram Reels and Facebook Reels. Use when placing captions, titles, logos or faces in a 9:16 frame (Remotion, HyperFrames, ffmpeg, CapCut or any editor), sizing a script to a length, or writing a title or caption for one of these apps.
---

# Short-form video specs

Figures are pixels on a 1080 x 1920 frame, x from the left edge and y from the top. For another 9:16 size, scale x by
width / 1080 and y by height / 1920. Each figure's source and the day it was read are in `references/`.

The boxes are the safe zones the apps publish in their 9:16 ad guidance. What an app covers also changes with the placement, the
caption's length, the reading direction and the app version, so treat them as the published presets.

## Where text, faces and logos go

Unless the person names one app, keep every caption, title, logo and face inside the box that is within all four apps' safe
zones:

- y from 288 to 1248 (288 px from the top, 672 px from the bottom)
- x from 120 to 888 (120 px from the left, 192 px from the right)
- below y = 840, x no further right than 780 (TikTok's like and share column)

When the person names one app, use that app's box (left, top, right, bottom):

| App | Box | Button column |
|---|---|---|
| TikTok | 120, 240, 960, 1260 | from y = 840 down, x 780 and right of it is covered |
| YouTube Shorts | 48, 288, 888, 1248 | inside the right margin |
| Instagram Reels, Facebook Reels | 65, 269, 1015, 1248 | not modelled: Meta gives only percentages |

Reels also show icons on the lower right; for a Reels-only video, keep the lower right clear as for TikTok.

Centred captions on the all-apps box: up to 696 px wide above y = 840 (x 192 to 888), up to 480 px wide below it (x 300 to 780).
A wider caption block goes above y = 840.

The rest of the frame still shows: backgrounds, scenery and motion can fill it. Only text, faces, logos and anything the viewer
must read stay inside the box.

## Checking a layout

- In code, read `references/safe-zones.json`: `clearOnEvery.box` and `platforms.<id>.box` hold `left`, `right`, `top`,
  `bottom`, and `railTop` and `railLeft` for the button column.
- From a shell: `npx github:viewgum/short-form-video-specs check --rect x,y,width,height --size 1080x1920` exits 0 when the
  rectangle is inside every app's safe zone, 1 with the reason when not, and 2 on bad input. `--platform tiktok` checks one app.
- For a preview layer: `npx github:viewgum/short-form-video-specs overlay --platform all --size 1080x1920 > overlay.svg`. Use
  it while composing and keep it out of the final render.

## Length

- YouTube Shorts: square or vertical uploads up to 3 minutes.
- Instagram Reels: up to 20 minutes made in the app; reels over 3 minutes are not recommended to new audiences. Through the
  publishing API, 3 seconds to 15 minutes.
- Facebook Reels: no length limit in the app; the Page Reels API takes 3 to 90 seconds.
- TikTok: no single published figure. Its posting API returns each account's own maximum (`max_video_post_duration_sec`);
  non-Spark In-Feed ads run up to 10 minutes.

## Script length

Words that fit = seconds x words a minute / 60, at 150, 183 or 196 words a minute (measured rates, used as slow, normal and fast
presets). 30 seconds holds 75 to 98 words and 60 seconds 150 to 196. A 3 second opening line holds 7 to 9 words. Use 150 when the
voice is slow or the script is dense with numbers.

## Titles and captions

- YouTube: title up to 100 characters, description up to 5,000; a video with more than 60 hashtags has all of them ignored.
- TikTok: caption up to 2,200 through the Content Posting API (counted in UTF-16 units).
- Instagram: caption up to 2,200 through Meta's publishing API; up to 5 hashtags on a post or reel in the app.
- Facebook Reels: no caption limit in Meta's Reels documentation.

## When a figure looks out of date

The apps change their layouts. If the person shows a current screenshot that disagrees, follow the screenshot and say which
figure differs.

## Source

The figures and `references/` come from https://github.com/viewgum/short-form-video-specs, CC BY 4.0, credit "ViewGum,
viewgum.com".
