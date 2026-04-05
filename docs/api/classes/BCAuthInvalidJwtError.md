[**bc-api-client**](../README.md)

***

[bc-api-client](../README.md) / BCAuthInvalidJwtError

# Class: BCAuthInvalidJwtError

Defined in: lib/errors.ts:284

Thrown by [BigCommerceAuth.verify](BigCommerceAuth.md#verify) when the JWT signature, audience, issuer, or subject is invalid.

## Extends

- [`BaseError`](BaseError.md)\<\{ `storeHash`: `string`; \}\>

## Constructors

### Constructor

> **new BCAuthInvalidJwtError**(`storeHash`, `cause`): `BCAuthInvalidJwtError`

Defined in: lib/errors.ts:287

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `storeHash` | `string` |
| `cause` | `unknown` |

#### Returns

`BCAuthInvalidJwtError`

#### Overrides

[`BaseError`](BaseError.md).[`constructor`](BaseError.md#constructor)

## Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="code"></a> `code` | `public` | `string` | `'BC_AUTH_INVALID_JWT'` | Machine-readable error code. Unique per subclass. | [`BaseError`](BaseError.md).[`code`](BaseError.md#code) | - | lib/errors.ts:285 |
| <a id="context"></a> `context` | `readonly` | `object` | `undefined` | - | - | [`BaseError`](BaseError.md).[`context`](BaseError.md#context) | lib/errors.ts:19 |
| `context.storeHash` | `public` | `string` | `undefined` | - | - | - | lib/errors.ts:284 |
