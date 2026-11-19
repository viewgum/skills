---
name: viewgum-shorts
description: Make, edit and export vertical short videos (TikTok, Reels, Shorts) with the ViewGum MCP connector. Use when the person asks for a short video, a faceless short, a Reel or a TikTok on a topic, or to change or export one made with ViewGum.
---

# Making shorts with ViewGum

The ViewGum connector (https://viewgum.com/mcp) must be connected first; https://viewgum.com/agents has the steps for each assistant.

## Work this way

1. If the person has not picked a look, call list_formats and offer two or three styles in plain words, plus the writer models when they care which model writes.
2. Call quote_short with the topic, the style or format, the length in seconds if they asked for one, and the writer if one was chosen. Tell the person the credits it costs and ask before going on. Never call a paid tool without a yes.
3. Call make_short with the quote_id. Then follow it with get_short and wait_seconds (25 is safe), telling the person the step it is on. Do not call get_short in a fast loop.
4. When it is ready, show the title and the script. For changes, call quote_edit with their words, show the planned steps and the price, and call edit_short only after a yes.
5. To get the video file, call quote_export, ask, then export_short, then get_short until the export is done; give the person the download link and the post copy for each platform.
6. For an exact change (trim a clip, fix a caption word, move or level a sound, add a text or an arrow), call get_short_view for the rows and their ids, list_capabilities for each edit's fields, then propose_edits. Show the person what would change and call apply_edit_session after a yes; it is free and undoes in one step in the editor. Before calling an exported short done, check_export shows stills and its loudness.

## Good to know

- Sending the same quote_id again never charges twice; an answer with replayed: true is that same action.
- A refusal for a daily cap means this connection reached its limit, which the person can change in ViewGum's Settings; tell them, do not retry.
