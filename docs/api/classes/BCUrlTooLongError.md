[**bc-api-client**](../README.md)

***

[bc-api-client](../README.md) / BCUrlTooLongError

# Class: BCUrlTooLongError

Defined in: lib/errors.ts:59

Thrown before a request is sent when the constructed URL exceeds 2048 characters.

## Extends

- [`BaseError`](BaseError.md)\<\{ `len`: `number`; `max`: `number`; `url`: `string`; \}\>

## Constructors

### Constructor

> **new BCUrlTooLongError**(`url`, `max`): `BCUrlTooLongError`

Defined in: lib/errors.ts:66

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `url` | `string` |
| `max` | `number` |

#### Returns

`BCUrlTooLongError`

#### Overrides

[`BaseError`](BaseError.md).[`constructor`](BaseError.md#constructor)

## Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="code"></a> `code` | `public` | `string` | `'BC_URL_TOO_LONG'` | Machine-readable error code. Unique per subclass. | [`BaseError`](BaseError.md).[`code`](BaseError.md#code) | - | lib/errors.ts:64 |
| <a id="context"></a> `context` | `readonly` | `object` | `undefined` | - | - | [`BaseError`](BaseError.md).[`context`](BaseError.md#context) | lib/errors.ts:18 |
| `context.len` | `public` | `number` | `undefined` | - | - | - | lib/errors.ts:62 |
| `context.max` | `public` | `number` | `undefined` | - | - | - | lib/errors.ts:61 |
| `context.url` | `public` | `string` | `undefined` | - | - | - | lib/errors.ts:60 |
