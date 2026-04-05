[**bc-api-client**](../README.md)

***

[bc-api-client](../README.md) / BCSchemaValidationError

# Abstract Class: BCSchemaValidationError

Defined in: lib/errors.ts:120

Abstract base for all StandardSchema validation errors. Carries the raw `data` that failed
validation and the schema `error` result. Use specific subclasses for `instanceof` checks.

## Extends

- [`BaseError`](BaseError.md)\<\{ `data`: `unknown`; `error`: [`FailureResult`](../bc-api-client/namespaces/StandardSchemaV1/interfaces/FailureResult.md); `method`: `string`; `path`: `string`; \}\>

## Extended by

- [`BCQueryValidationError`](BCQueryValidationError.md)
- [`BCRequestBodyValidationError`](BCRequestBodyValidationError.md)
- [`BCResponseValidationError`](BCResponseValidationError.md)
- [`BCPaginatedItemValidationError`](BCPaginatedItemValidationError.md)

## Constructors

### Constructor

> **new BCSchemaValidationError**(`message`, `method`, `path`, `data`, `error`): `BCSchemaValidationError`

Defined in: lib/errors.ts:126

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `method` | `string` |
| `path` | `string` |
| `data` | `unknown` |
| `error` | [`FailureResult`](../bc-api-client/namespaces/StandardSchemaV1/interfaces/FailureResult.md) |

#### Returns

`BCSchemaValidationError`

#### Overrides

[`BaseError`](BaseError.md).[`constructor`](BaseError.md#constructor)

## Properties

| Property | Modifier | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="code"></a> `code` | `abstract` | `string` | Machine-readable error code. Unique per subclass. | [`BaseError`](BaseError.md).[`code`](BaseError.md#code) | lib/errors.ts:15 |
| <a id="context"></a> `context` | `readonly` | `object` | - | [`BaseError`](BaseError.md).[`context`](BaseError.md#context) | lib/errors.ts:19 |
| `context.data` | `public` | `unknown` | - | - | lib/errors.ts:123 |
| `context.error` | `public` | [`FailureResult`](../bc-api-client/namespaces/StandardSchemaV1/interfaces/FailureResult.md) | - | - | lib/errors.ts:124 |
| `context.method` | `public` | `string` | - | - | lib/errors.ts:121 |
| `context.path` | `public` | `string` | - | - | lib/errors.ts:122 |
