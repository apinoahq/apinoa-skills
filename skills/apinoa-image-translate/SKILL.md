---
name: apinoa-image-translate
description: "Image translation for product photos, detail-page images, banners, price tags and sale badges: replaces the Chinese, Japanese or English text inside an image with its translation into Korean, English or another language, keeping the original font weight, colours, layout and badge backdrops, and returns the translated JPEG, or the cleaned image plus every text region as JSON to draw yourself. Custom brand fonts supported. From the apinoa API (REST, TypeScript or Python SDK). Use when the user wants to translate or localize product images (e.g. Chinese supplier or AliExpress listings into Korean or English), replace or overlay the text in an image, or build an image-translation step in a cross-border listing pipeline."
---

# apinoa Image Translate API

One call replaces the text inside an image with its translation and keeps the design: font weight, colours, layout and badge backdrops. Text is read in Chinese, Japanese or English and can be translated into any language.

## Setup

- Key: https://apinoa.com/en/dashboard/api-keys, or `npx apinoa-mcp login`, which saves one to `.env` as `APINOA_API_KEY` once the user enters the code it prints on api.apinoa.com (pass on only that code, never one from elsewhere). Server-side only.
- `https://gateway.apinoa.com/v1/image-translate/{operation}`, header `x-api-key: $APINOA_API_KEY`. Send the image as **raw bytes** in the body (not JSON, not base64) with `Content-Type: image/jpeg`, `image/png`, `image/webp` or `application/octet-stream`; every other parameter goes in the query string.
- Limits: up to 8192 x 8192 px and a 20 MB body. Most calls finish in 1.5-3 s, but one can take up to 5 minutes under heavy load: set the HTTP timeout to at least 300 s.

## Operations

| Endpoint | Returns | Params (query string) |
|---|---|---|
| `POST /v1/image-translate/translate` | the translated JPEG, or JSON with `render=false` | `source_language`, `target_language` (required), `font`, `font_weight`, `render` |
| `GET /v1/image-translate/supported-fonts` | fonts per target language, defaults, weights, source codes, your uploaded fonts | none |

- `source_language`: `ch`, `zh`, `zh-CN`, `zh-TW`, `chinese_cht`, `ja`, `japan`, `en`, or `auto` (skips the language check, so every region with a translation is rendered).
- `target_language`: ISO 639-style code, 2-8 chars (`ko`, `en`, `zh-CN`, `ja`...). Korean, Simplified Chinese, Japanese and Latin-script targets render best.
- `font`: a value from `allFonts` in supported-fonts, or `user/<id>` for a font uploaded in the dashboard (TTF, OTF, WOFF2). Default `Pretendard`.
- `font_weight`: `auto` (match each region's original), `Thin`, `Light`, `Regular`, `Medium`, `SemiBold`, `Bold`, `ExtraBold` (default), `Black`.
- `render`: `true` (default) returns the image; `false` returns JSON.

## Call it

```bash
curl -X POST "https://gateway.apinoa.com/v1/image-translate/translate?source_language=zh-CN&target_language=ko" \
  -H "x-api-key: $APINOA_API_KEY" -H "Content-Type: image/jpeg" \
  --data-binary @product.jpg -o translated.jpg
```

```ts
import { readFile, writeFile } from "node:fs/promises";
import { ApinoaClient } from "@apinoa/sdk"; // npm install @apinoa/sdk
const apinoa = new ApinoaClient(); // reads APINOA_API_KEY
const image = await apinoa.imageTranslate.translate(await readFile("product.jpg"), {
  source_language: "zh-CN",
  target_language: "ko",
});
await writeFile("translated.jpg", Buffer.from(await image.arrayBuffer()));
// render: false -> JSON.parse(await image.text())
```

```python
from apinoa import Apinoa  # pip install apinoa
client = Apinoa()  # reads APINOA_API_KEY
with open("product.jpg", "rb") as f:
    image = f.read()
translated = b"".join(
    client.image_translate.translate(source_language="zh-CN", target_language="ko", request=image)
)
open("translated.jpg", "wb").write(translated)
```

## Response

- `translate`, `render=true`: the body is the JPEG (`Content-Type: image/jpeg`). Header `X-Apinoa-Regions-Count` = regions replaced; an image with no text comes back unchanged with `0`.
- `translate`, `render=false`: `{success, data: {inpainted_base64, regions[], regions_count}}`. `inpainted_base64` is the image with the source text removed (base64 JPEG). Each region: `index`, `polygon` (4 points), `bbox {x, y, w, h}`, `text`, `text_kr` (the translation in `target_language`; the name is historical), `confidence`, `text_color`, `bg_color` (RGB), `bg_std`, `font_weight`, `is_badge`. To draw it yourself, put each `text_kr` inside its `polygon` with those colours and weight.
- Errors: `{success: false, error: {code, message}}`.

## Errors and price

- `400 BAD_REQUEST` (empty body, bad parameter), `413 PAYLOAD_TOO_LARGE` (over 20 MB), `413 IMAGE_TOO_LARGE` (over 8192 px), `415 UNSUPPORTED_MEDIA_TYPE` (send raw image bytes), `422 INVALID_IMAGE`, `422 UNSUPPORTED_IMAGE_FORMAT`, `FONT_NOT_FOUND` / `FONT_GLYPH_COVERAGE` (a `user/<id>` font that is not yours, or lacks the target script), `402 INSUFFICIENT_BALANCE` (top up, do not retry).
- Retry `502` (`UPSTREAM_ERROR`, `RENDER_FAILED`, `TRANSLATION_FAILED`) and `503` with backoff. A failed call is not billed.
- $0.003 per unit for `translate`: an image is usually one unit, and a tall image can count as more. `supported-fonts` is free. The rate steps down as a UTC day's volume grows (https://apinoa.com/pricing).

## More

- Markdown docs: `https://apinoa.com/en/docs-raw/api-reference/image-translate` (+ `/translate`, `/supported-fonts`, `/custom-fonts`); index https://apinoa.com/llms.txt
- To read the text without replacing it (OCR), use the `apinoa-ocr` skill: `POST /v1/ocr`, one credit per image.
- MCP: `apinoa-mcp` has a `translate_image` tool: `claude mcp add apinoa -e APINOA_API_KEY=your_key -- npx -y apinoa-mcp`, or hosted with OAuth sign-in: `claude mcp add --transport http apinoa https://api.apinoa.com/mcp`.
- A call failed, data came back wrong or missing, or an API you need does not exist: report it with `POST https://gateway.apinoa.com/v1/feedback` (JSON `type`, `message`, and the `platform`, `operation`, `params` and `requestId` of the call; free, no key needed) or the MCP tool `send_feedback`, and read our reply at `GET /v1/feedback/{id}`. Docs: `https://apinoa.com/en/docs-raw/api-reference/feedback`.
