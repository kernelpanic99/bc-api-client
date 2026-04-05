[**bc-api-client**](../README.md)

***

[bc-api-client](../README.md) / BCRateLimitNoHeadersError

# Class: BCRateLimitNoHeadersError

Defined in: lib/errors.ts:76

Thrown during retry when a 429 response is received but the expected
`X-Rate-Limit-*` headers are absent, making it impossible to determine the backoff delay.

## Extends

- [`BaseError`](BaseError.md)\<\{ `attempts`: `number`; `method`: `string`; `url`: `string`; \}\>

## Constructors

### Constructor

> **new BCRateLimitNoHeadersError**(`request`, `attempts`): `BCRateLimitNoHeadersError`

Defined in: lib/errors.ts:83

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `request` | `KyRequest` |
| `attempts` | `number` |

#### Returns

`BCRateLimitNoHeadersError`

#### Overrides

[`BaseError`](BaseError.md).[`constructor`](BaseError.md#constructor)

## Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="code"></a> `code` | `public` | `string` | `'BC_RATE_LIMIT_NO_HEADERS'` | Machine-readable error code. Unique per subclass. | [`BaseError`](BaseError.md).[`code`](BaseError.md#code) | - | lib/errors.ts:81 |
| <a id="context"></a> `context` | `readonly` | `object` | `undefined` | - | - | [`BaseError`](BaseError.md).[`context`](BaseError.md#context) | lib/errors.ts:19 |
| `context.attempts` | `public` | `number` | `undefined` | - | - | - | lib/errors.ts:79 |
| `context.method` | `public` | `string` | `undefined` | - | - | - | lib/errors.ts:78 |
| `context.url` | `public` | `string` | `undefined` | - | - | - | lib/errors.ts:77 |
