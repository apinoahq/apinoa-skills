# Changelog

## 0.1.13

- `apinoa-answers` covers ByteDance Dola (`dola`): ten countries, follow-ups with `conversation`. Dola lists its sources but does not tie them to sentences, so `citations` is empty and `cited` is false.

## 0.1.12

- `apinoa-social`: the small extra requests no longer cost extra units: Instagram video views and sound, YouTube channel About and @handle lookup, the watch page beside a video, TikTok username and hashtag-name lookups, LinkedIn company-name lookups. Only TikTok `media` (2) and Reddit's extras still add units.

## 0.1.11

- `apinoa-social`: Instagram video views, Instagram `include=audio`, YouTube's watch-page fields (subscribers, comment count, hashtags) and YouTube comments `sort=recent` no longer cost an extra unit.

## 0.1.10

- `apinoa-social`: Instagram `post` takes `include=audio` (the sound's file and full length, one more unit); YouTube comments take `sort=top|recent` (top is the default; recent is one more unit).

## 0.1.9

- `apinoa-social`: an Instagram video post now states `metrics.views` (one more unit); YouTube `post` takes `include=watch` (subscribers, comment count, hashtags and mentions, one more unit).

## 0.1.8

- `apinoa-social`: a sound's own audio file — `group` with `sound` returns the track (`audio.url`, title, artist, length) for TikTok and Instagram.

## 0.1.7

- New skill `apinoa-ocr`: the OCR API (`POST /v1/ocr`), the text in an image with each region's position and confidence, one credit per image.
- `apinoa-image-translate` covers translation only; reading text without translating it moved to `apinoa-ocr`.

## 0.1.6

- New skill `apinoa-company`: a website's technologies and the vendors its domain holds accounts with, from the domain.
- `apinoa-social` covers Facebook (Pages and the Ad Library) and LinkedIn jobs by `company`.
- `apinoa-answers` covers Microsoft Copilot.

## 0.1.5

- The plugin connects to the hosted MCP server (`https://api.apinoa.com/mcp`) instead of starting `apinoa-mcp` on your computer.
- You sign in with your apinoa account through `/mcp`; the plugin no longer asks for an API key when enabled.

## 0.1.4

- The plugin runs `apinoa-mcp@0.2.8`.
- Every skill says how to get a key from the terminal (`npx apinoa-mcp login`) and how to add the hosted MCP server (`https://api.apinoa.com/mcp`, OAuth sign-in).

## 0.1.3

- The marketplace skill's Walmart example uses a product that is listed; the old id answered
  `404 PRODUCT_NOT_FOUND`.

## 0.1.2

- The plugin runs `apinoa-mcp@0.2.7`.

## 0.1.1

- The plugin runs `apinoa-mcp@0.2.6`, a pinned version, instead of the newest one.
- The README says what data the skills and the MCP server send, and where.

## 0.1.0

- Five skills: `apinoa-marketplace`, `apinoa-social`, `apinoa-serp`, `apinoa-answers` and `apinoa-image-translate`.
- A Claude Code plugin bundling them with the apinoa MCP server; it asks for your API key when enabled.
