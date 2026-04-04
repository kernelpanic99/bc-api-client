[**bc-api-client**](../README.md)

***

[bc-api-client](../README.md) / BCQueryValidationError

# Class: BCQueryValidationError

Defined in: lib/errors.ts:131

Thrown when `options.querySchema` validation fails before a request is sent.

## Extends

- [`BCSchemaValidationError`](BCSchemaValidationError.md)

## Constructors

### Constructor

> **new BCQueryValidationError**(`message`, `method`, `path`, `data`, `error`): `BCQueryValidationError`

Defined in: lib/errors.ts:125

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `method` | `string` |
| `path` | `string` |
| `data` | `unknown` |
| `error` | [`FailureResult`](../bc-api-client/namespaces/StandardSchemaV1/interfaces/FailureResult.md) |

#### Returns

`BCQueryValidationError`

#### Inherited from

[`BCSchemaValidationError`](BCSchemaValidationError.md).[`constructor`](BCSchemaValidationError.md#constructor)

## Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="code"></a> `code` | `public` | `string` | `'BC_QUERY_VALIDATION_FAILED'` | Machine-readable error code. Unique per subclass. | [`BCSchemaValidationError`](BCSchemaValidationError.md).[`code`](BCSchemaValidationError.md#code) | - | lib/errors.ts:132 |
| <a id="context"></a> `context` | `readonly` | `object` | `undefined` | - | - | [`BCSchemaValidationError`](BCSchemaValidationError.md).[`context`](BCSchemaValidationError.md#context) | lib/errors.ts:18 |
| `context.data` | `public` | `unknown` | `undefined` | - | - | - | lib/errors.ts:122 |
| `context.error` | `public` | [`FailureResult`](../bc-api-client/namespaces/StandardSchemaV1/interfaces/FailureResult.md) | `undefined` | - | - | - | lib/errors.ts:123 |
| `context.method` | `public` | `string` | `undefined` | - | - | - | lib/errors.ts:120 |
| `context.path` | `public` | `string` | `undefined` | - | - | - | lib/errors.ts:121 |
