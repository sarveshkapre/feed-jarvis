# API Contracts

Contract notes for Studio HTTP endpoints. These payloads are local-first and intended for UI + smoke automation stability.

## `POST /api/fetch`

### Request body

- `urls` (`string[]`, required): Feed URLs (`http`/`https`), or use `url` as a string fallback.
- `maxItems` (`number`, optional): Final item cap after dedupe (default `20`).
- `dedupe` (`boolean`, optional): URL dedupe toggle (default `true`).
- `fetchConcurrency` (`number`, optional): Concurrency limit (`1-20`, default resolved from runtime config).

### Success response (`200`)

Returns fetch output even when some feeds fail, as long as at least one feed succeeds.

```json
{
  "items": [{ "title": "Example", "url": "https://example.com/post" }],
  "summary": {
    "sources": 2,
    "cache": 0,
    "network": 1,
    "failed": 1,
    "concurrency": 4,
    "dedupe": true,
    "deduped": 0,
    "limited": 0,
    "retryAttempts": 0,
    "retrySuccesses": 0,
    "durationMs": 18,
    "slowestFeedMs": 12
  },
  "failures": [
    {
      "url": "https://bad.example.com/rss",
      "message": "Fetch failed: 503 Service Unavailable",
      "durationMs": 7
    }
  ]
}
```

Contract semantics:
- `failures[]` is always present on `200` responses (possibly empty).
- Partial success is explicit: `items.length > 0` and `failures.length > 0` can both be true.
- `summary.failed` equals `failures.length`.

### Error response (`400`)

If every requested feed fails, response is `400` with `error`, `requestId`, and full `failures[]` list:

```json
{
  "error": "Failed to fetch 2 feed(s). First error: Fetch failed: 503 Service Unavailable",
  "failures": [
    {
      "url": "https://a.example.com/rss",
      "message": "Fetch failed: 503 Service Unavailable",
      "durationMs": 4
    }
  ],
  "requestId": "f8b8a62e-..."
}
```

`requestId` is also returned in the `x-request-id` response header for API routes.
