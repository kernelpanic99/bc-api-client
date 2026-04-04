[**bc-api-client**](../README.md)

***

[bc-api-client](../README.md) / BCClientError

# Class: BCClientError

Defined in: lib/errors.ts:39

Catch-all for unexpected client-side errors not covered by a more specific subclass.

## Extends

- [`BaseError`](BaseError.md)\<`Record`\<`string`, `string`\>\>

## Constructors

### Constructor

> **new BCClientError**(`message`, `context?`, `cause?`): `BCClientError`

Defined in: lib/errors.ts:42

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `context?` | `Record`\<`string`, `string`\> |
| `cause?` | `unknown` |

#### Returns

`BCClientError`

#### Overrides

[`BaseError`](BaseError.md).[`constructor`](BaseError.md#constructor)

## Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="code"></a> `code` | `public` | `string` | `'BC_CLIENT_ERROR'` | Machine-readable error code. Unique per subclass. | [`BaseError`](BaseError.md).[`code`](BaseError.md#code) | - | lib/errors.ts:40 |
| <a id="context"></a> `context` | `readonly` | `TContext` | `undefined` | - | - | [`BaseError`](BaseError.md).[`context`](BaseError.md#context) | lib/errors.ts:18 |
