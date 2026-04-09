[**bc-api-client**](../README.md)

***

[bc-api-client](../README.md) / ClientConfig

# Interface: ClientConfig

Defined in: lib/common.ts:51

Configuration options for the BigCommerce client.

## Extends

- `Omit`\<`KyOptions`, `"throwHttpErrors"` \| `"parseJson"` \| `"method"` \| `"body"` \| `"json"` \| `"searchParams"`\>.[`ConcurrencyOptions`](../type-aliases/ConcurrencyOptions.md)

## Properties

| Property | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="accesstoken"></a> `accessToken` | `string` | - | - | lib/common.ts:55 |
| <a id="backoff"></a> `backoff?` | `number` \| ((`concurrency`, `status`) => `number`) | Divisor (or `(concurrency, status) => number` function) applied to concurrency on non-429 error responses. Defaults to 2. | `ConcurrencyOptions.backoff` | lib/common.ts:14 |
| <a id="backoffrecover"></a> `backoffRecover?` | `number` \| ((`concurrency`) => `number`) | Amount (or `(concurrency) => number` function) added to concurrency per successful response while below the configured max. Defaults to 1. | `ConcurrencyOptions.backoffRecover` | lib/common.ts:21 |
| <a id="concurrency"></a> `concurrency?` | `number` \| `false` | Max concurrent requests. Must be 1–1000. `false` for sequential. Defaults to 10. | `ConcurrencyOptions.concurrency` | lib/common.ts:9 |
| <a id="logger"></a> `logger?` | `boolean` \| [`Logger`](Logger.md) \| `"debug"` \| `"info"` \| `"warn"` \| `"error"` | - | - | lib/common.ts:56 |
| <a id="plimit"></a> `pLimit?` | `LimitFunction` | A p-limit instance to reuse across calls. When provided, `batchStream` uses it instead of creating a new one, allowing callers to observe and react to live concurrency changes. | `ConcurrencyOptions.pLimit` | lib/common.ts:26 |
| <a id="ratelimitbackoff"></a> `rateLimitBackoff?` | `number` | Concurrency cap applied when a 429 response is received. Defaults to 1. | `ConcurrencyOptions.rateLimitBackoff` | lib/common.ts:16 |
| <a id="storehash"></a> `storeHash` | `string` | - | - | lib/common.ts:54 |
