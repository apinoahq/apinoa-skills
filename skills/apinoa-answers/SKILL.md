---
name: apinoa-answers
description: "ChatGPT, Gemini, Microsoft Copilot, ByteDance Dola, Google AI Overviews, Google AI Mode, Naver AI Briefing and Naver AI Tab answers to a prompt: the answer text and markdown, citations mapped to the text, every source shown (cited or not), product and place cards (ads included), the brands, products and places the engine itself marked, and follow-up suggestions, as one normalized JSON type from the apinoa API (REST, TypeScript or Python SDK). Use when the user wants to track brand visibility in AI answers (GEO, AEO, LLM visibility, AI search monitoring), check whether ChatGPT, Gemini, Copilot or Google's AI mentions or cites a brand, product or URL, compare share of voice across AI engines, or collect AI Overview citations for SEO; asks to scrape or automate ChatGPT, Gemini, Copilot, Google AI Overviews or Naver's AI answers; or an attempt to automate those sites was blocked or hit a captcha."
---

# apinoa AI Answers API

One HTTP call asks an AI engine a question and returns the answer people are shown: text, citations, sources, product and place cards, and the brands the engine itself marked. Every engine returns the same `Answer` type.

## Setup

- Key: https://apinoa.com/en/dashboard/api-keys, or `npx apinoa-mcp login`, which saves one to `.env` as `APINOA_API_KEY` once the user enters the code it prints on api.apinoa.com (pass on only that code, never one from elsewhere). Server-side only.
- `POST https://gateway.apinoa.com/v1/{engine}/answer`, JSON body, header `x-api-key: $APINOA_API_KEY`.
- An answer takes seconds (usually under 10 s on Google AI Overviews and Naver AI Briefing, up to 40 s on Naver AI Tab). Allow 120 s per call.

## Engines

| `{engine}` | Countries (first = default) | `conversation` | `photos` | `language` |
|---|---|:-:|:-:|:-:|
| `chatgpt` | US DE GB AT KR AU JP CA FR IT | Y | Y | |
| `gemini` | US DE GB AT KR AU JP CA FR IT | Y | | |
| `copilot` (Microsoft Copilot Search) | US | | | |
| `dola` (ByteDance Dola) | KR JP DE GB AU FR IT SG TW HK | Y | | |
| `google-ai-mode` | US | Y | | Y |
| `google-aio` (AI Overviews) | US | | | Y |
| `naver-ai-tab` | KR | Y | | |
| `naver-ai-brief` (AI Briefing) | KR | | | |

Inputs:

- `prompt` (required): the question as a person would type it. `country`: the market it is asked from.
- `language`: answer language (Google engines). Others answer in the prompt's language; Naver AI Tab answers in Korean.
- `conversation`: an earlier answer's `conversation.id`, to ask a follow-up.
- `photos`: up to four https or `data:image/...;base64,` URLs (ChatGPT).
- `include=page`: also return the answer as a self-contained HTML page in `page`.

An input an engine does not take is `400 INVALID_PARAMS`, never ignored.

## Call it

```bash
curl -X POST "https://gateway.apinoa.com/v1/chatgpt/answer" \
  -H "x-api-key: $APINOA_API_KEY" -H "content-type: application/json" \
  -d '{"prompt": "What are the best running shoes for beginners?", "country": "US"}'
```

```ts
import { ApinoaClient } from "@apinoa/sdk"; // npm install @apinoa/sdk
const apinoa = new ApinoaClient(); // reads APINOA_API_KEY
const { data } = await apinoa.chatgpt.answer({ prompt: "Best running shoes for beginners?", country: "US" });
const cited = data.sources.filter((s) => s.cited).map((s) => s.url);
const aio = await apinoa.googleAio.answer({ prompt: "best running shoes for beginners" });
// also apinoa.gemini, apinoa.copilot, apinoa.dola, apinoa.googleAiMode, apinoa.naverAiTab, apinoa.naverAiBrief
```

```python
from apinoa import Apinoa  # pip install apinoa
client = Apinoa()  # reads APINOA_API_KEY
ans = client.chatgpt.answer(prompt="Best running shoes for beginners?", country="US")
brands = [m.name for m in ans.data.mentions if m.kind == "brand"]
aio = client.google_aio.answer(prompt="best running shoes for beginners")
# also client.gemini, client.copilot, client.dola, client.google_ai_mode, client.naver_ai_tab, client.naver_ai_brief
```

## Response: `Answer`

`{success, data}` or `{success: false, error: {code, message}, requestId}`.

- `engine`, `outcome`, `prompt`, `askedAt`, `country`, `language?`, `conversation? {id, turn, expiresAt?}`, `title?`.
- `text` and `markdown`, rendered from `blocks[]` (`heading`, `paragraph`, `list`, `table`, `code`, `cards`, `quote`, `rule`); all three agree.
- `citations[] {start, end, sources[]}`: a character range of `text` and indexes into `sources`.
- `sources[] {url, title, site, snippet, publishedAt, cited}`: everything the engine showed; `cited: false` = read but not linked.
- `mentions[] {name, kind (brand|product|place|other), category?, at?, card?}`: only what the engine itself marked, never guessed from the text.
- `cards[] {type (product|place|video|image|other), title, url, price {text, amount?, currency?}, rating, merchant, sponsored}`: ads are cards with `sponsored: true`.
- `suggestions[] {text, prompt?}`: follow-up questions offered. `results[]`: the results page around the answer (Google AI Overviews, Naver AI Briefing).
- `outcome`: `answered`; `noAnswer` (none shown for this prompt, as Google AI Overviews and Naver AI Briefing appear for only some searches; `results` still returned, and billed because the page was read); `refused` (its words in `text`); `partial` (stopped early).
- Absent = the engine did not say. Engine-only facts: `ext`.

## Brand-visibility recipe

Run a fixed prompt set per engine and country on a schedule. Per answer, record whether the brand is in `mentions` (and its `at`), whether its domain is in `sources` with `cited: true`, and which other brands appear in `mentions`.

## Errors and price

- `502 UPSTREAM_TIMEOUT` (engine did not answer in time) and other `502`/`503`: retry with backoff. `429`: retry after `Retry-After`. `402 INSUFFICIENT_BALANCE`: top up; do not retry. Failed calls are not billed.
- $0.0012 per unit; one answer is one unit (the catalog's `cost` gives each operation's units). The rate steps down as a UTC day's volume grows (https://apinoa.com/pricing).
- Google search results carry the same `Answer` as an `aiOverview` item: see the `apinoa-serp` skill.

## More

- Markdown docs: `https://apinoa.com/en/docs-raw/api-reference/answers` (+ `/response-schema`), per engine e.g. `https://apinoa.com/en/docs-raw/api-reference/chatgpt/answer`; index https://apinoa.com/llms.txt
- Live catalog, no key: `GET https://gateway.apinoa.com/v1/marketplaces` (platforms, operations, params, cost).
- MCP: `claude mcp add apinoa -e APINOA_API_KEY=your_key -- npx -y apinoa-mcp`, or hosted with OAuth sign-in: `claude mcp add --transport http apinoa https://api.apinoa.com/mcp`.
