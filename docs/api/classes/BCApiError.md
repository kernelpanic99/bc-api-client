[**bc-api-client**](../README.md)

***

[bc-api-client](../README.md) / BCApiError

# Class: BCApiError

Defined in: lib/errors.ts:155

Thrown when the BigCommerce API returns a non-2xx HTTP response.
`context.status` and `context.responseBody` are the most useful fields for debugging.

## Extends

- [`BaseError`](BaseError.md)\<\{ `headers`: `Record`\<`string`, `string`\>; `method`: `string`; `requestBody`: `string`; `responseBody`: `string`; `status`: `number`; `statusMessage`: `string`; `url`: `string`; \}\>

## Constructors

### Constructor

> **new BCApiError**(`err`, `requestBody`, `responseBody`): `BCApiError`

Defined in: lib/errors.ts:166

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `err` | `HTTPError` |
| `requestBody` | `string` |
| `responseBody` | `string` |

#### Returns

`BCApiError`

#### Overrides

[`BaseError`](BaseError.md).[`constructor`](BaseError.md#constructor)

## Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="code"></a> `code` | `public` | `string` | `'BC_API_ERROR'` | Machine-readable error code. Unique per subclass. | [`BaseError`](BaseError.md).[`code`](BaseError.md#code) | - | lib/errors.ts:164 |
| <a id="context"></a> `context` | `readonly` | `object` | `undefined` | - | - | [`BaseError`](BaseError.md).[`context`](BaseError.md#context) | lib/errors.ts:19 |
| `context.headers` | `public` | `Record`\<`string`, `string`\> | `undefined` | - | - | - | lib/errors.ts:160 |
| `context.method` | `public` | `string` | `undefined` | - | - | - | lib/errors.ts:156 |
| `context.requestBody` | `public` | `string` | `undefined` | - | - | - | lib/errors.ts:161 |
| `context.responseBody` | `public` | `string` | `undefined` | - | - | - | lib/errors.ts:162 |
| `context.status` | `public` | `number` | `undefined` | - | - | - | lib/errors.ts:158 |
| `context.statusMessage` | `public` | `string` | `undefined` | - | - | - | lib/errors.ts:159 |
| `context.url` | `public` | `string` | `undefined` | - | - | - | lib/errors.ts:157 |
