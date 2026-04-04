[**bc-api-client**](../README.md)

***

[bc-api-client](../README.md) / ClientConfig

# Interface: ClientConfig

Defined in: lib/common.ts:23

## Extends

- `Omit`\<`KyOptions`, `"throwHttpErrors"` \| `"parseJson"` \| `"method"` \| `"body"` \| `"json"` \| `"searchParams"`\>.[`ConcurrencyOptions`](../type-aliases/ConcurrencyOptions.md)

## Properties

| Property | Type | Inherited from | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="accesstoken"></a> `accessToken` | `string` | - | lib/common.ts:27 |
| <a id="backoff"></a> `backoff?` | `number` \| ((`concurrency`, `status`) => `number`) | `ConcurrencyOptions.backoff` | lib/common.ts:8 |
| <a id="backoffrecover"></a> `backoffRecover?` | `number` \| ((`concurrency`) => `number`) | `ConcurrencyOptions.backoffRecover` | lib/common.ts:10 |
| <a id="concurrency"></a> `concurrency?` | `number` \| `false` | `ConcurrencyOptions.concurrency` | lib/common.ts:7 |
| <a id="logger"></a> `logger?` | `boolean` \| [`Logger`](Logger.md) \| `"debug"` \| `"info"` \| `"warn"` \| `"error"` | - | lib/common.ts:28 |
| <a id="ratelimitbackoff"></a> `rateLimitBackoff?` | `number` | `ConcurrencyOptions.rateLimitBackoff` | lib/common.ts:9 |
| <a id="storehash"></a> `storeHash` | `string` | - | lib/common.ts:26 |
