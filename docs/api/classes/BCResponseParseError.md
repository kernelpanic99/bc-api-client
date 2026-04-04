[**bc-api-client**](../README.md)

***

[bc-api-client](../README.md) / BCResponseParseError

# Class: BCResponseParseError

Defined in: lib/errors.ts:199

Thrown when the response body cannot be read or parsed as JSON.
`context.rawBody` contains the raw text that failed to parse (empty string if the body was empty).

## Extends

- [`BaseError`](BaseError.md)\<\{ `method`: `string`; `path`: `string`; `rawBody?`: `string`; \}\>

## Constructors

### Constructor

> **new BCResponseParseError**(`method`, `path`, `cause`, `rawBody?`): `BCResponseParseError`

Defined in: lib/errors.ts:202

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `method` | `string` |
| `path` | `string` |
| `cause` | `unknown` |
| `rawBody?` | `string` |

#### Returns

`BCResponseParseError`

#### Overrides

[`BaseError`](BaseError.md).[`constructor`](BaseError.md#constructor)

## Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="code"></a> `code` | `public` | `string` | `'BC_RESPONSE_PARSE_ERROR'` | Machine-readable error code. Unique per subclass. | [`BaseError`](BaseError.md).[`code`](BaseError.md#code) | - | lib/errors.ts:200 |
| <a id="context"></a> `context` | `readonly` | `object` | `undefined` | - | - | [`BaseError`](BaseError.md).[`context`](BaseError.md#context) | lib/errors.ts:18 |
| `context.method` | `public` | `string` | `undefined` | - | - | - | lib/errors.ts:199 |
| `context.path` | `public` | `string` | `undefined` | - | - | - | lib/errors.ts:199 |
| `context.rawBody?` | `public` | `string` | `undefined` | - | - | - | lib/errors.ts:199 |
