---
name: upload-preflight
description: Use when the user has rendered or exported a vertical video and wants to know whether TikTok, YouTube Shorts, Instagram Reels or Facebook Reels will accept it, or why an upload or a scheduled post failed. Runs a published checker with ffprobe and gives the FFmpeg fix for each failure.
---

# Upload preflight

A render that looks fine can still be refused or reprocessed: the wrong frame rate for an API, an audio codec a posting tool
rejects, a file past a size limit, a clip longer than the app takes. This skill runs
https://github.com/viewgum/shortform-preflight on the file, which reads it with `ffprobe` and checks it against the figures each
app publishes, then turns every failure into one FFmpeg command.

Not for: where text sits in the frame (use `short-form-specs`), or what the video says.

## Workflow

1. Clarify scope only if needed. Defaults: all four apps, and the rules for uploading in each app (`--route app`). For TikTok's
   web upload use `--route web`. If the user posts through a scheduler or their own code, use the publishing API rules
   (`--api`), which are stricter for Facebook Reels and Instagram. For TikTok's Direct Post, pass the account's limit
   (`max_video_post_duration_sec` from TikTok's creator info) as `--tiktok-endpoint direct --tiktok-max-seconds <n>`; without
   it, say the length is unverified.
2. Check the tools: `ffprobe -version` (FFmpeg), `node -v` (18 or newer) and `npx --version`. The first run downloads the
   checker from GitHub, so it also needs network access. If something is missing, say which, how to install it, and stop.
3. Run it, as JSON so you can read every row:
   `npx -y github:viewgum/shortform-preflight <file> --json` (add `--api`, or `--platform tiktok,youtube-shorts`, as needed).
   Exit code 0 means no check failed; 1 means a check failed or a required figure could not be read (the app shows as
   incomplete; say which measurement is missing); 2 means bad input.
4. For each fail, and each warn the user is likely to hit, give the cause in one line, the source the row cites, and one fix.
   Common fixes (adjust paths and keep the rest of the file as it is):
   - Frame rate outside a range: `ffmpeg -i in.mp4 -r 30 -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a copy -movflags +faststart -use_editlist 0 out.mp4`
   - Codec, chroma or profile refused: `ffmpeg -i in.mp4 -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart -use_editlist 0 out.mp4`
   - Moov atom at the end, or an edit list (Instagram's API refuses both): `ffmpeg -i in.mp4 -c copy -movflags +faststart -use_editlist 0 out.mp4`
   - Audio sample rate, channels or bitrate (the Facebook Reels API lists 48 kHz stereo, 128 kbps or more; an encoder set to exactly
     128k often averages a little under): `ffmpeg -i in.mp4 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -movflags +faststart -use_editlist 0 out.mp4`
   - Too long: cut it, `ffmpeg -i in.mp4 -t 89.9 -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart -use_editlist 0 out.mp4`
     (set `-t` a little under the limit: the cut can run a frame long).
   - Several rows at once: combine the options in one re-encode rather than chaining passes, as in the example run.
   - Every re-encode: add `-g 90` at 30 fps (`-g 72` at 24) so keyframes come every 3 seconds; Facebook's API asks for closed
     groups of pictures 2 to 5 seconds long, which the checker cannot test. Check with
     `ffprobe -v error -select_streams v -skip_frame nokey -show_entries frame=pts_time -of csv=p=0 out.mp4`.
   - Too large: lower the quality setting (a higher `-crf`) rather than the resolution.
   - Not 9:16: pad or crop to 1080 x 1920 only if the user wants it; say what will be lost.
5. After a fix, run the checker again on the new file and show that the row now passes.

## Output format

```
**File:** demo.mp4 · 1080 x 1920 · 95 s · 23.976 fps · H.264 · AAC
**Rules:** publishing APIs

| App | Result | Failing or warning rows |
|---|---|---|
| Facebook Reels | fail | length 95 s (API takes 3 to 90 s); frame rate 23.976 (needs 24 to 60); 44.1 kHz and mono (48 kHz stereo listed, warn) |
| Instagram Reels | fail | edit list present (none allowed); moov atom after the media (must be at the front) |

### Fix
One re-encode for all rows: `ffmpeg -i demo.mp4 -t 89.9 -r 30 -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -ar 48000 -ac 2 -g 90 -movflags +faststart -use_editlist 0 fixed.mp4`
(sources: Meta for Developers, Reels Publishing API and IG User Media)

**After the fix:** no fails.
```

- Quote the checker's own rows; do not restate limits from memory.
- Say which rules were used: app upload, web upload or the publishing API.
- Info rows (recommended bitrates, measured loudness) are not failures; mention them only if the user asks.

## Common pitfalls

- Do not re-encode when a remux fixes it. `-c copy` with `+faststart` keeps the quality.
- Do not change the resolution or aspect ratio unless the user asks; ask first, because cropping loses picture.
- Do not treat a warning as a refusal. Say what the app may do (reprocess, reject through the API) only as the source states it.
- Do not run FFmpeg over the original file. Always write a new file.
- Do not guess a limit the checker reports as not published. Say the app does not publish it.
