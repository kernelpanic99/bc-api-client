[**bc-api-client**](../README.md)

***

[bc-api-client](../README.md) / BCResponseValidationError

# Class: BCResponseValidationError

Defined in: lib/errors.ts:142

Thrown when `options.responseSchema` validation fails after a response is received.

## Extends

- [`BCSchemaValidationError`](BCSchemaValidationError.md)

## Constructors

### Constructor

> **new BCResponseValidationError**(`message`, `method`, `path`, `data`, `error`): `BCResponseValidationError`

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

`BCResponseValidationError`

#### Inherited from

[`BCSchemaValidationError`](BCSchemaValidationError.md).[`constructor`](BCSchemaValidationError.md#constructor)

## Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="code"></a> `code` | `public` | `string` | `'BC_RESPONSE_VALIDATION_FAILED'` | Machine-readable error code. Unique per subclass. | [`BCSchemaValidationError`](BCSchemaValidationError.md).[`code`](BCSchemaValidationError.md#code) | - | lib/errors.ts:143 |
| <a id="context"></a> `context` | `readonly` | `object` | `undefined` | - | - | [`BCSchemaValidationError`](BCSchemaValidationError.md).[`context`](BCSchemaValidationError.md#context) | lib/errors.ts:19 |
| `context.data` | `public` | `unknown` | `undefined` | - | - | - | lib/errors.ts:123 |
| `context.error` | `public` | [`FailureResult`](../bc-api-client/namespaces/StandardSchemaV1/interfaces/FailureResult.md) | `undefined` | - | - | - | lib/errors.ts:124 |
| `context.method` | `public` | `string` | `undefined` | - | - | - | lib/errors.ts:121 |
| `context.path` | `public` | `string` | `undefined` | - | - | - | lib/errors.ts:122 |
