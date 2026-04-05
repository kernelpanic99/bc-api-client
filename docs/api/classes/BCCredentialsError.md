[**bc-api-client**](../README.md)

***

[bc-api-client](../README.md) / BCCredentialsError

# Class: BCCredentialsError

Defined in: lib/errors.ts:49

Thrown by the [BigCommerceClient](BigCommerceClient.md) constructor when credentials or config are invalid.

## Extends

- [`BaseError`](BaseError.md)\<\{ `errors`: `string`[]; \}\>

## Constructors

### Constructor

> **new BCCredentialsError**(`errors`): `BCCredentialsError`

Defined in: lib/errors.ts:54

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `errors` | `string`[] |

#### Returns

`BCCredentialsError`

#### Overrides

[`BaseError`](BaseError.md).[`constructor`](BaseError.md#constructor)

## Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="code"></a> `code` | `public` | `string` | `'BC_CLIENT_CREDENTIALS_ERROR'` | Machine-readable error code. Unique per subclass. | [`BaseError`](BaseError.md).[`code`](BaseError.md#code) | - | lib/errors.ts:52 |
| <a id="context"></a> `context` | `readonly` | `object` | `undefined` | - | - | [`BaseError`](BaseError.md).[`context`](BaseError.md#context) | lib/errors.ts:19 |
| `context.errors` | `public` | `string`[] | `undefined` | - | - | - | lib/errors.ts:50 |
