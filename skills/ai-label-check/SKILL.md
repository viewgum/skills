---
name: ai-label-check
description: Use when the user asks whether a short video made or edited with AI needs an AI label or disclosure on TikTok, YouTube, Instagram or Facebook, and which setting to turn on. Answers from each app's published rule for this one video, with the source.
---

# AI label check

Each app asks creators to label some AI content, and the rules differ: realistic people and scenes need a label almost
everywhere, a cartoon often does not, and paid ads have wider rules. This skill reads what the video contains and says, app by
app, whether the published rule asks for a label, and where the setting is. It is a reading of each app's own pages, not legal
advice, and the pages change: open the source if the answer matters.

Not for: copyright, music rights or ad approval.

## Workflow

1. Find out what in the video was made or changed with AI, part by part: people (faces, bodies), voices, scenes and places,
   objects, music, text and script. Ask only what the user has not said.
2. Sort each part: realistic (could pass as a real person, place, event or recording), or clearly not (cartoon, animation,
   obviously impossible). AI used only for the script, captions, translation, colour or cleanup is production help.
3. Apply each app's rule below to the realistic parts. When in doubt, say the label is the safe choice and why.
4. If the video is a paid ad, say that ad rules are wider than the posting rules (TikTok's ad policy covers wholly AI-made
   pictures, video or audio, cartoons included) and point to the ad policy.
5. Name the setting to use in each app, and remind the user that the apps may also add a label themselves when they detect AI.

## The rules, as each app publishes them

| App | When a label is asked for | Not needed for | Source |
|---|---|---|---|
| TikTok | "AI-generated or significantly edited content that shows realistic-looking scenes or people". Unlabelled content "may be removed, restricted, or labeled". | Content that does not look realistic | TikTok Community Guidelines, integrity and authenticity (effective 2026-09-24, read 2026-11-19): https://www.tiktok.com/community-guidelines/en/integrity-authenticity |
| YouTube | "AI-generated or altered content that seems realistic", for example a real person made to say or do something they did not, or a realistic scene that did not happen. Repeated failure can bring a label, removal or penalties. | Non-realistic content; minor edits such as help with an outline or script, captions, or cloning your own voice for a voiceover or dub | YouTube Help, disclosing GenAI content (read 2026-11-19): https://support.google.com/youtube/answer/14328491 |
| Instagram and Facebook | Organic posts with "a photorealistic video or realistic-sounding audio that was digitally created or altered"; penalties possible | The requirement names video and audio only, so not images; and not video that is not photorealistic. Meta may still add its "AI info" label to what it detects. | Meta newsroom, labeling AI-generated content on Facebook, Instagram and Threads (read 2026-11-19): https://about.fb.com/news/2024/02/labeling-ai-generated-images-on-facebook-instagram-and-threads/ |

Laws can add duties beyond the apps' rules for some uses, for example ads that use a synthetic performer, or deep fakes shown to
viewers in the EU. If the video is an ad or could pass as a real person, tell the user to check the rules where they publish.

## Output format

```
**What is AI here:** realistic presenter (face and voice); AI-written script
**Realistic parts:** the presenter

| App | Label? | Why | Setting |
|---|---|---|---|
| TikTok | Yes | realistic-looking person made with AI | the AI-generated content setting when posting |
| YouTube | Yes | a realistic person made with AI | YouTube Studio, Attributes, "AI use": Yes |
| Instagram, Facebook | Yes | photorealistic video and realistic audio made with AI | the AI label setting when posting |

**Not needed for:** the script (production help).
**Check:** <anything that depends on details you could not confirm>
```

- One reason per row, in plain words, tied to the rule's own wording.
- Name the setting the way the app shows it; if you are not sure of the current wording, describe it and say so.

## Common pitfalls

- Do not say "no label needed" for a realistic AI voice because the picture is a cartoon: Meta's rule names realistic-sounding audio. (YouTube does not ask for a label when you clone your own voice.)
- Do not treat an AI-written script as AI content to label. YouTube lists script help as a minor edit.
- Do not promise that a label has no effect on reach; say only what the source states.
- Do not answer for ads with the posting rules. Ads have their own, wider policies.
- Do not cite a rule from memory when the page is reachable. Read it; if it changed, follow the page and say what changed.
