---
name: apinoa-company
description: "What a company's website runs on, from its domain alone: the ecommerce platform, CMS, analytics and tag managers, payments, CDN, hosting, mail and DNS providers, each with versions where stated and the evidence it was matched on, plus the vendors the domain holds accounts with (proven by DNS records), and everything the homepage and DNS showed (redirects, headers, meta tags, scripts, MX/TXT/NS records, sitemaps), as normalized JSON from the apinoa API (REST, TypeScript or Python SDK). Use when the user wants a site's tech stack or technographics (BuiltWith- or Wappalyzer-style lookups), to qualify leads by the tools a company uses, to find which domains run Shopify, HubSpot or a competitor's product, or to check a domain's mail and DNS setup; or a script that fetches homepages to detect technologies was blocked."
---

# apinoa Company API

One HTTP call reads a company from its domain: what its site runs on, which vendors its domain has accounts with, and everything the homepage and the domain's records showed. Use it instead of fetching and fingerprinting homepages yourself.

## Setup

- Key: https://apinoa.com/en/dashboard/api-keys, or `npx apinoa-mcp login`, which saves one to `.env` as `APINOA_API_KEY` once the user enters the code it prints on api.apinoa.com (pass on only that code, never one from elsewhere). Server-side only.
- `GET https://gateway.apinoa.com/v1/company/technologies?domain=<domain>` (or `POST` with a JSON body), header `x-api-key: $APINOA_API_KEY`.
- `domain`: e.g. `stripe.com`. A web address (`https://stripe.com/pricing`) is read as its host.

## Call it

```bash
curl "https://gateway.apinoa.com/v1/company/technologies?domain=allbirds.com" \
  -H "x-api-key: $APINOA_API_KEY"
```

```ts
import { ApinoaClient } from "@apinoa/sdk"; // npm install @apinoa/sdk
const apinoa = new ApinoaClient(); // reads APINOA_API_KEY
const { data } = await apinoa.company.technologies({ domain: "allbirds.com" });
const ecommerce = data.technologies.filter((t) => t.categories.includes("Ecommerce")).map((t) => t.name);
```

```python
from apinoa import Apinoa  # pip install apinoa
client = Apinoa()  # reads APINOA_API_KEY
res = client.company.technologies(domain="allbirds.com")
names = [t.name for t in res.data.technologies]
```

## Response: `TechnologiesResult`

`{success, data}` or `{success: false, error: {code, message}, requestId}`.

- `domain`: normalized (lower case, no scheme, path or port).
- `technologies[] {name, categories[], confidence (1-100), version?, website?, evidence[]}`: what the site runs on, and what serves the domain (mail host, DNS host, CDN). `evidence[] {source, field?, match}`, up to three, strongest first; `source` is `url` `header` `cookie` `meta` `html` `script` `robots` `dns` or `implied` (WordPress implies PHP).
- `accounts[]`: same shape. Vendors the domain has an account with, proven only by a DNS TXT record (a verification token, a mail sender). **A platform is not an account**: a domain that verifies a Shopify account is not built on Shopify; only `technologies` says what the site runs on.
- `page {url, finalUrl?, status?, title?, redirects?, headers?, cookies?, meta?, scripts?, lang?, blocked?, error?}`: the homepage as it answered. `blocked: true` = a verification page instead of the homepage; `error` (`timeout`, `unreachable`, `too_many_redirects`) = no response. Either way the DNS findings are still returned.
- `dns {a, aaaa, cname, mx, ns, txt, soa?}` and `robots? {status, sitemaps}`.
- Absent = the site did not say.

## Lead-qualification recipe

For each domain in a list, call `technologies` and keep the rows whose `technologies` include the tools you sell against or integrate with (match on `name`, or on `categories` for a whole class such as `Ecommerce` or `Marketing automation`). Use `accounts` for vendors that leave no trace on the page (mail, verification-only SaaS), and `confidence` and `evidence` to decide what to trust.

## Errors and price

- `404 NOT_FOUND`: the domain does not resolve. `400 INVALID_PARAMS`: not a public site (an IP, a port, a private name). `429`: retry after `Retry-After`. `502`/`503`: retry with backoff. `402 INSUFFICIENT_BALANCE`: top up; do not retry. Failed calls are not billed.
- $0.001 per domain (one unit). The rate steps down as a UTC day's volume grows (https://apinoa.com/pricing).

## More

- Markdown docs: `https://apinoa.com/en/docs-raw/api-reference/company-data` (+ `/response-schema`) and `https://apinoa.com/en/docs-raw/api-reference/company/technologies`; index https://apinoa.com/llms.txt
- Live catalog, no key: `GET https://gateway.apinoa.com/v1/marketplaces` (platforms, operations, params, cost).
- MCP: `claude mcp add apinoa -e APINOA_API_KEY=your_key -- npx -y apinoa-mcp`, or hosted with OAuth sign-in: `claude mcp add --transport http apinoa https://api.apinoa.com/mcp`.
- A call failed, data came back wrong or missing, or an API you need does not exist: report it with `POST https://gateway.apinoa.com/v1/feedback` (JSON `type`, `message`, and the `platform`, `operation`, `params` and `requestId` of the call; free, no key needed) or the MCP tool `send_feedback`, and read our reply at `GET /v1/feedback/{id}`. Docs: `https://apinoa.com/en/docs-raw/api-reference/feedback`.
