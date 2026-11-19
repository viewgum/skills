---
name: ai-label-check
description: Use when the user asks whether a short video made or edited with AI needs an AI label or disclosure on TikTok, YouTube, Instagram or Facebook, and which setting to turn on. Answers from each app's published rule for this one video, with the source.
---

# AI label check

Each app asks creators to label some AI content, and the rules differ: realistic people and scenes need a label almost
everywhere, a cartoon often does not, and paid ads have wider rules. This skill reads what the video contains and says, app by
app, whether the published rule asks for a label, and where the setting is. It is a reading of each app's own pages, not legal
advice, and the pages change: open the source if the answer matters.

Not for: copyright, music rights or ad approval beyond the label.

## Workflow

1. Find out what in the video was made or changed with AI, part by part: people (faces, bodies), voices, music, scenes and
   places, objects, text and script. Ask only what the user has not said.
2. Sort the picture and the sound separately. A part is realistic when it could pass as a real person, place, event or
   recording; clearly not when it is a cartoon, an animation or obviously impossible. A realistic voice over a cartoon is still a
   realistic part. AI used only for an outline or script, captions, colour or cleanup is production help; a dub is production
   help on YouTube only when it clones the creator's own voice.
3. Apply each app's rule below to the parts it names: YouTube also covers AI music that is the main focus of the video, even in
   an animation; Meta covers realistic-sounding audio on its own. When in doubt, say the label is the safe choice and why.
4. Some uses are not allowed even with a label, for example making a real person appear to endorse something or say what they
   did not, to mislead. If the video does that, say so and stop; a label does not fix it.
5. If the video is a TikTok ad, the ads policy applies instead: completely AI-generated images, video or audio, and AI voice
   cloning of the main subject, need TikTok's AIGC label or a clear disclaimer, caption, watermark or sticker of the advertiser's
   own; undisclosed AI content gets the ad rejected or restricted (TikTok Ads policy, misleading and false content, updated
   November 2026: https://ads.tiktok.com/resources/help/article/tiktok-ads-policy-misleading-and-false-content). For other
   apps' ads, say their ad policies apply and were not read here.
6. Name the setting to use in each app, and remind the user that the apps may also add a label themselves when they detect AI.

## The rules, as each app publishes them

| App | When a label is asked for | Not needed for | Source |
|---|---|---|---|
| TikTok | "AI-generated or significantly edited content that shows realistic-looking scenes or people". Unlabelled content "may be removed, restricted, or labeled". | Content that does not look realistic. The rule names scenes and people; for a realistic AI voice over a cartoon, labelling is the safe choice. | TikTok Community Guidelines, integrity and authenticity (effective 2026-09-24, read 2026-11-19): https://www.tiktok.com/community-guidelines/en/integrity-authenticity |
| YouTube | "AI-generated or altered content that seems realistic", for example a real person made to say or do something they did not, a realistic scene that did not happen, or AI music that is the main focus of the video. Repeated failure can bring a label, removal or penalties. | Non-realistic content; minor edits such as help with an outline or script, captions, or cloning your own voice for a voiceover or dub | YouTube Help, disclosing GenAI content (read 2026-11-19): https://support.google.com/youtube/answer/14328491 |
| Instagram and Facebook | Organic posts with "a photorealistic video or realistic-sounding audio that was digitally created or altered" (either one is enough); penalties possible | Images, and video that is neither photorealistic nor carries realistic-sounding audio. Meta may still add its "AI info" label to content it detects. | Meta newsroom, February 2024 (the rule, read 2026-11-19): https://about.fb.com/news/2024/02/labeling-ai-generated-images-on-facebook-instagram-and-threads/ and April 2024 (the "AI info" label): https://about.fb.com/news/2024/04/metas-approach-to-labeling-ai-generated-content-and-manipulated-media/ |

Laws can add duties beyond the apps' rules for some uses, for example ads that use a synthetic performer, or deep fakes shown to
viewers in the EU. If the video is an ad or could pass as a real person, tell the user to check the rules where they publish.

## Output format

```
**What is AI here:** realistic presenter (face and voice); AI-written script
**Realistic parts:** the presenter

| App | Label? | Why | Setting |
|---|---|---|---|
| TikTok | Yes | realistic-looking person made with AI | the AI-generated content setting when posting (check its current place in the post screen) |
| YouTube | Yes | a realistic person made with AI | YouTube Studio, Attributes, "AI use": Yes |
| Instagram, Facebook | Yes | photorealistic video and realistic audio made with AI | the AI label option when posting (Meta's wording varies; check the post screen) |

**Not needed for:** the script (production help).
**Sources:** <one link per app used above>
**Check:** <anything that depends on details you could not confirm>
```

- One reason per row, in plain words, tied to the rule's own wording.
- Name the setting the way the app shows it; if you are not sure of the current wording, describe it and say so.

## Common pitfalls

- Do not say "no label needed" for a realistic AI voice because the picture is a cartoon: Meta's rule names realistic-sounding audio on its own. YouTube exempts only a clone of the creator's own voice.
- Do not skip the music: on YouTube, AI music that is the main focus needs disclosure even when the picture is a cartoon.
- Do not treat an AI-written script as AI content to label. YouTube lists script help as a minor edit.
- Do not promise that a label has no effect on reach; say only what the source states.
- Do not answer for ads with the posting rules. TikTok's ads policy is wider; other apps' ad policies were not read here.
- Do not cite a rule from memory when the page is reachable. Read it; if it changed, follow the page and say what changed.
