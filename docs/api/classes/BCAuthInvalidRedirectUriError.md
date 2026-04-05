[**bc-api-client**](../README.md)

***

[bc-api-client](../README.md) / BCAuthInvalidRedirectUriError

# Class: BCAuthInvalidRedirectUriError

Defined in: lib/errors.ts:249

Thrown by [BigCommerceAuth](BigCommerceAuth.md) constructor when `config.redirectUri` is not a valid URL.

## Extends

- [`BaseError`](BaseError.md)\<\{ `redirectUri`: `string`; \}\>

## Constructors

### Constructor

> **new BCAuthInvalidRedirectUriError**(`redirectUri`, `cause`): `BCAuthInvalidRedirectUriError`

Defined in: lib/errors.ts:252

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `redirectUri` | `string` |
| `cause` | `unknown` |

#### Returns

`BCAuthInvalidRedirectUriError`

#### Overrides

[`BaseError`](BaseError.md).[`constructor`](BaseError.md#constructor)

## Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="code"></a> `code` | `public` | `string` | `'BC_AUTH_INVALID_REDIRECT_URI'` | Machine-readable error code. Unique per subclass. | [`BaseError`](BaseError.md).[`code`](BaseError.md#code) | - | lib/errors.ts:250 |
| <a id="context"></a> `context` | `readonly` | `object` | `undefined` | - | - | [`BaseError`](BaseError.md).[`context`](BaseError.md#context) | lib/errors.ts:19 |
| `context.redirectUri` | `public` | `string` | `undefined` | - | - | - | lib/errors.ts:249 |
