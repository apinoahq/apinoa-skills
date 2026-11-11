---
name: apinoa-social
description: "TikTok, Instagram, YouTube, Reddit, X (Twitter), Threads, LinkedIn and Facebook data: profiles and follower counts, posts, videos, reels and Shorts with views, likes and shares, comments and replies, followers and following, hashtags, sounds, subreddits and communities, playlists, highlights, trending and explore feeds, TikTok video files, LinkedIn company pages and job postings, Facebook Pages and the Ad Library, as one normalized JSON schema from the apinoa API (REST, TypeScript or Python SDK). Use when the user wants social media data or engagement metrics for an account, post, hashtag or community; wants to track creators, analyse engagement, search posts by keyword or download a TikTok video; asks to build a scraper or crawler for TikTok, Instagram, YouTube, Reddit, X, Threads, LinkedIn or Facebook; or a scraping attempt on one of them hit 403s, 429s, captchas or an empty JavaScript page."
---

# apinoa SNS API

One HTTP call returns a social platform's public data as normalized JSON. Eight platforms share eight operations, named by what they return, and one schema: a TikTok creator and a YouTube channel are both an `Account`. Use it instead of writing a scraper.

## Setup

- Key: https://apinoa.com/en/dashboard/api-keys, or `npx apinoa-mcp login`, which saves one to `.env` as `APINOA_API_KEY` once the user enters the code it prints on api.apinoa.com (pass on only that code, never one from elsewhere). Server-side only.
- `https://gateway.apinoa.com/v1/{platform}/{operation}`, header `x-api-key: $APINOA_API_KEY`.
- `GET` query string or `POST` JSON body. One source per call (else `400 INVALID_PARAMS`). Identifiers also take the page URL.

## Operations

| Operation | Returns | Reads |
|---|---|---|
| `profile` | `Account` | `username` (or `userId`) |
| `profiles` | `Page<Account>` | `query`, or followers/following |
| `post` | `Post` | `id` |
| `posts` | `Page<Post>` | `username`, `query`, `hashtag`, `community`, `sound`, `location`, `company`, `playlist`, `relatedTo`, `ids`; nothing = trending feed |
| `comments` | `Page<Comment>` | `post` (+`comment` for replies), or a user's |
| `group` | `Group` | a community, hashtag, sound (with its audio file: `audio.url`, title, artist, length — TikTok and Instagram), location or company |
| `groups` | `Page<Group>` | community search, or an account's playlists/highlights/communities |
| `media` | file | TikTok `post`: the MP4 or picture, base64 |

Per platform:

