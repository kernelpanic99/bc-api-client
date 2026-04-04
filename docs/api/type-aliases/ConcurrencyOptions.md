[**bc-api-client**](../README.md)

***

[bc-api-client](../README.md) / ConcurrencyOptions

# Type Alias: ConcurrencyOptions

> **ConcurrencyOptions** = `object`

Defined in: lib/common.ts:6

## Extended by

- [`ClientConfig`](../interfaces/ClientConfig.md)

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="backoff"></a> `backoff?` | ((`concurrency`, `status`) => `number`) \| `number` | Divisor (or `(concurrency, status) => number` function) applied to concurrency on non-429 error responses. Defaults to 2. | lib/common.ts:13 |
| <a id="backoffrecover"></a> `backoffRecover?` | ((`concurrency`) => `number`) \| `number` | Amount (or `(concurrency) => number` function) added to concurrency per successful response while below the configured max. Defaults to 1. | lib/common.ts:20 |
| <a id="concurrency"></a> `concurrency?` | `number` \| `false` | Max concurrent requests. Must be 1–1000. `false` for sequential. Defaults to 10. | lib/common.ts:8 |
| <a id="ratelimitbackoff"></a> `rateLimitBackoff?` | `number` | Concurrency cap applied when a 429 response is received. Defaults to 1. | lib/common.ts:15 |
