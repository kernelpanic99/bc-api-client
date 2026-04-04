[**bc-api-client**](../README.md)

***

[bc-api-client](../README.md) / BCPaginatedResponseError

# Class: BCPaginatedResponseError

Defined in: lib/errors.ts:231

Thrown or yielded when a paginated response is missing required v3 envelope fields
(`data`, `meta.pagination`, etc.). Usually means the path is not a v3 collection endpoint.

## Extends

- [`BaseError`](BaseError.md)\<\{ `data`: `unknown`; `path`: `string`; `reason`: `string`; \}\>

## Constructors

### Constructor

> **new BCPaginatedResponseError**(`path`, `data`, `reason`): `BCPaginatedResponseError`

Defined in: lib/errors.ts:234

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `path` | `string` |
| `data` | `unknown` |
| `reason` | `string` |

#### Returns

`BCPaginatedResponseError`

#### Overrides

[`BaseError`](BaseError.md).[`constructor`](BaseError.md#constructor)

## Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="code"></a> `code` | `public` | `string` | `'BC_PAGINATED_RESPONSE_ERROR'` | Machine-readable error code. Unique per subclass. | [`BaseError`](BaseError.md).[`code`](BaseError.md#code) | - | lib/errors.ts:232 |
| <a id="context"></a> `context` | `readonly` | `object` | `undefined` | - | - | [`BaseError`](BaseError.md).[`context`](BaseError.md#context) | lib/errors.ts:18 |
| `context.data` | `public` | `unknown` | `undefined` | - | - | - | lib/errors.ts:231 |
| `context.path` | `public` | `string` | `undefined` | - | - | - | lib/errors.ts:231 |
| `context.reason` | `public` | `string` | `undefined` | - | - | - | lib/errors.ts:231 |
