[**bc-api-client**](../README.md)

***

[bc-api-client](../README.md) / BCRateLimitDelayTooLongError

# Class: BCRateLimitDelayTooLongError

Defined in: lib/errors.ts:95

Thrown during retry when a 429 response specifies a reset window that exceeds
`config.retry.maxRetryAfter`, preventing an unbounded wait.

## Extends

- [`BaseError`](BaseError.md)\<\{ `attempts`: `number`; `delay`: `number`; `maxDelay`: `number`; `method`: `string`; `url`: `string`; \}\>

## Constructors

### Constructor

> **new BCRateLimitDelayTooLongError**(`request`, `attempts`, `maxDelay`, `delay`): `BCRateLimitDelayTooLongError`

Defined in: lib/errors.ts:104

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `request` | `KyRequest` |
| `attempts` | `number` |
| `maxDelay` | `number` |
| `delay` | `number` |

#### Returns

`BCRateLimitDelayTooLongError`

#### Overrides

[`BaseError`](BaseError.md).[`constructor`](BaseError.md#constructor)

## Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="code"></a> `code` | `public` | `string` | `'BC_RATE_LIMIT_DELAY_TOO_LONG'` | Machine-readable error code. Unique per subclass. | [`BaseError`](BaseError.md).[`code`](BaseError.md#code) | - | lib/errors.ts:102 |
| <a id="context"></a> `context` | `readonly` | `object` | `undefined` | - | - | [`BaseError`](BaseError.md).[`context`](BaseError.md#context) | lib/errors.ts:18 |
| `context.attempts` | `public` | `number` | `undefined` | - | - | - | lib/errors.ts:98 |
| `context.delay` | `public` | `number` | `undefined` | - | - | - | lib/errors.ts:100 |
| `context.maxDelay` | `public` | `number` | `undefined` | - | - | - | lib/errors.ts:99 |
| `context.method` | `public` | `string` | `undefined` | - | - | - | lib/errors.ts:97 |
| `context.url` | `public` | `string` | `undefined` | - | - | - | lib/errors.ts:96 |
