---
name: apinoa-serp
description: "Google, Bing, Naver, Baidu, Yandex, Yahoo, Yahoo! JAPAN, DuckDuckGo, Daum, Seznam and Sogou search results (SERP): organic rankings, ads, news, images, videos, People Also Ask, knowledge panels, local packs, AI Overviews, related searches and autocomplete suggestions; plus places and reviews from Google Maps, Naver, Yandex and Tripadvisor, Google Shopping products, Google Play and App Store apps and reviews, and Google Trends, as one normalized JSON schema from the apinoa API (REST, TypeScript or Python SDK). Use when the user wants search rankings, rank tracking, keyword or SEO research, a competitor's search visibility, local business listings, app store data or search trends; asks to build a Google, Bing, Naver or Baidu scraper or SERP crawler; or a scraping attempt on a search engine hit a captcha, 429, 403 or unusual-traffic page."
---

# apinoa SERP API

One HTTP call returns a search engine's results page as normalized JSON: every block in page order (organic, ads, news, images, videos, People Also Ask, knowledge panel, local pack, AI Overview), each with its `rank`. One schema for every engine. Use it instead of writing a scraper.

## Setup

- Key: https://apinoa.com/en/dashboard/api-keys; `export APINOA_API_KEY=...` (server-side only).
- `https://gateway.apinoa.com/v1/{platform}/{operation}`, header `x-api-key: $APINOA_API_KEY`.
- `GET` query string or `POST` JSON body. An input an engine does not take is `400 INVALID_PARAMS`, never ignored.

## Engines x operations

| `{platform}` | Operations | Markets |
|---|---|---|
| `google` | `search` `suggestions` `places` `place` | 10 (US default) |
| `bing` | `search` `suggestions` | 10 |
| `yahoo` / `duckduckgo` | `search` `suggestions` | 13 / 14 |
| `yandex` | `search` (news, images, videos; no web) `suggestions` `places` `place` `reviews` | 10 |
| `naver` | `search` `suggestions` `places` `place` `reviews` | KR |
| `daum` | `search` `suggestions` | KR |
| `baidu` / `sogou` | `search` `suggestions` | CN |
| `yahoo-japan` / `seznam` | `search` `suggestions` | JP / CZ |
| `tripadvisor` | `places` `place` `reviews` | 15 |
| `google-shopping` | `search` `product` `reviews` | `region` US GB CA AU |
| `google-play` / `app-store` | `search` `app` `reviews` | 50+ |
| `google-trends` | `explore` `trending` | every Trends country |

Inputs, one name per meaning:

- `search`: `q` (operators included), `type` (`web` default, `news`, `images`, `videos`; `image` + an `image` URL = reverse-image search on Google, Bing, Baidu, Yandex), `country`, `lang`, `device` (`desktop`/`mobile`), `timeRange` (`hour`..`year`), `safe`, `limit`, `cursor`.
- `suggestions`: `q`. `places`: `q`, `near` (place name) or `location` (`lat,lng`). `place`: `id` from `places`, or `url`. Place `reviews`: `place`, `sort`, `limit`.
- Google Shopping: `query`, `priceMin`, `priceMax`, `include=facets`, `facets`, `region`; `product` `id` or `url` (`include=offers`).
- App stores: `search` `q`; `app`/`reviews` `id` (`com.strava`, `426826309`) or `url`.
- Google Trends: `explore` `terms` (up to five, comma-separated), `country` (absent = worldwide), `timeRange`; `trending` `country` (required), `window` (`4h` `24h` `48h` `7d`).

## Call it

```bash
curl "https://gateway.apinoa.com/v1/google/search?q=best+running+shoes&country=US" \
  -H "x-api-key: $APINOA_API_KEY"
```

```ts
import { ApinoaClient } from "@apinoa/sdk"; // npm install @apinoa/sdk
const apinoa = new ApinoaClient(); // reads APINOA_API_KEY
const { data } = await apinoa.google.search({ q: "trail running shoes", country: "US" });
for (const item of data.items) if (item.type === "organic") console.log(item.position, item.url);
```

```python
from apinoa import Apinoa  # pip install apinoa
client = Apinoa()  # reads APINOA_API_KEY
res = client.google.search(q="trail running shoes", country="US")
places = client.naver.places(q="강남역 카페")  # google-trends -> client.google_trends
```

## Response

`{success, data}` or `{success: false, error: {code, message}, requestId}`; header `x-apinoa-cost` = units billed.

- `ResultsPage`: `engine`, `query`, `outcome` (`results`/`noResults`), `correctedQuery?`, `totalResults?`, `page`, `items[]`, `cursor?`.
- Each item has `type` and `rank`. `organic`: `position` (organic only, across pages), `url`, `title`, `snippet`, `site`, `date`, `sitelinks`. Also `ad`, `news`, `image`, `video`, `topStories`, `peopleAlsoAsk`, `relatedSearches`, `knowledgePanel`, `localPack`, `aiOverview` (`answer`, the `Answer` of the `apinoa-answers` skill), `other` (no shared shape yet; never dropped).
- `Place`: `id`, `name`, `address`, `coordinates`, `categories`, `rating`, `reviewCount`, `phone`, `website`, `hours`, `status`. Also `Suggestions`, `PlacesPage`, `PlaceReviewsPage`, `AppsPage`, `App`, `AppReviewsPage`, `TrendsExplore` (`interestOverTime`, `interestByRegion`, `related`), `TrendingPage`.
- Google Shopping returns the marketplace `SearchResult`, `Product`, `ReviewPage`.
- Absent = the page did not show it, never `0`. Engine-only facts: `ext`.

## Paging, errors, price

- `limit` reads several pages in one call; or pass the returned `cursor` alone; no `cursor` = last page.
- `outcome: "noResults"` is an answer. `404 NOT_FOUND` (place, app), `404 PRODUCT_NOT_FOUND`, `404 REVIEWS_NOT_FOUND`, `400 INVALID_PARAMS`, `402 INSUFFICIENT_BALANCE` (top up; do not retry). Retry `429` after `Retry-After`, `502`/`503` with backoff. Failed calls are not billed.
- $0.0012 per unit (most calls are one unit; the catalog's `cost` gives each operation's units). `limit` beyond one page costs one unit per page; Google Shopping `include=offers` and Trends `include=articles` add units. The rate steps down as a UTC day's volume grows (https://apinoa.com/pricing).

## More

- Markdown docs: `https://apinoa.com/en/docs-raw/api-reference/serp` (+ `/response-schema`), per op e.g. `https://apinoa.com/en/docs-raw/api-reference/google/search`; index https://apinoa.com/llms.txt
- Live catalog, no key: `GET https://gateway.apinoa.com/v1/marketplaces` (platforms, operations, params, cost).
- MCP: `claude mcp add apinoa -e APINOA_API_KEY=your_key -- npx -y apinoa-mcp`.
