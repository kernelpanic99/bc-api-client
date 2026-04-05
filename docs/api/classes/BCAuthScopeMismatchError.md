[**bc-api-client**](../README.md)

***

[bc-api-client](../README.md) / BCAuthScopeMismatchError

# Class: BCAuthScopeMismatchError

Defined in: lib/errors.ts:271

Thrown by [BigCommerceAuth.requestToken](BigCommerceAuth.md#requesttoken) when the scopes granted by BigCommerce
do not include all scopes listed in `config.scopes`.
`context.missing` lists the scopes that were expected but not granted.

## Extends

- [`BaseError`](BaseError.md)\<\{ `expected`: `string`[]; `granted`: `string`[]; `missing`: `string`[]; \}\>

## Constructors

### Constructor

> **new BCAuthScopeMismatchError**(`granted`, `expected`, `missing`): `BCAuthScopeMismatchError`

Defined in: lib/errors.ts:278

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `granted` | `string`[] |
| `expected` | `string`[] |
| `missing` | `string`[] |

#### Returns

`BCAuthScopeMismatchError`

#### Overrides

[`BaseError`](BaseError.md).[`constructor`](BaseError.md#constructor)

## Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="code"></a> `code` | `public` | `string` | `'BC_AUTH_SCOPE_MISMATCH'` | Machine-readable error code. Unique per subclass. | [`BaseError`](BaseError.md).[`code`](BaseError.md#code) | - | lib/errors.ts:276 |
| <a id="context"></a> `context` | `readonly` | `object` | `undefined` | - | - | [`BaseError`](BaseError.md).[`context`](BaseError.md#context) | lib/errors.ts:19 |
| `context.expected` | `public` | `string`[] | `undefined` | - | - | - | lib/errors.ts:273 |
| `context.granted` | `public` | `string`[] | `undefined` | - | - | - | lib/errors.ts:272 |
| `context.missing` | `public` | `string`[] | `undefined` | - | - | - | lib/errors.ts:274 |
