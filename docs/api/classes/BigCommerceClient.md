[**bc-api-client**](../README.md)

***

[bc-api-client](../README.md) / BigCommerceClient

# Class: BigCommerceClient

Defined in: client.ts:57

## Constructors

### Constructor

> **new BigCommerceClient**(`config`): `BigCommerceClient`

Defined in: client.ts:86

Creates a new BigCommerceClient.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `config` | [`ClientConfig`](../interfaces/ClientConfig.md) | Client configuration. Ky options (e.g. `prefixUrl`, `timeout`, `retry`, `hooks`) are forwarded to the underlying ky instance. |

#### Returns

`BigCommerceClient`

#### Throws

[BCCredentialsError](BCCredentialsError.md) if `storeHash` or `accessToken` are missing or if
  `concurrency` is out of range.

#### Throws

[BCClientError](BCClientError.md) if `prefixUrl` is not a valid URL.

## Methods

### batchSafe()

> **batchSafe**\<`TBody`, `TRes`, `TQuery`\>(`requests`, `options?`): `Promise`\<[`Result`](../type-aliases/Result.md)\<`TRes`, [`BaseError`](BaseError.md)\<[`ErrorContext`](../type-aliases/ErrorContext.md)\>\>[]\>

Defined in: client.ts:638

Executes multiple requests concurrently and returns all results as [Result](../type-aliases/Result.md) values,
never throwing. Errors from individual requests are captured as `Err` results.

