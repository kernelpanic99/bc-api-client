[**bc-api-client**](../README.md)

***

[bc-api-client](../README.md) / BCPaginatedItemValidationError

# Class: BCPaginatedItemValidationError

Defined in: lib/errors.ts:146

Thrown or yielded when `options.itemSchema` validation fails for an item in a page response.

## Extends

- [`BCSchemaValidationError`](BCSchemaValidationError.md)

## Constructors

### Constructor

> **new BCPaginatedItemValidationError**(`message`, `method`, `path`, `data`, `error`): `BCPaginatedItemValidationError`

Defined in: lib/errors.ts:125

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `method` | `string` |
| `path` | `string` |
| `data` | `unknown` |
| `error` | `FailureResult` |

#### Returns

`BCPaginatedItemValidationError`

#### Inherited from

[`BCSchemaValidationError`](BCSchemaValidationError.md).[`constructor`](BCSchemaValidationError.md#constructor)

## Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="code"></a> `code` | `public` | `string` | `'BC_PAGINATED_ITEM_VALIDATION_FAILED'` | Machine-readable error code. Unique per subclass. | [`BCSchemaValidationError`](BCSchemaValidationError.md).[`code`](BCSchemaValidationError.md#code) | - | lib/errors.ts:147 |
| <a id="context"></a> `context` | `readonly` | `object` | `undefined` | - | - | [`BCSchemaValidationError`](BCSchemaValidationError.md).[`context`](BCSchemaValidationError.md#context) | lib/errors.ts:18 |
| `context.data` | `public` | `unknown` | `undefined` | - | - | - | lib/errors.ts:122 |
| `context.error` | `public` | `FailureResult` | `undefined` | - | - | - | lib/errors.ts:123 |
| `context.method` | `public` | `string` | `undefined` | - | - | - | lib/errors.ts:120 |
| `context.path` | `public` | `string` | `undefined` | - | - | - | lib/errors.ts:121 |
