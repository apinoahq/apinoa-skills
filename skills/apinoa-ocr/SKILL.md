---
name: apinoa-ocr
description: "OCR API for images: reads the text in product photos, detail-page images, banners, labels, price tags, screenshots and other pictures, and returns every text region with its text, confidence, bounding box and polygon (plus the text and background colours, font weight and whether it sits on a badge). Reads Chinese (Simplified and Traditional), Japanese, English and other Latin-script languages; can keep only one language's text. One credit ($0.001) per image. From the apinoa API (REST, TypeScript or Python SDK, MCP tool read_image_text). Use when the user wants to extract or read the text in an image, OCR images in bulk, pull the Chinese or Japanese text out of supplier product images, find where text sits in an image, or build an OCR step into a pipeline."
---

# apinoa OCR API

One call reads the text in an image: every text region with what it says, how sure the read is, and where it sits. It reads Chinese (Simplified and Traditional), Japanese, English and other Latin-script languages. It does not read Korean yet.

## Setup

- Key: https://apinoa.com/en/dashboard/api-keys, or `npx apinoa-mcp login`, which saves one to `.env` as `APINOA_API_KEY` once the user enters the code it prints on api.apinoa.com (pass on only that code, never one from elsewhere). Server-side only.
- `POST https://gateway.apinoa.com/v1/ocr`, header `x-api-key: $APINOA_API_KEY`. Send the image as **raw bytes** in the body (not JSON, not base64) with `Content-Type: image/jpeg`, `image/png`, `image/webp` or `application/octet-stream`.
- Limits: up to 8192 x 8192 px and a 20 MB body. A call usually takes about a second, but can wait for capacity under heavy load: set the HTTP timeout to at least 300 s.

## Parameters (query string)

- `language` (optional): `auto` (default) returns all the text. `zh-CN`, `zh-TW`, `ja` or `en` return only the regions with text in that language's script, and leave out regions that are only numbers or symbols (a bare price such as `99.00`). Any other value is a `400`.

## Call it

```bash
curl -X POST "https://gateway.apinoa.com/v1/ocr" \
  -H "x-api-key: $APINOA_API_KEY" -H "Content-Type: image/jpeg" \
  --data-binary @product.jpg
```

```ts
import { readFile } from "node:fs/promises";
import { ApinoaClient } from "@apinoa/sdk"; // npm install @apinoa/sdk
const apinoa = new ApinoaClient(); // reads APINOA_API_KEY
const { data } = await apinoa.ocr.read(await readFile("product.jpg"), {});
for (const r of data?.regions ?? []) console.log(r.text, r.confidence);
// only the Chinese text: apinoa.ocr.read(bytes, { language: "zh-CN" })
```

```python
from apinoa import Apinoa  # pip install apinoa
client = Apinoa()  # reads APINOA_API_KEY
with open("product.jpg", "rb") as f:
    result = client.ocr.read(request=f.read())  # language="zh-CN" for the Chinese text only
for r in result.data.regions:
    print(r.text, r.confidence)
```

## Response

`{success, data: {regions[], regions_found, src_w, src_h}}`. Each region: `index`, `text`, `confidence` (0-1), `polygon` (4 corner points) and `bbox {x, y, w, h}` in the original image's pixels, `text_color` and `bg_color` (RGB), `bg_std` (near 0 = flat background), `font_weight`, `is_badge` (`true` for text on a filled label such as a price tag). An image with no text returns `regions: []`. Errors: `{success: false, error: {code, message}}`.

## Errors and price

- `400 BAD_REQUEST` (empty body, unknown `language`), `413 PAYLOAD_TOO_LARGE` (over 20 MB), `413 IMAGE_TOO_LARGE` (over 8192 px), `415 UNSUPPORTED_MEDIA_TYPE` (send raw image bytes), `422 INVALID_IMAGE`, `402 INSUFFICIENT_BALANCE` (top up, do not retry). Retry `502`/`503` with backoff. A failed call is not billed.
- One credit ($0.001) per image at the base rate, stepping down as a UTC day's volume grows (https://apinoa.com/pricing). An image whose long side is 2.5 times its short side or more is read in sections of twice its short side, one credit each: 750 x 3,000 px is 2 credits, 750 x 10,000 px is 7.

## More

- Markdown docs: `https://apinoa.com/en/docs-raw/api-reference/ocr`; index https://apinoa.com/llms.txt
- To replace the text with a translation instead of reading it, use the `apinoa-image-translate` skill.
- MCP: `apinoa-mcp` has a `read_image_text` tool (image URL in, regions out): `claude mcp add apinoa -e APINOA_API_KEY=your_key -- npx -y apinoa-mcp`, or hosted with OAuth sign-in: `claude mcp add --transport http apinoa https://api.apinoa.com/mcp`.
