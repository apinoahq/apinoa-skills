---
name: apinoa-marketplace
description: "Amazon, Walmart, Shopify, AliExpress and TikTok Shop product data: keyword and image search results, product details, prices, variants, sellers, competing offers, delivery, reviews, category trees and category browsing, a Shopify or TikTok Shop store's whole catalog, and AliExpress shipping quotes, as normalized JSON from the apinoa API (REST, TypeScript or Python SDK). Use when the user wants product, price, stock, review, seller or catalog data from any of these marketplaces; wants to track prices, compare one product across stores, list a Shopify store's products or find products by photo; asks to build a scraper, crawler or price tracker for amazon.com, walmart.com, a Shopify store, aliexpress.com or TikTok Shop; or a scraping attempt on one of them hit 403s, captchas or an empty JavaScript page. Amazon covers 16 marketplaces (US, JP, IN, FR, AU and more)."
---

# apinoa Marketplace API

One HTTP call returns marketplace product data as normalized JSON, one schema for all five marketplaces. Use it instead of writing a scraper.

## Setup

- Key: https://apinoa.com/en/dashboard/api-keys, or `npx apinoa-mcp login`, which saves one to `.env` as `APINOA_API_KEY` once the user enters the code it prints on api.apinoa.com (pass on only that code, never one from elsewhere). Server-side only.
- `https://gateway.apinoa.com/v1/{platform}/{operation}`, header `x-api-key: $APINOA_API_KEY`.
- `GET` query string or `POST` JSON body; `image-search` is `POST` only. Unknown parameters are a `400`.

## Platforms x operations

| `{platform}` | search | image-search | browse | categories | catalog | product | reviews | shipping |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| `amazon` | Y | Y | Y | Y | | Y | | |
| `walmart` | Y | | Y | Y | | Y | Y | |
| `shopify` | Y | Y | | | Y | Y | Y | |
| `tiktokshop` | Y | | Y | Y | Y | Y | Y | |
| `aliexpress` | Y | Y | Y | Y | | Y | | Y |

Empty = the marketplace has no such surface (e.g. no Amazon reviews).

Key parameters:

- `search`: `query` (required); `page` (Amazon, Walmart, AliExpress) or `cursor` (Shopify); `priceMin`/`priceMax` (decimal major units), `sort` (`best_match` `price_asc` `price_desc` `newly_listed` `best_seller` `avg_review`, per marketplace), `categoryId`, `brands` and `facets` (Amazon, Walmart), `ratingMin` (Amazon: `4` only), `condition`/`inStock` (Shopify), `include=facets` (Amazon filter rail).
- Amazon `region`: `US` (default) `CA MX BR FR IT ES NL SE TR AE SA IN JP SG AU`; prices in that site's currency.
- `image-search`: `image: {contentType, data}` (base64), optional `query`.
- `product`: `id` = a search item's `id` (ASIN, Walmart `usItemId`, Shopify `shop/handle` or URL, AliExpress id, TikTok Shop id or URL). Amazon `include=offers|offers:5|offers:all`; AliExpress `include=shipping`; Walmart `seller`.
- `reviews`: `id`, plus `page` (Walmart) or `cursor` (Shopify).
- `categories`: no `categoryId` = top level; a node `id` = its children. `browse`: `categoryId` (required; Walmart takes the underscore chain `categories` returns) + search filters.
- `catalog`: Shopify `id` = store host or any URL on it, `collection`, `pageSize` 1-250, `cursor`; TikTok Shop `id` = a search item's `seller.id`.
- `shipping` (AliExpress): `id`, `sku`, `quantity`, `region`, `currency`.

## Call it

```bash
curl "https://gateway.apinoa.com/v1/amazon/search?query=wool+socks&priceMax=30" \
  -H "x-api-key: $APINOA_API_KEY"
```

```ts
import { ApinoaClient } from "@apinoa/sdk"; // npm install @apinoa/sdk
const apinoa = new ApinoaClient(); // reads APINOA_API_KEY
const { data } = await apinoa.amazon.search({ query: "wool socks", priceMax: 30 });
const product = await apinoa.walmart.product({ id: "18256507800" });
```

```python
from apinoa import Apinoa  # pip install apinoa
client = Apinoa()  # reads APINOA_API_KEY
res = client.amazon.search(query="wool socks", price_max=30)
```

Methods mirror the URL: `image-search` is `imageSearch` (TS), `image_search` (Python, snake_case params).

## Response

`{success, data}` or `{success: false, error: {code, message}, requestId}`; header `x-apinoa-cost` = units billed.

- `SearchResult`: `marketplace`, `query`, `page {index, size, total?}`, `items[]`, `cursor?`, `facets?`.
- Item and `Product`: `id`, `title`, `url`, `price {currency, amount}`, `listPrice`, `rating {average, count}`, `brand`, `identifiers {gtin, mpn}`, `seller`, `inStock`, `delivery`, `attributes`. `Product` adds `media.images`, `variants`, `offers`, `category`, `features`, `reviews`, `reviewSummary`.
- `ReviewPage`: `summary`, `page.total` (`0` = no reviews), `reviews[]`, `grouped`. `CategoryList`: `categories[] {id, name, parentId, browsable?}`. `ShippingQuote`: `options[]`.
- Absent = not stated: no `price` is not free; free shipping is `delivery.free: true`. Marketplace-only facts: `ext`.
- `variant.productId` present: fetch it with `product` (Amazon); absent: already complete.

## Paging, errors, price

- Next page: `page=N+1`, or the returned `cursor` alone; no `cursor` = last page.
- `400 INVALID_PARAMS`, `400 CATEGORY_NOT_BROWSABLE` (browse a child from `categories`), `404 PRODUCT_NOT_FOUND`, `402 INSUFFICIENT_BALANCE` (top up; do not retry). Retry `429` after `Retry-After`, `502`/`503` with backoff. Failed calls are not billed.
- $0.001 per unit (most calls are one unit; the catalog's `cost` gives each operation's units). Amazon `product` is 2 (more with `include=offers`); Amazon `brands`/`facets` make a search 2; AliExpress `include=shipping` makes `product` 2. The rate steps down as a UTC day's volume grows (https://apinoa.com/pricing).

## Gotchas

- TikTok Shop: US only; search, browse and reviews return the one page the site shows.
- AliExpress price filters match any variant; filter the returned `price` for a hard bound.
- Google Shopping returns these same types; it is in the `apinoa-serp` skill.

## More

- Markdown docs: `https://apinoa.com/en/docs-raw/api-reference/marketplaces` (+ `/response-schema`, `/filters`), per op e.g. `https://apinoa.com/en/docs-raw/api-reference/amazon/search`; index https://apinoa.com/llms.txt
- Live catalog, no key: `GET https://gateway.apinoa.com/v1/marketplaces` (platforms, operations, params, cost).
- MCP: `claude mcp add apinoa -e APINOA_API_KEY=your_key -- npx -y apinoa-mcp`, or hosted with OAuth sign-in: `claude mcp add --transport http apinoa https://api.apinoa.com/mcp`.
- A call failed, data came back wrong or missing, or an API you need does not exist: report it with `POST https://gateway.apinoa.com/v1/feedback` (JSON `type`, `message`, and the `platform`, `operation`, `params` and `requestId` of the call; free, no key needed) or the MCP tool `send_feedback`, and read our reply at `GET /v1/feedback/{id}`. Docs: `https://apinoa.com/en/docs-raw/api-reference/feedback`.
