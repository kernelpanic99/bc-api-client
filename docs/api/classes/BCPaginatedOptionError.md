[**bc-api-client**](../README.md)

***

[bc-api-client](../README.md) / BCPaginatedOptionError

# Class: BCPaginatedOptionError

Defined in: lib/errors.ts:219

Thrown when a pagination option (`limit`, `page`, or `count`) is not a positive number.
`context.option` names the offending field; `context.value` is the value that was passed.

## Extends

- [`BaseError`](BaseError.md)\<\{ `option`: `string`; `path`: `string`; `value`: `unknown`; \}\>

## Constructors

### Constructor

> **new BCPaginatedOptionError**(`path`, `value`, `option`): `BCPaginatedOptionError`

Defined in: lib/errors.ts:222

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `path` | `string` |
| `value` | `unknown` |
| `option` | `string` |

#### Returns

`BCPaginatedOptionError`

#### Overrides

[`BaseError`](BaseError.md).[`constructor`](BaseError.md#constructor)

## Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="code"></a> `code` | `public` | `string` | `'BC_PAGINATED_OPTION_ERROR'` | Machine-readable error code. Unique per subclass. | [`BaseError`](BaseError.md).[`code`](BaseError.md#code) | - | lib/errors.ts:220 |
| <a id="context"></a> `context` | `readonly` | `object` | `undefined` | - | - | [`BaseError`](BaseError.md).[`context`](BaseError.md#context) | lib/errors.ts:18 |
| `context.option` | `public` | `string` | `undefined` | - | - | - | lib/errors.ts:219 |
| `context.path` | `public` | `string` | `undefined` | - | - | - | lib/errors.ts:219 |
| `context.value` | `public` | `unknown` | `undefined` | - | - | - | lib/errors.ts:219 |
