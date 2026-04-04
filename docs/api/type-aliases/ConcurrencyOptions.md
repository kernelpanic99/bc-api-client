[**bc-api-client**](../README.md)

***

[bc-api-client](../README.md) / ConcurrencyOptions

# Type Alias: ConcurrencyOptions

> **ConcurrencyOptions** = `object`

Defined in: lib/common.ts:6

## Extended by

- [`ClientConfig`](../interfaces/ClientConfig.md)

## Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="backoff"></a> `backoff?` | ((`concurrency`, `status`) => `number`) \| `number` | lib/common.ts:8 |
| <a id="backoffrecover"></a> `backoffRecover?` | ((`concurrency`) => `number`) \| `number` | lib/common.ts:10 |
| <a id="concurrency"></a> `concurrency?` | `number` \| `false` | lib/common.ts:7 |
| <a id="ratelimitbackoff"></a> `rateLimitBackoff?` | `number` | lib/common.ts:9 |
