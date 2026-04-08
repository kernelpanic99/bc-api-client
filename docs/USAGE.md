# Usage

- [Fetching a single resource](#fetching-a-single-resource)
- [Fetching all pages from a v3 endpoint](#fetching-all-pages-from-a-v3-endpoint)
- [Processing a large result set without buffering](#processing-a-large-result-set-without-buffering)
- [Filtering by a list of IDs](#filtering-by-a-list-of-ids)
- [Working with v2 endpoints](#working-with-v2-endpoints)
- [Running multiple requests concurrently](#running-multiple-requests-concurrently)
- [Validating inputs and outputs at runtime](#validating-inputs-and-outputs-at-runtime)
- [Handling errors](#handling-errors)
- [Tuning concurrency and rate-limit behavior](#tuning-concurrency-and-rate-limit-behavior)
- [Using a custom logger](#using-a-custom-logger)

______________________________________________________________________

## Fetching a single resource

```ts
import { BigCommerceClient } from 'bc-api-client';

const client = new BigCommerceClient({
    storeHash: 'abc123',
    accessToken: 'your-token',
});

const product = await client.get('catalog/products/123');
```

`get`, `post`, `put`, and `delete` all accept an optional `query` object for query parameters:

```ts
const product = await client.get('catalog/products/123', {
    query: { include: ['variants', 'images'] },
});

const created = await client.post('catalog/products', {
    body: { name: 'Widget', type: 'physical', price: 9.99 },
});

await client.delete('catalog/products/123');
```

`delete` silently ignores 404 responses — deleting a resource that's already gone is not an error.

Paths are relative to the store's versioned base URL. The `version` option defaults to `'v3'`:

```ts
// Requests https://api.bigcommerce.com/stores/{storeHash}/v2/orders/123
await client.get('orders/123', { version: 'v2' });
```

______________________________________________________________________

## Fetching all pages from a v3 endpoint

Use `collect` to fetch all pages and buffer everything into an array:

```ts
const products = await client.collect('catalog/products', {
    query: { is_visible: true },
});
// products: unknown[]
```

The default page size is 250. Pages after the first are fetched concurrently. If the API enforces a different limit on the endpoint, the client automatically adjusts.

______________________________________________________________________

## Processing a large result set without buffering

Use `stream` when you want to process items as they arrive rather than waiting for all pages to load:

```ts
for await (const result of client.stream('catalog/products')) {
    if (result.err) {
        console.error('Page error:', result.err);
        continue;
    }

    await processProduct(result.data);
}
```

Each value yielded is a [`Result`](#handling-errors) — a page-level error doesn't abort the whole stream; you decide whether to skip, log, or rethrow.

______________________________________________________________________

## Filtering by a list of values

Use `query` when you have a list of SKUs, emails, or other values to look up. It automatically chunks the list across multiple concurrent requests to keep each URL under the 2048-character limit:

```ts
const products = await client.query('catalog/products', {
    key: 'sku:in',
    values: ['WIDGET-RED', 'WIDGET-BLUE', 'GADGET-SM'],
});

const customers = await client.query('customers', {
    key: 'email:in',
    values: ['alice@example.com', 'bob@example.com'],
});
```

For large lists processed lazily, use `queryStream`:

```ts
const skus = ['WIDGET-RED', 'WIDGET-BLUE', /* ...thousands more */];

for await (const result of client.queryStream('catalog/products', {
    key: 'sku:in',
    values: skus,
})) {
    if (result.err) {
        console.error(result.err);
        continue;
    }

    await processProduct(result.data);
}
```

______________________________________________________________________

## Working with v2 endpoints

v2 collection endpoints return a flat array and don't include pagination metadata. Use `collectBlind` or `streamBlind` — they probe pages in batches and stop when they receive an empty page, a 404, or a 204:

```ts
const orders = await client.collectBlind('orders', {
    query: { status_id: 2, limit: 200 },
});
```

By default the client fetches up to 500 pages. Raise or lower this with `maxPages`:

```ts
for await (const result of client.streamBlind('orders', { maxPages: 50 })) {
    if (result.err) {
        console.error(result.err);
        continue;
    }

    await processOrder(result.data);
}
```

______________________________________________________________________

## Running multiple requests concurrently

Use the `req` helpers to build request descriptors, then pass them to `batchSafe` or `batchStream`.

`batchSafe` waits for all requests and returns an array of `Result` values — it never throws:

```ts
import { req } from 'bc-api-client';

const results = await client.batchSafe([
    req.get('catalog/products/1'),
    req.get('catalog/products/2'),
    req.post('catalog/products', { body: { name: 'New Widget' } }),
]);

for (const result of results) {
    if (result.err) {
        console.error('Request failed:', result.err);
    } else {
        console.log(result.data);
    }
}
```

`batchStream` yields results as they complete rather than waiting for all of them:

```ts
const requests = productIds.map((id) => req.delete(`catalog/products/${id}`));

for await (const result of client.batchStream(requests)) {
    if (result.err) {
        console.error('Delete failed:', result.err);
    }
}
```

> **Note:** `batchStream` dispatches requests concurrently. If you break out of the loop early, in-flight mutating requests (POST, DELETE) may or may not have committed. Set `concurrency: false` to trade concurrency for deterministic sequential execution when early exit matters.

______________________________________________________________________

## Validating inputs and outputs at runtime

All request methods accept StandardSchemaV1-compatible schemas. This works with any compliant validation library — Zod, Valibot, ArkType, and others.

### Validating query parameters

`querySchema` validates the `query` object before the request is sent. It requires `query` to also be provided:

```ts
import { z } from 'zod';

const QuerySchema = z.object({
    page: z.int().positive(),
    limit: z.int().positive().max(250),
});

await client.get('catalog/products', {
    query: { page: 1, limit: 250 },
    querySchema: QuerySchema,
});
// Throws BCQueryValidationError if query doesn't match the schema
```

### Validating a request body

```ts
const ProductSchema = z.object({
    name: z.string(),
    price: z.number().positive(),
    type: z.enum(['physical', 'digital']),
});

await client.post('catalog/products', {
    body: { name: 'Widget', price: 9.99, type: 'physical' },
    bodySchema: ProductSchema,
});
// Throws BCRequestBodyValidationError if body doesn't match
```

### Validating a response

```ts
const ProductResponseSchema = z.object({
    data: z.object({
        id: z.number(),
        name: z.string(),
        price: z.number(),
    }),
});

const product = await client.get('catalog/products/123', {
    responseSchema: ProductResponseSchema,
});
// product is typed and validated — throws BCResponseValidationError if it doesn't match
```

### Validating items in a paginated result

Use `itemSchema` with `collect`, `stream`, `query`, `queryStream`, `collectBlind`, and `streamBlind`. Each item is validated individually:

```ts
const ProductSchema = z.object({
    id: z.number(),
    name: z.string(),
});

const products = await client.collect('catalog/products', {
    itemSchema: ProductSchema,
});
// Throws BCPaginatedItemValidationError on the first invalid item
```

With streaming methods, item validation errors are yielded as `Err` results rather than thrown, so you can handle them per-item:

```ts
for await (const result of client.stream('catalog/products', { itemSchema: ProductSchema })) {
    if (result.err) {
        // result.err is BCPaginatedItemValidationError — result.err.context.data has the raw item
        console.error('Validation failed for item:', result.err.context.data);
        continue;
    }

    // result.data is typed as z.infer<typeof ProductSchema>
    console.log(result.data.name);
}
```

### Bonus - self-maintained `include_fields`

With most validators, you can obtain schema keys and store them alongside the schema. That way, if you add or remove fields, your `include_fields` query param will catch up automatically.

```ts
// Zod
const ProductSchema = z.object({
    id: z.int().positive(),
    name: z.string(),
    sku: z.string(),
    price: z.number().positive(),
});

const PRODUCT_FIELDS = Object.keys(ProductSchema.shape);

// Valibot
const ProductSchema = v.object({
    id: v.number(),
    name: v.string(),
    sku: v.string(),
    price: v.pipe(v.number(), v.minValue(0, 'Must be positive')),
});

const PRODUCT_FIELDS = Object.keys(ProductSchema.entries);

// ArkType
const ProductSchema = type({
    id: 'number.integer > 0',
    name: 'string',
    sku: 'string',
    price: 'number > 0',
});

const PRODUCT_FIELDS = ProductSchema.props.map(p => p.key);

// Now, when making the request
const products = await client.collect('catalog/products', { 
    itemSchema: ProductSchema, query: { include_fields: PRODUCT_FIELDS }}
);

```

______________________________________________________________________

## Handling errors

All errors extend `BaseError`, which carries a machine-readable `code` string and a structured `context` object. Use `instanceof` to branch on error type:

```ts
import {
    BCApiError,
    BCTimeoutError,
    BCQueryValidationError,
    BCRequestBodyValidationError,
    BCResponseValidationError,
    BCPaginatedItemValidationError,
    BCCredentialsError,
} from 'bc-api-client';

try {
    await client.get('catalog/products/999');
} catch (err) {
    if (err instanceof BCApiError) {
        // HTTP error from the API
        console.error(err.context.status);       // e.g. 404
        console.error(err.context.responseBody); // raw response body
    } else if (err instanceof BCTimeoutError) {
        console.error('Timed out:', err.context.url);
    } else if (err instanceof BCQueryValidationError) {
        console.error('Bad query params:', err.context.error);
    } else {
        throw err;
    }
}
```

### Error reference

| Class | `code` | When it's thrown |
|---|---|---|
| `BCApiError` | `BC_API_ERROR` | Non-2xx HTTP response |
| `BCTimeoutError` | `BC_TIMEOUT_ERROR` | Request exceeded timeout (default 120 s) |
| `BCResponseParseError` | `BC_RESPONSE_PARSE_ERROR` | Response body couldn't be read or parsed as JSON |
| `BCCredentialsError` | `BC_CLIENT_CREDENTIALS_ERROR` | Missing or empty `storeHash` or `accessToken` at construction time |
| `BCClientError` | `BC_CLIENT_ERROR` | Catch-all for unexpected client-side errors |
| `BCQueryValidationError` | `BC_QUERY_VALIDATION_FAILED` | `querySchema` rejected the query params |
| `BCRequestBodyValidationError` | `BC_REQUEST_BODY_VALIDATION_FAILED` | `bodySchema` rejected the request body |
| `BCResponseValidationError` | `BC_RESPONSE_VALIDATION_FAILED` | `responseSchema` rejected the response body |
| `BCPaginatedItemValidationError` | `BC_PAGINATED_ITEM_VALIDATION_FAILED` | `itemSchema` rejected an item in a paginated response |
| `BCPaginatedOptionError` | `BC_PAGINATED_OPTION_ERROR` | `limit`, `page`, or `maxPages` is not a positive number |
| `BCPaginatedResponseError` | `BC_PAGINATED_RESPONSE_ERROR` | A page response is missing expected v3 envelope fields |
| `BCUrlTooLongError` | `BC_URL_TOO_LONG` | Constructed URL exceeds 2048 characters |
| `BCRateLimitNoHeadersError` | `BC_RATE_LIMIT_NO_HEADERS` | Got a 429 but the `X-Rate-Limit-*` headers were absent |
| `BCRateLimitDelayTooLongError` | `BC_RATE_LIMIT_DELAY_TOO_LONG` | Rate-limit reset window exceeds `retry.maxRetryAfter` |

______________________________________________________________________

## Tuning concurrency and rate-limit behavior

The client automatically adjusts concurrency up and down in response to errors and rate-limit responses during `stream`, `collect`, `query`, `batchSafe`, and `batchStream` operations.

### Client-level defaults

```ts
const client = new BigCommerceClient({
    storeHash: 'abc123',
    accessToken: 'your-token',
    concurrency: 10,        // max concurrent requests (default: 10)
    rateLimitBackoff: 1,    // drop to this concurrency on a 429 (default: 1)
    backoff: 2,             // divide concurrency by this on other errors (default: 2)
    backoffRecover: 1,      // add this per successful response to recover (default: 1)
});
```

All four options can also be overridden per-operation:

```ts
await client.collect('catalog/products', {
    concurrency: 5,
    rateLimitBackoff: 1,
});
```

### Disabling concurrency

Pass `concurrency: false` to run requests sequentially. Useful when result order matters or when you need to guarantee that early loop exit from `batchStream` doesn't leave in-flight mutations uncommitted:

```ts
const results = await client.batchSafe(requests, { concurrency: false });
```

### Custom backoff function

`backoff` and `backoffRecover` also accept functions for more control:

```ts
const client = new BigCommerceClient({
    storeHash: 'abc123',
    accessToken: 'your-token',
    backoff: (concurrency, status) => status === 503 ? 1 : Math.ceil(concurrency / 2),
    backoffRecover: (concurrency) => Math.ceil(concurrency * 0.1),
});
```

______________________________________________________________________

## Using a custom logger

Pass `logger: true` (or omit it) to get console logging at `info` level. Pass a log level string to adjust the threshold:

```ts
new BigCommerceClient({ ..., logger: 'debug' }); // debug | info | warn | error
new BigCommerceClient({ ..., logger: false });    // disable logging
```

Pass any object that implements `{ debug, info, warn, error }` to use your own logger:

```ts
import pino from 'pino';

const logger = pino();

new BigCommerceClient({ ..., logger });
```

### AWS Lambda Powertools

Powertools loggers use `(message, data)` argument order, which is the reverse of this library's interface. Use the included adapter:

```ts
import { Logger } from '@aws-lambda-powertools/logger';
import { fromAwsPowertoolsLogger } from 'bc-api-client';

const powertools = new Logger({ serviceName: 'my-service' });

new BigCommerceClient({
    ...,
    logger: fromAwsPowertoolsLogger(powertools),
});
```
