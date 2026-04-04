[**bc-api-client**](../README.md)

***

[bc-api-client](../README.md) / BCTimeoutError

# Class: BCTimeoutError

Defined in: lib/errors.ts:181

Thrown when a request exceeds the configured timeout (default 120 s).

## Extends

- [`BaseError`](BaseError.md)\<\{ `method`: `string`; `url`: `string`; \}\>

## Constructors

### Constructor

> **new BCTimeoutError**(`err`): `BCTimeoutError`

Defined in: lib/errors.ts:187

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `err` | `TimeoutError` |

#### Returns

`BCTimeoutError`

#### Overrides

[`BaseError`](BaseError.md).[`constructor`](BaseError.md#constructor)

## Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="code"></a> `code` | `public` | `string` | `'BC_TIMEOUT_ERROR'` | Machine-readable error code. Unique per subclass. | [`BaseError`](BaseError.md).[`code`](BaseError.md#code) | - | lib/errors.ts:185 |
| <a id="context"></a> `context` | `readonly` | `object` | `undefined` | - | - | [`BaseError`](BaseError.md).[`context`](BaseError.md#context) | lib/errors.ts:18 |
| `context.method` | `public` | `string` | `undefined` | - | - | - | lib/errors.ts:182 |
| `context.url` | `public` | `string` | `undefined` | - | - | - | lib/errors.ts:183 |