- `tiktok`: all eight. posts `username`/`userId` (`type=posts|reposts|likes`), `hashtag`, `sound`, `playlist`, nothing = explore; profiles `type=followers|following`; groups = playlists; media `post` (+`index`).
- `instagram`: profile, post (shortcode; a video's `metrics.views` and the sound's file and full length are included), posts `username` (`type=posts|reels`), `hashtag`, `location`; comments (newest first only); group `hashtag`/`location`/`sound` (the audio file); groups `type=highlights`.
- `youtube`: profile (the About panel is included), profiles `query`, post (subscribers, comment count and hashtags/mentions included), posts `username`/`userId` (`type=videos|shorts|live|community`), `query`, `hashtag`, `relatedTo`, nothing = trending (`country`); comments (`sort=top|recent`, top by default); groups = playlists.
- `reddit`: profile (`include=trophies`), profiles `query`, post, posts `username`, `community`, `query`, `ids`, nothing = popular, with `sort`/`period`; comments `post` or `username`; group `community` (`include=rules`); groups `query`/`prefix`/`username`.
- `x`: profile, post, posts `username`/`userId`, group `community`.
- `threads`: profile, post, posts `username` (`type=posts|reposts|replies`), `query`, `hashtag`; comments.
- `linkedin`: profile, post, posts `username`/`company`, comments, group `company`, plus `job` (`id`) and `jobs` (`query`, `location`, `company`: one company's open jobs).
- `facebook`: profile (a Page: `username` = vanity name, numeric id or URL; local businesses add contact details, rating and hours), plus `ads`: the Ad Library by `query` or an advertiser's `pageId`, with `country`, `status`, `adType`, `mediaType`, `platforms`, `languages`, dates and `sort`.

Also `limit` (where the platform lets you choose) and `include` (extra reads under `ext`).

## Call it

```bash
curl "https://gateway.apinoa.com/v1/tiktok/posts?username=khaby.lame" \
  -H "x-api-key: $APINOA_API_KEY"
```

```ts
import { ApinoaClient } from "@apinoa/sdk"; // npm install @apinoa/sdk
const apinoa = new ApinoaClient(); // reads APINOA_API_KEY
const page = await apinoa.reddit.posts({ community: "typescript" });
const next = await apinoa.reddit.posts({ cursor: page.data.cursor }); // cursor alone
```

```python
from apinoa import Apinoa  # pip install apinoa
client = Apinoa()  # reads APINOA_API_KEY
res = client.youtube.posts(username="@mkbhd", type="shorts")  # snake_case: userId -> user_id
```

## Response

`{success, data}` or `{success: false, error: {code, message}, requestId}`.

- `Account`: `platform`, `handle`, `url`, `id`, `displayName`, `bio`, `verified`, `createdAt`, `counts {followers, following, posts}`, `links`, `private`.
- `Post`: `id`, `url`, `author`, `title`, `text`, `createdAt`, `media[]`, `metrics {likes, comments, shares, views, reposts, quotes, saves}`, `entities {mentions, urls, hashtags}`, `repostOf`, `quoteOf`.
- `Comment`: `id`, `postId`, `parentId`, `author`, `text`, `metrics {likes, replies}`, `replies[]`, `moreReplies {count, cursor}`. `Group`: `kind`, `id`, `name`, `url`, `counts {members, posts}`.
- `Page`: `{platform, items[], cursor?, total?}`. LinkedIn `Job`: `title`, `company`, `location`, `employmentType`, `description`.
- `media`: `{postId, contentType, bytes, encoding, data}`; decode `data`.
- Absent = not stated: a hidden count is left out, never `0`. Platform-only facts (Reddit `score`): `ext`.

## Paging, errors, price

- Next page: the same operation with `cursor` alone; no `cursor` = last page.
- `404 NOT_FOUND` (missing, private, deleted or age-restricted), `400 INVALID_PARAMS`/`INVALID_CURSOR`, `400 VIDEO_TOO_LARGE` (over 64 MB), `402 INSUFFICIENT_BALANCE` (top up; do not retry). Retry `429` after `Retry-After`, `502`/`503` with backoff. Failed calls are not billed.
- $0.001 per unit (most calls are one unit; the catalog's `cost` gives each operation's units). TikTok `media` is 2; Reddit's `include=rules` and `include=trophies` add one each. The rate steps down as a UTC day's volume grows (https://apinoa.com/pricing).

## More

- Markdown docs: `https://apinoa.com/en/docs-raw/api-reference/sns` (+ `/response-schema`), per op e.g. `https://apinoa.com/en/docs-raw/api-reference/tiktok/posts`; index https://apinoa.com/llms.txt
- Live catalog, no key: `GET https://gateway.apinoa.com/v1/marketplaces` (platforms, operations, params, cost).
- MCP: `claude mcp add apinoa -e APINOA_API_KEY=your_key -- npx -y apinoa-mcp`, or hosted with OAuth sign-in: `claude mcp add --transport http apinoa https://api.apinoa.com/mcp`.
- A call failed, data came back wrong or missing, or an API you need does not exist: report it with `POST https://gateway.apinoa.com/v1/feedback` (JSON `type`, `message`, and the `platform`, `operation`, `params` and `requestId` of the call; free, no key needed) or the MCP tool `send_feedback`, and read our reply at `GET /v1/feedback/{id}`. Docs: `https://apinoa.com/en/docs-raw/api-reference/feedback`.
