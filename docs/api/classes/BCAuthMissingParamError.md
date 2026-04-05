[**bc-api-client**](../README.md)

***

[bc-api-client](../README.md) / BCAuthMissingParamError

# Class: BCAuthMissingParamError

Defined in: lib/errors.ts:258

Thrown by [BigCommerceAuth.requestToken](BigCommerceAuth.md#requesttoken) when a required OAuth callback param is absent.

## Extends

- [`BaseError`](BaseError.md)\<\{ `param`: `string`; \}\>

## Constructors

### Constructor

> **new BCAuthMissingParamError**(`param`): `BCAuthMissingParamError`

Defined in: lib/errors.ts:261

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `param` | `string` |

#### Returns

`BCAuthMissingParamError`

#### Overrides

[`BaseError`](BaseError.md).[`constructor`](BaseError.md#constructor)

## Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="code"></a> `code` | `public` | `string` | `'BC_AUTH_MISSING_PARAM'` | Machine-readable error code. Unique per subclass. | [`BaseError`](BaseError.md).[`code`](BaseError.md#code) | - | lib/errors.ts:259 |
| <a id="context"></a> `context` | `readonly` | `object` | `undefined` | - | - | [`BaseError`](BaseError.md).[`context`](BaseError.md#context) | lib/errors.ts:19 |
| `context.param` | `public` | `string` | `undefined` | - | - | - | lib/errors.ts:258 |
