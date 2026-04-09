[**bc-api-client**](../README.md)

***

[bc-api-client](../README.md) / ConcurrencyOptions

# Type Alias: ConcurrencyOptions

> **ConcurrencyOptions** = `object`

Defined in: lib/common.ts:7

## Extended by

- [`ClientConfig`](../interfaces/ClientConfig.md)

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="backoff"></a> `backoff?` | ((`concurrency`, `status`) => `number`) \| `number` | Divisor (or `(concurrency, status) => number` function) applied to concurrency on non-429 error responses. Defaults to 2. | lib/common.ts:14 |
| <a id="backoffrecover"></a> `backoffRecover?` | ((`concurrency`) => `number`) \| `number` | Amount (or `(concurrency) => number` function) added to concurrency per successful response while below the configured max. Defaults to 1. | lib/common.ts:21 |
| <a id="concurrency"></a> `concurrency?` | `number` \| `false` | Max concurrent requests. Must be 1–1000. `false` for sequential. Defaults to 10. | lib/common.ts:9 |
| <a id="plimit"></a> `pLimit?` | `LimitFunction` | A p-limit instance to reuse across calls. When provided, `batchStream` uses it instead of creating a new one, allowing callers to observe and react to live concurrency changes. | lib/common.ts:26 |
| <a id="ratelimitbackoff"></a> `rateLimitBackoff?` | `number` | Concurrency cap applied when a 429 response is received. Defaults to 1. | lib/common.ts:16 |