Use [batchStream](#batchstream) to process results as they arrive rather than waiting for all.

#### Type Parameters

| Type Parameter |
| ------ |
| `TBody` |
| `TRes` |
| `TQuery` *extends* [`Query`](../type-aliases/Query.md) |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `requests` | [`BatchRequestOptions`](../type-aliases/BatchRequestOptions.md)\<`TBody`, `TRes`, `TQuery`\>[] | Array of request descriptors built with the [req](../variables/req.md) helpers. |
| `options?` | [`ConcurrencyOptions`](../type-aliases/ConcurrencyOptions.md) | - |

#### Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<`TRes`, [`BaseError`](BaseError.md)\<[`ErrorContext`](../type-aliases/ErrorContext.md)\>\>[]\>

Results in the order requests complete (not necessarily input order).

***

### batchStream()

> **batchStream**\<`TBody`, `TRes`, `TQuery`\>(`requests`, `options?`): `AsyncGenerator`\<[`Result`](../type-aliases/Result.md)\<`TRes`, [`BaseError`](BaseError.md)\<[`ErrorContext`](../type-aliases/ErrorContext.md)\>\>\>

Defined in: client.ts:788

Executes multiple requests with configurable concurrency, yielding each result as a
[Result](../type-aliases/Result.md) as it completes. Errors from individual requests are yielded as `Err`
results rather than thrown.

Automatically adjusts concurrency up/down in response to rate-limit and error responses.
Use [batchSafe](#batchsafe) to collect all results into an array.

#### Type Parameters

| Type Parameter |
| ------ |
| `TBody` |
| `TRes` |
| `TQuery` *extends* [`Query`](../type-aliases/Query.md) |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `requests` | [`BatchRequestOptions`](../type-aliases/BatchRequestOptions.md)\<`TBody`, `TRes`, `TQuery`\>[] | Array of request descriptors built with the [req](../variables/req.md) helpers. |
| `options?` | [`ConcurrencyOptions`](../type-aliases/ConcurrencyOptions.md) | - |

#### Returns

`AsyncGenerator`\<[`Result`](../type-aliases/Result.md)\<`TRes`, [`BaseError`](BaseError.md)\<[`ErrorContext`](../type-aliases/ErrorContext.md)\>\>\>

***

### collect()

> **collect**\<`TItem`, `TQuery`\>(`path`, `options?`): `Promise`\<`TItem`[]\>

Defined in: client.ts:465

Fetches all pages from a v3 paginated endpoint and collects items into an array.

Use [stream](#stream) to process items lazily without buffering the full result set.

#### Type Parameters

| Type Parameter |
| ------ |
| `TItem` |
| `TQuery` *extends* [`Query`](../type-aliases/Query.md) |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` | API path relative to the store's versioned base URL. |
| `options?` | [`CollectOptions`](../type-aliases/CollectOptions.md)\<`TItem`, `TQuery`\> | Ky options are forwarded to page requests. |

#### Returns

`Promise`\<`TItem`[]\>

All items across all pages.

#### Throws

[BCPaginatedOptionError](BCPaginatedOptionError.md) if `query.limit` or `query.page` is not a positive number.

#### Throws

[BCQueryValidationError](BCQueryValidationError.md) if `querySchema` validation fails.

#### Throws

[BCApiError](BCApiError.md) on HTTP error responses.

#### Throws

[BCTimeoutError](BCTimeoutError.md) if a request times out.

#### Throws

[BCResponseParseError](BCResponseParseError.md) if a response body cannot be parsed.

#### Throws

[BCUrlTooLongError](BCUrlTooLongError.md) if a constructed URL exceeds 2048 characters.

#### Throws

[BCRateLimitNoHeadersError](BCRateLimitNoHeadersError.md) if a 429 is received without rate-limit headers.

#### Throws

[BCRateLimitDelayTooLongError](BCRateLimitDelayTooLongError.md) if the rate-limit reset window exceeds
  `config.retry.maxRetryAfter`.

#### Throws

[BCPaginatedResponseError](BCPaginatedResponseError.md) if a page response has an unexpected shape.

#### Throws

[BCPaginatedItemValidationError](BCPaginatedItemValidationError.md) if `itemSchema` validation fails for an item.

#### Throws

[BCClientError](BCClientError.md) on any other ky or unknown error.

***

### collectCount()

> **collectCount**\<`TItem`, `TQuery`\>(`path`, `options?`): `Promise`\<`TItem`[]\>

Defined in: client.ts:603

Fetches items from a v2 paginated endpoint using a known total item `count` and collects
them into an array.

Use this for v2 endpoints that do not return pagination metadata. Use [streamCount](#streamcount)
to process items lazily.

#### Type Parameters

| Type Parameter |
| ------ |
| `TItem` |
| `TQuery` *extends* [`Query`](../type-aliases/Query.md) |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` | API path relative to the store's versioned base URL. |
| `options?` | `CountedCollectOptions`\<`TItem`, `TQuery`\> | Ky options are forwarded to page requests. |

#### Returns

`Promise`\<`TItem`[]\>

All items across the computed page range.

#### Throws

[BCPaginatedOptionError](BCPaginatedOptionError.md) if `count`, `query.limit`, or `query.page` is not a
  positive number.

#### Throws

[BCQueryValidationError](BCQueryValidationError.md) if `querySchema` validation fails.

#### Throws

[BCApiError](BCApiError.md) on HTTP error responses.

#### Throws

[BCTimeoutError](BCTimeoutError.md) if a request times out.

#### Throws

[BCResponseParseError](BCResponseParseError.md) if a response body cannot be parsed.

#### Throws

[BCUrlTooLongError](BCUrlTooLongError.md) if a constructed URL exceeds 2048 characters.

#### Throws

[BCRateLimitNoHeadersError](BCRateLimitNoHeadersError.md) if a 429 is received without rate-limit headers.

#### Throws

[BCRateLimitDelayTooLongError](BCRateLimitDelayTooLongError.md) if the rate-limit reset window exceeds
  `config.retry.maxRetryAfter`.

#### Throws

[BCPaginatedItemValidationError](BCPaginatedItemValidationError.md) if `itemSchema` validation fails for an item.

#### Throws

[BCClientError](BCClientError.md) on any other ky or unknown error.

***

### delete()

> **delete**\<`TRes`, `TQuery`\>(`path`, `options?`): `Promise`\<`void`\>

Defined in: client.ts:250

Sends a DELETE request to the given path.

Silently suppresses 404 responses (resource already gone) and empty response bodies.

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `TRes` | `never` |
| `TQuery` *extends* [`Query`](../type-aliases/Query.md) | [`Query`](../type-aliases/Query.md) |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` | API path relative to the store's versioned base URL. |
| `options?` | [`DeleteOptions`](../type-aliases/DeleteOptions.md)\<`TQuery`\> | Ky options are forwarded to the underlying request. |

#### Returns

`Promise`\<`void`\>

#### Throws

[BCApiError](BCApiError.md) on non-404 HTTP error responses.

#### Throws

[BCTimeoutError](BCTimeoutError.md) if the request times out.

#### Throws

[BCResponseParseError](BCResponseParseError.md) if the response body is non-empty and cannot be parsed.

#### Throws

[BCUrlTooLongError](BCUrlTooLongError.md) if the constructed URL exceeds 2048 characters.

#### Throws

[BCRateLimitNoHeadersError](BCRateLimitNoHeadersError.md) if a 429 is received without rate-limit headers.

#### Throws

[BCRateLimitDelayTooLongError](BCRateLimitDelayTooLongError.md) if the rate-limit reset window exceeds
  `config.retry.maxRetryAfter`.

#### Throws

[BCQueryValidationError](BCQueryValidationError.md) if `querySchema` validation fails.

#### Throws

[BCClientError](BCClientError.md) on any other ky or unknown error.

***

### get()

> **get**\<`TRes`, `TQuery`\>(`path`, `options?`): `Promise`\<`TRes`\>

Defined in: client.ts:145

Sends a GET request to the given path.

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `TRes` | - |
| `TQuery` *extends* [`Query`](../type-aliases/Query.md) | [`Query`](../type-aliases/Query.md) |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` | API path relative to the store's versioned base URL (e.g. `catalog/products`). |
| `options?` | [`GetOptions`](../type-aliases/GetOptions.md)\<`TRes`, `TQuery`\> | Ky options are forwarded to the underlying request. |

#### Returns

`Promise`\<`TRes`\>

Parsed and optionally validated response body.

#### Throws

[BCApiError](BCApiError.md) on HTTP error responses.

#### Throws

[BCTimeoutError](BCTimeoutError.md) if the request times out.

#### Throws

[BCResponseParseError](BCResponseParseError.md) if the response body cannot be parsed.

#### Throws

[BCUrlTooLongError](BCUrlTooLongError.md) if the constructed URL exceeds 2048 characters.

#### Throws

[BCRateLimitNoHeadersError](BCRateLimitNoHeadersError.md) if a 429 is received without rate-limit headers.

#### Throws

[BCRateLimitDelayTooLongError](BCRateLimitDelayTooLongError.md) if the rate-limit reset window exceeds
  `config.retry.maxRetryAfter`.

#### Throws

[BCQueryValidationError](BCQueryValidationError.md) if `querySchema` validation fails.

#### Throws

[BCResponseValidationError](BCResponseValidationError.md) if `responseSchema` validation fails.

#### Throws

[BCClientError](BCClientError.md) on any other ky or unknown error.

***

### post()

> **post**\<`TRes`, `TBody`, `TQuery`\>(`path`, `options?`): `Promise`\<`TRes`\>

Defined in: client.ts:180

Sends a POST request to the given path.

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `TRes` | - |
| `TBody` | `unknown` |
| `TQuery` *extends* [`Query`](../type-aliases/Query.md) | [`Query`](../type-aliases/Query.md) |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` | API path relative to the store's versioned base URL. |
| `options?` | [`PostOptions`](../type-aliases/PostOptions.md)\<`TBody`, `TRes`, `TQuery`\> | Ky options are forwarded to the underlying request. |

#### Returns

`Promise`\<`TRes`\>

Parsed and optionally validated response body.

#### Throws

[BCApiError](BCApiError.md) on HTTP error responses.

#### Throws

[BCTimeoutError](BCTimeoutError.md) if the request times out.

#### Throws

[BCResponseParseError](BCResponseParseError.md) if the response body cannot be parsed.

#### Throws

[BCUrlTooLongError](BCUrlTooLongError.md) if the constructed URL exceeds 2048 characters.

#### Throws

[BCRateLimitNoHeadersError](BCRateLimitNoHeadersError.md) if a 429 is received without rate-limit headers.

#### Throws

[BCRateLimitDelayTooLongError](BCRateLimitDelayTooLongError.md) if the rate-limit reset window exceeds
  `config.retry.maxRetryAfter`.

#### Throws

[BCQueryValidationError](BCQueryValidationError.md) if `querySchema` validation fails.

#### Throws

[BCRequestBodyValidationError](BCRequestBodyValidationError.md) if `bodySchema` validation fails.

#### Throws

[BCResponseValidationError](BCResponseValidationError.md) if `responseSchema` validation fails.

#### Throws

[BCClientError](BCClientError.md) on any other ky or unknown error.

***

### put()

> **put**\<`TRes`, `TBody`, `TQuery`\>(`path`, `options?`): `Promise`\<`TRes`\>

Defined in: client.ts:218

Sends a PUT request to the given path.

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `TRes` | - |
| `TBody` | `unknown` |
| `TQuery` *extends* [`Query`](../type-aliases/Query.md) | [`Query`](../type-aliases/Query.md) |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` | API path relative to the store's versioned base URL. |
| `options?` | [`PutOptions`](../type-aliases/PutOptions.md)\<`TBody`, `TRes`, `TQuery`\> | Ky options are forwarded to the underlying request. |

#### Returns

`Promise`\<`TRes`\>

Parsed and optionally validated response body.

#### Throws

[BCApiError](BCApiError.md) on HTTP error responses.

#### Throws

[BCTimeoutError](BCTimeoutError.md) if the request times out.

#### Throws

[BCResponseParseError](BCResponseParseError.md) if the response body cannot be parsed.

#### Throws

[BCUrlTooLongError](BCUrlTooLongError.md) if the constructed URL exceeds 2048 characters.

#### Throws

[BCRateLimitNoHeadersError](BCRateLimitNoHeadersError.md) if a 429 is received without rate-limit headers.

#### Throws

[BCRateLimitDelayTooLongError](BCRateLimitDelayTooLongError.md) if the rate-limit reset window exceeds
  `config.retry.maxRetryAfter`.

#### Throws

[BCQueryValidationError](BCQueryValidationError.md) if `querySchema` validation fails.

#### Throws

[BCRequestBodyValidationError](BCRequestBodyValidationError.md) if `bodySchema` validation fails.

#### Throws

[BCResponseValidationError](BCResponseValidationError.md) if `responseSchema` validation fails.

#### Throws

[BCClientError](BCClientError.md) on any other ky or unknown error.

***

### query()

> **query**\<`TItem`, `TQuery`\>(`path`, `options`): `Promise`\<`TItem`[]\>

Defined in: client.ts:313

Fetches items from a v3 paginated endpoint by splitting `values` across multiple requests
using the given `key` query param, chunking to stay within URL length limits.

Collects all results into an array. Use [queryStream](#querystream) to process items lazily.

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `TItem` | - |
| `TQuery` *extends* [`Query`](../type-aliases/Query.md) | [`Query`](../type-aliases/Query.md) |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` | API path relative to the store's versioned base URL. |
| `options` | `QueryOptions`\<`TItem`, `TQuery`\> | - |

#### Returns

`Promise`\<`TItem`[]\>

All matching items across all chunked requests.

#### Throws

[BCPaginatedOptionError](BCPaginatedOptionError.md) if `query.limit` is not a positive number.

#### Throws

[BCQueryValidationError](BCQueryValidationError.md) if `querySchema` validation fails.

#### Throws

[BCApiError](BCApiError.md) on HTTP error responses.

#### Throws

[BCTimeoutError](BCTimeoutError.md) if a request times out.

#### Throws

[BCResponseParseError](BCResponseParseError.md) if a response body cannot be parsed.

#### Throws

[BCUrlTooLongError](BCUrlTooLongError.md) if a constructed URL exceeds 2048 characters.

#### Throws

[BCRateLimitNoHeadersError](BCRateLimitNoHeadersError.md) if a 429 is received without rate-limit headers.

#### Throws

[BCRateLimitDelayTooLongError](BCRateLimitDelayTooLongError.md) if the rate-limit reset window exceeds
  `config.retry.maxRetryAfter`.

#### Throws

[BCPaginatedResponseError](BCPaginatedResponseError.md) if a page response has an unexpected shape.

#### Throws

[BCPaginatedItemValidationError](BCPaginatedItemValidationError.md) if `itemSchema` validation fails for an item.

#### Throws

[BCClientError](BCClientError.md) on any other ky or unknown error.

***

### queryStream()

> **queryStream**\<`TItem`, `TQuery`\>(`path`, `options`): `AsyncGenerator`\<[`Result`](../type-aliases/Result.md)\<`TItem`, [`BaseError`](BaseError.md)\<[`ErrorContext`](../type-aliases/ErrorContext.md)\>\>\>

Defined in: client.ts:356

Streaming variant of [query](#query). Yields each item individually as results arrive,
splitting `values` into URL-length-safe chunks across concurrent requests.

Each yielded value is a [Result](../type-aliases/Result.md) — check `err` before using `data`.

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `TItem` | - |
| `TQuery` *extends* [`Query`](../type-aliases/Query.md) | [`Query`](../type-aliases/Query.md) |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` | API path relative to the store's versioned base URL. |
| `options` | `QueryOptions`\<`TItem`, `TQuery`\> | - |

#### Returns

`AsyncGenerator`\<[`Result`](../type-aliases/Result.md)\<`TItem`, [`BaseError`](BaseError.md)\<[`ErrorContext`](../type-aliases/ErrorContext.md)\>\>\>

#### Throws

[BCPaginatedOptionError](BCPaginatedOptionError.md) if `query.limit` is not a positive number.

#### Throws

[BCQueryValidationError](BCQueryValidationError.md) if `querySchema` validation fails.

***

### stream()

> **stream**\<`TItem`, `TQuery`\>(`path`, `options?`): `AsyncGenerator`\<[`Result`](../type-aliases/Result.md)\<`TItem`, [`BaseError`](BaseError.md)\<[`ErrorContext`](../type-aliases/ErrorContext.md)\>\>\>

Defined in: client.ts:679

Streams all items from a v3 paginated endpoint, fetching the first page sequentially
and remaining pages concurrently via [batchStream](#batchstream).

Each yielded value is a [Result](../type-aliases/Result.md) — check `err` before using `data`. Use
[collect](#collect) to gather all items into an array.

#### Type Parameters

| Type Parameter |
| ------ |
| `TItem` |
| `TQuery` *extends* [`Query`](../type-aliases/Query.md) |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` | API path relative to the store's versioned base URL. |
| `options?` | [`CollectOptions`](../type-aliases/CollectOptions.md)\<`TItem`, `TQuery`\> | Ky options are forwarded to page requests. |

#### Returns

`AsyncGenerator`\<[`Result`](../type-aliases/Result.md)\<`TItem`, [`BaseError`](BaseError.md)\<[`ErrorContext`](../type-aliases/ErrorContext.md)\>\>\>

#### Throws

[BCPaginatedOptionError](BCPaginatedOptionError.md) if `query.limit` or `query.page` is not a positive number.

#### Throws

[BCQueryValidationError](BCQueryValidationError.md) if `querySchema` validation fails.

***

### streamCount()

> **streamCount**\<`TItem`, `TQuery`\>(`path`, `options?`): `AsyncGenerator`\<[`Result`](../type-aliases/Result.md)\<`TItem`, [`BaseError`](BaseError.md)\<[`ErrorContext`](../type-aliases/ErrorContext.md)\>\>\>

Defined in: client.ts:510

Streams items from a v2 paginated endpoint using a known total item `count`.

Use this for v2 endpoints that do not return pagination metadata. Yields each item
as a [Result](../type-aliases/Result.md) — check `err` before using `data`. Use [collectCount](#collectcount) to
collect all results into an array.

#### Type Parameters

| Type Parameter |
| ------ |
| `TItem` |
| `TQuery` *extends* [`Query`](../type-aliases/Query.md) |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` | API path relative to the store's versioned base URL. |
| `options?` | `CountedCollectOptions`\<`TItem`, `TQuery`\> | Ky options are forwarded to page requests. |

#### Returns

`AsyncGenerator`\<[`Result`](../type-aliases/Result.md)\<`TItem`, [`BaseError`](BaseError.md)\<[`ErrorContext`](../type-aliases/ErrorContext.md)\>\>\>

#### Throws

[BCPaginatedOptionError](BCPaginatedOptionError.md) if `count`, `query.limit`, or `query.page` is not a
  positive number.

#### Throws

[BCQueryValidationError](BCQueryValidationError.md) if `querySchema` validation fails.
