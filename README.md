# apinoa skills and Claude Code plugin

Agent skills for [apinoa](https://apinoa.com): product data from Amazon, Walmart, Shopify stores, AliExpress
and TikTok Shop; posts, profiles and comments from TikTok, Instagram, YouTube, Reddit, X, Threads and LinkedIn;
search results from Google, Bing, Naver, Baidu, Yandex and more; and the answers ChatGPT, Gemini, Google AI
Overviews, Google AI Mode and Naver give to a prompt. Each comes back as normalized JSON from one API with one
key, so a coding agent calls it instead of writing and maintaining a scraper. Failed calls are not billed.

| Skill | Use it for |
|---|---|
| [`apinoa-marketplace`](skills/apinoa-marketplace/SKILL.md) | Product search, details, prices, reviews, categories and store catalogs |
| [`apinoa-social`](skills/apinoa-social/SKILL.md) | Social profiles, posts, comments, communities and media |
| [`apinoa-serp`](skills/apinoa-serp/SKILL.md) | Search results, places, app stores, Google Shopping and Trends |
| [`apinoa-answers`](skills/apinoa-answers/SKILL.md) | AI-engine answers with their sources and the brands they mention |
| [`apinoa-image-translate`](skills/apinoa-image-translate/SKILL.md) | Translating the text inside images, such as product photos |

You need an API key: create one at [apinoa.com/en/dashboard/api-keys](https://apinoa.com/en/dashboard/api-keys).

## Claude Code

The plugin bundles the five skills and the [apinoa MCP server](https://github.com/apinoahq/apinoa-mcp), and asks
for your key when you enable it.

```text
/plugin marketplace add apinoahq/apinoa-skills
/plugin install apinoa@apinoa
```

## Codex, Cursor and other agents

```bash
npx skills add apinoahq/apinoa-skills
```

It installs the skills into Claude Code, Codex, Cursor and the other agents it supports (`-a codex` picks one).
Set `APINOA_API_KEY` in the environment the agent runs in. For the MCP server as well:

```bash
codex mcp add apinoa --env APINOA_API_KEY=your_key -- npx -y apinoa-mcp
```

## What data it sends

The skills and the MCP server send only what a call needs to `https://gateway.apinoa.com`: the operation and its
parameters (a search query, a product id or URL, a username, a prompt, an image you ask to translate) with your API
key in the `x-api-key` header. Nothing is sent to any other service. apinoa keeps request records for billing and
support as described in the [privacy policy](https://apinoa.com/en/privacy). The plugin stores your key in Claude
Code's secure credential storage and passes it only to the MCP server it starts (`npx -y apinoa-mcp@<version>`).

## More

- [Documentation](https://apinoa.com/docs), also as markdown for agents: [llms.txt](https://apinoa.com/llms.txt)
- [SDKs and MCP](https://apinoa.com/docs/sdks): `npm install @apinoa/sdk`, `pip install apinoa`
- [Pricing](https://apinoa.com/pricing)
- The live catalog of every platform, operation, parameter and cost:
  [`GET https://gateway.apinoa.com/v1/marketplaces`](https://gateway.apinoa.com/v1/marketplaces) (no key needed)

## License

MIT
