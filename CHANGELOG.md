# Changelog

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
