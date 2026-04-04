[**bc-api-client**](../README.md)

***

[bc-api-client](../README.md) / BaseError

# Abstract Class: BaseError\<TContext\>

Defined in: lib/errors.ts:12

Abstract base class for all library errors. Carries a typed `context` object with
structured diagnostic data and a machine-readable `code` string.

Use `instanceof` checks against specific subclasses rather than this base class.

## Extends

- `Error`

## Extended by

- [`BCClientError`](BCClientError.md)
- [`BCCredentialsError`](BCCredentialsError.md)
- [`BCUrlTooLongError`](BCUrlTooLongError.md)
- [`BCRateLimitNoHeadersError`](BCRateLimitNoHeadersError.md)
- [`BCRateLimitDelayTooLongError`](BCRateLimitDelayTooLongError.md)
- [`BCSchemaValidationError`](BCSchemaValidationError.md)
- [`BCApiError`](BCApiError.md)
- [`BCTimeoutError`](BCTimeoutError.md)
- [`BCResponseParseError`](BCResponseParseError.md)
- [`BCPaginatedOptionError`](BCPaginatedOptionError.md)
- [`BCPaginatedResponseError`](BCPaginatedResponseError.md)
- [`BCAuthInvalidRedirectUriError`](BCAuthInvalidRedirectUriError.md)
- [`BCAuthMissingParamError`](BCAuthMissingParamError.md)
- [`BCAuthScopeMismatchError`](BCAuthScopeMismatchError.md)
- [`BCAuthInvalidJwtError`](BCAuthInvalidJwtError.md)

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `TContext` *extends* [`ErrorContext`](../type-aliases/ErrorContext.md) | [`ErrorContext`](../type-aliases/ErrorContext.md) |

## Constructors

### Constructor

> **new BaseError**\<`TContext`\>(`message`, `context`, `options?`): `BaseError`\<`TContext`\>

Defined in: lib/errors.ts:16

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `context` | `TContext` |
| `options?` | `ErrorOptions` |

#### Returns

`BaseError`\<`TContext`\>

#### Overrides

`Error.constructor`

## Properties

| Property | Modifier | Type | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="code"></a> `code` | `abstract` | `string` | Machine-readable error code. Unique per subclass. | lib/errors.ts:14 |
| <a id="context"></a> `context` | `readonly` | `TContext` | - | lib/errors.ts:18 |
