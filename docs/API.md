**bc-api-client**

***

# bc-api-client

## `abstract` BaseError

Defined in: [lib/errors.ts:12](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L12)

Abstract base class for all library errors. Carries a typed `context` object with
structured diagnostic data and a machine-readable `code` string.

Use `instanceof` checks against specific subclasses rather than this base class.

### Extends

- `Error`

### Extended by

- [`BCClientError`](#bcclienterror)
- [`BCCredentialsError`](#bccredentialserror)
- [`BCUrlTooLongError`](#bcurltoolongerror)
- [`BCRateLimitNoHeadersError`](#bcratelimitnoheaderserror)
- [`BCRateLimitDelayTooLongError`](#bcratelimitdelaytoolongerror)
- [`BCSchemaValidationError`](#abstract-bcschemavalidationerror)
- [`BCApiError`](#bcapierror)
- [`BCTimeoutError`](#bctimeouterror)
- [`BCResponseParseError`](#bcresponseparseerror)
- [`BCPaginatedOptionError`](#bcpaginatedoptionerror)
- [`BCPaginatedResponseError`](#bcpaginatedresponseerror)
- [`BCAuthInvalidRedirectUriError`](#bcauthinvalidredirecturierror)
- [`BCAuthMissingParamError`](#bcauthmissingparamerror)
- [`BCAuthScopeMismatchError`](#bcauthscopemismatcherror)
- [`BCAuthInvalidJwtError`](#bcauthinvalidjwterror)

### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `TContext` *extends* [`ErrorContext`](#errorcontext) | [`ErrorContext`](#errorcontext) |

### Constructors

#### Constructor

> **new BaseError**\<`TContext`\>(`message`, `context`, `options?`): [`BaseError`](#abstract-baseerror)\<`TContext`\>

Defined in: [lib/errors.ts:16](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L16)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `context` | `TContext` |
| `options?` | `ErrorOptions` |

##### Returns

[`BaseError`](#abstract-baseerror)\<`TContext`\>

##### Overrides

`Error.constructor`

### Properties

| Property | Modifier | Type | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="code"></a> `code` | `abstract` | `string` | Machine-readable error code. Unique per subclass. | [lib/errors.ts:14](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L14) |
| <a id="context"></a> `context` | `readonly` | `TContext` | - | [lib/errors.ts:18](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L18) |

***

## BCApiError

Defined in: [lib/errors.ts:154](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L154)

Thrown when the BigCommerce API returns a non-2xx HTTP response.
`context.status` and `context.responseBody` are the most useful fields for debugging.

### Extends

- [`BaseError`](#abstract-baseerror)\<\{ `headers`: `Record`\<`string`, `string`\>; `method`: `string`; `requestBody`: `string`; `responseBody`: `string`; `status`: `number`; `statusMessage`: `string`; `url`: `string`; \}\>

### Constructors

#### Constructor

> **new BCApiError**(`err`, `requestBody`, `responseBody`): [`BCApiError`](#bcapierror)

Defined in: [lib/errors.ts:165](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L165)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `err` | `HTTPError` |
| `requestBody` | `string` |
| `responseBody` | `string` |

##### Returns

[`BCApiError`](#bcapierror)

##### Overrides

[`BaseError`](#abstract-baseerror).[`constructor`](#constructor)

### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="code-1"></a> `code` | `public` | `string` | `'BC_API_ERROR'` | Machine-readable error code. Unique per subclass. | [`BaseError`](#abstract-baseerror).[`code`](#code) | - | [lib/errors.ts:163](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L163) |
| <a id="context-1"></a> `context` | `readonly` | `object` | `undefined` | - | - | [`BaseError`](#abstract-baseerror).[`context`](#context) | [lib/errors.ts:18](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L18) |
| `context.headers` | `public` | `Record`\<`string`, `string`\> | `undefined` | - | - | - | [lib/errors.ts:159](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L159) |
| `context.method` | `public` | `string` | `undefined` | - | - | - | [lib/errors.ts:155](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L155) |
| `context.requestBody` | `public` | `string` | `undefined` | - | - | - | [lib/errors.ts:160](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L160) |
| `context.responseBody` | `public` | `string` | `undefined` | - | - | - | [lib/errors.ts:161](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L161) |
| `context.status` | `public` | `number` | `undefined` | - | - | - | [lib/errors.ts:157](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L157) |
| `context.statusMessage` | `public` | `string` | `undefined` | - | - | - | [lib/errors.ts:158](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L158) |
| `context.url` | `public` | `string` | `undefined` | - | - | - | [lib/errors.ts:156](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L156) |

***

## BCAuthInvalidJwtError

Defined in: [lib/errors.ts:275](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L275)

Thrown by [BigCommerceAuth.verify](#verify) when the JWT signature, audience, issuer, or subject is invalid.

### Extends

- [`BaseError`](#abstract-baseerror)\<\{ `storeHash`: `string`; \}\>

### Constructors

#### Constructor

> **new BCAuthInvalidJwtError**(`storeHash`, `cause`): [`BCAuthInvalidJwtError`](#bcauthinvalidjwterror)

Defined in: [lib/errors.ts:278](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L278)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `storeHash` | `string` |
| `cause` | `unknown` |

##### Returns

[`BCAuthInvalidJwtError`](#bcauthinvalidjwterror)

##### Overrides

[`BaseError`](#abstract-baseerror).[`constructor`](#constructor)

### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="code-2"></a> `code` | `public` | `string` | `'BC_AUTH_INVALID_JWT'` | Machine-readable error code. Unique per subclass. | [`BaseError`](#abstract-baseerror).[`code`](#code) | - | [lib/errors.ts:276](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L276) |
| <a id="context-2"></a> `context` | `readonly` | `object` | `undefined` | - | - | [`BaseError`](#abstract-baseerror).[`context`](#context) | [lib/errors.ts:18](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L18) |
| `context.storeHash` | `public` | `string` | `undefined` | - | - | - | [lib/errors.ts:275](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L275) |

***

## BCAuthInvalidRedirectUriError

Defined in: [lib/errors.ts:240](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L240)

Thrown by [BigCommerceAuth](#bigcommerceauth) constructor when `config.redirectUri` is not a valid URL.

### Extends

- [`BaseError`](#abstract-baseerror)\<\{ `redirectUri`: `string`; \}\>

### Constructors

#### Constructor

> **new BCAuthInvalidRedirectUriError**(`redirectUri`, `cause`): [`BCAuthInvalidRedirectUriError`](#bcauthinvalidredirecturierror)

Defined in: [lib/errors.ts:243](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L243)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `redirectUri` | `string` |
| `cause` | `unknown` |

##### Returns

[`BCAuthInvalidRedirectUriError`](#bcauthinvalidredirecturierror)

##### Overrides

[`BaseError`](#abstract-baseerror).[`constructor`](#constructor)

### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="code-3"></a> `code` | `public` | `string` | `'BC_AUTH_INVALID_REDIRECT_URI'` | Machine-readable error code. Unique per subclass. | [`BaseError`](#abstract-baseerror).[`code`](#code) | - | [lib/errors.ts:241](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L241) |
| <a id="context-3"></a> `context` | `readonly` | `object` | `undefined` | - | - | [`BaseError`](#abstract-baseerror).[`context`](#context) | [lib/errors.ts:18](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L18) |
| `context.redirectUri` | `public` | `string` | `undefined` | - | - | - | [lib/errors.ts:240](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L240) |

***

## BCAuthMissingParamError

Defined in: [lib/errors.ts:249](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L249)

Thrown by [BigCommerceAuth.requestToken](#requesttoken) when a required OAuth callback param is absent.

### Extends

- [`BaseError`](#abstract-baseerror)\<\{ `param`: `string`; \}\>

### Constructors

#### Constructor

> **new BCAuthMissingParamError**(`param`): [`BCAuthMissingParamError`](#bcauthmissingparamerror)

Defined in: [lib/errors.ts:252](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L252)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `param` | `string` |

##### Returns

[`BCAuthMissingParamError`](#bcauthmissingparamerror)

##### Overrides

[`BaseError`](#abstract-baseerror).[`constructor`](#constructor)

### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="code-4"></a> `code` | `public` | `string` | `'BC_AUTH_MISSING_PARAM'` | Machine-readable error code. Unique per subclass. | [`BaseError`](#abstract-baseerror).[`code`](#code) | - | [lib/errors.ts:250](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L250) |
| <a id="context-4"></a> `context` | `readonly` | `object` | `undefined` | - | - | [`BaseError`](#abstract-baseerror).[`context`](#context) | [lib/errors.ts:18](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L18) |
| `context.param` | `public` | `string` | `undefined` | - | - | - | [lib/errors.ts:249](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L249) |

***

## BCAuthScopeMismatchError

Defined in: [lib/errors.ts:262](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L262)

Thrown by [BigCommerceAuth.requestToken](#requesttoken) when the scopes granted by BigCommerce
do not include all scopes listed in `config.scopes`.
`context.missing` lists the scopes that were expected but not granted.

### Extends

- [`BaseError`](#abstract-baseerror)\<\{ `expected`: `string`[]; `granted`: `string`[]; `missing`: `string`[]; \}\>

### Constructors

#### Constructor

> **new BCAuthScopeMismatchError**(`granted`, `expected`, `missing`): [`BCAuthScopeMismatchError`](#bcauthscopemismatcherror)

Defined in: [lib/errors.ts:269](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L269)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `granted` | `string`[] |
| `expected` | `string`[] |
| `missing` | `string`[] |

##### Returns

[`BCAuthScopeMismatchError`](#bcauthscopemismatcherror)

##### Overrides

[`BaseError`](#abstract-baseerror).[`constructor`](#constructor)

### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="code-5"></a> `code` | `public` | `string` | `'BC_AUTH_SCOPE_MISMATCH'` | Machine-readable error code. Unique per subclass. | [`BaseError`](#abstract-baseerror).[`code`](#code) | - | [lib/errors.ts:267](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L267) |
| <a id="context-5"></a> `context` | `readonly` | `object` | `undefined` | - | - | [`BaseError`](#abstract-baseerror).[`context`](#context) | [lib/errors.ts:18](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L18) |
| `context.expected` | `public` | `string`[] | `undefined` | - | - | - | [lib/errors.ts:264](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L264) |
| `context.granted` | `public` | `string`[] | `undefined` | - | - | - | [lib/errors.ts:263](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L263) |
| `context.missing` | `public` | `string`[] | `undefined` | - | - | - | [lib/errors.ts:265](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L265) |

***

## BCClientError

Defined in: [lib/errors.ts:39](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L39)

Catch-all for unexpected client-side errors not covered by a more specific subclass.

### Extends

- [`BaseError`](#abstract-baseerror)\<`Record`\<`string`, `string`\>\>

### Constructors

#### Constructor

> **new BCClientError**(`message`, `context?`, `cause?`): [`BCClientError`](#bcclienterror)

Defined in: [lib/errors.ts:42](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L42)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `context?` | `Record`\<`string`, `string`\> |
| `cause?` | `unknown` |

##### Returns

[`BCClientError`](#bcclienterror)

##### Overrides

[`BaseError`](#abstract-baseerror).[`constructor`](#constructor)

### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="code-6"></a> `code` | `public` | `string` | `'BC_CLIENT_ERROR'` | Machine-readable error code. Unique per subclass. | [`BaseError`](#abstract-baseerror).[`code`](#code) | - | [lib/errors.ts:40](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L40) |
| <a id="context-6"></a> `context` | `readonly` | `TContext` | `undefined` | - | - | [`BaseError`](#abstract-baseerror).[`context`](#context) | [lib/errors.ts:18](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L18) |

***

## BCCredentialsError

Defined in: [lib/errors.ts:48](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L48)

Thrown by the [BigCommerceClient](#bigcommerceclient) constructor when credentials or config are invalid.

### Extends

- [`BaseError`](#abstract-baseerror)\<\{ `errors`: `string`[]; \}\>

### Constructors

#### Constructor

> **new BCCredentialsError**(`errors`): [`BCCredentialsError`](#bccredentialserror)

Defined in: [lib/errors.ts:53](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L53)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `errors` | `string`[] |

##### Returns

[`BCCredentialsError`](#bccredentialserror)

##### Overrides

[`BaseError`](#abstract-baseerror).[`constructor`](#constructor)

### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="code-7"></a> `code` | `public` | `string` | `'BC_CLIENT_CREDENTIALS_ERROR'` | Machine-readable error code. Unique per subclass. | [`BaseError`](#abstract-baseerror).[`code`](#code) | - | [lib/errors.ts:51](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L51) |
| <a id="context-7"></a> `context` | `readonly` | `object` | `undefined` | - | - | [`BaseError`](#abstract-baseerror).[`context`](#context) | [lib/errors.ts:18](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L18) |
| `context.errors` | `public` | `string`[] | `undefined` | - | - | - | [lib/errors.ts:49](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L49) |

***

## BCPaginatedItemValidationError

Defined in: [lib/errors.ts:146](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L146)

Thrown or yielded when `options.itemSchema` validation fails for an item in a page response.

### Extends

- [`BCSchemaValidationError`](#abstract-bcschemavalidationerror)

### Constructors

#### Constructor

> **new BCPaginatedItemValidationError**(`message`, `method`, `path`, `data`, `error`): [`BCPaginatedItemValidationError`](#bcpaginateditemvalidationerror)

Defined in: [lib/errors.ts:125](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L125)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `method` | `string` |
| `path` | `string` |
| `data` | `unknown` |
| `error` | `FailureResult` |

##### Returns

[`BCPaginatedItemValidationError`](#bcpaginateditemvalidationerror)

##### Inherited from

[`BCSchemaValidationError`](#abstract-bcschemavalidationerror).[`constructor`](#constructor-17)

### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="code-8"></a> `code` | `public` | `string` | `'BC_PAGINATED_ITEM_VALIDATION_FAILED'` | Machine-readable error code. Unique per subclass. | [`BCSchemaValidationError`](#abstract-bcschemavalidationerror).[`code`](#code-17) | - | [lib/errors.ts:147](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L147) |
| <a id="context-8"></a> `context` | `readonly` | `object` | `undefined` | - | - | [`BCSchemaValidationError`](#abstract-bcschemavalidationerror).[`context`](#context-17) | [lib/errors.ts:18](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L18) |
| `context.data` | `public` | `unknown` | `undefined` | - | - | - | [lib/errors.ts:122](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L122) |
| `context.error` | `public` | `FailureResult` | `undefined` | - | - | - | [lib/errors.ts:123](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L123) |
| `context.method` | `public` | `string` | `undefined` | - | - | - | [lib/errors.ts:120](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L120) |
| `context.path` | `public` | `string` | `undefined` | - | - | - | [lib/errors.ts:121](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L121) |

***

## BCPaginatedOptionError

Defined in: [lib/errors.ts:219](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L219)

Thrown when a pagination option (`limit`, `page`, or `count`) is not a positive number.
`context.option` names the offending field; `context.value` is the value that was passed.

### Extends

- [`BaseError`](#abstract-baseerror)\<\{ `option`: `string`; `path`: `string`; `value`: `unknown`; \}\>

### Constructors

#### Constructor

> **new BCPaginatedOptionError**(`path`, `value`, `option`): [`BCPaginatedOptionError`](#bcpaginatedoptionerror)

Defined in: [lib/errors.ts:222](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L222)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `path` | `string` |
| `value` | `unknown` |
| `option` | `string` |

##### Returns

[`BCPaginatedOptionError`](#bcpaginatedoptionerror)

##### Overrides

[`BaseError`](#abstract-baseerror).[`constructor`](#constructor)

### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="code-9"></a> `code` | `public` | `string` | `'BC_PAGINATED_OPTION_ERROR'` | Machine-readable error code. Unique per subclass. | [`BaseError`](#abstract-baseerror).[`code`](#code) | - | [lib/errors.ts:220](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L220) |
| <a id="context-9"></a> `context` | `readonly` | `object` | `undefined` | - | - | [`BaseError`](#abstract-baseerror).[`context`](#context) | [lib/errors.ts:18](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L18) |
| `context.option` | `public` | `string` | `undefined` | - | - | - | [lib/errors.ts:219](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L219) |
| `context.path` | `public` | `string` | `undefined` | - | - | - | [lib/errors.ts:219](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L219) |
| `context.value` | `public` | `unknown` | `undefined` | - | - | - | [lib/errors.ts:219](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L219) |

***

## BCPaginatedResponseError

Defined in: [lib/errors.ts:231](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L231)

Thrown or yielded when a paginated response is missing required v3 envelope fields
(`data`, `meta.pagination`, etc.). Usually means the path is not a v3 collection endpoint.

### Extends

- [`BaseError`](#abstract-baseerror)\<\{ `data`: `unknown`; `path`: `string`; `reason`: `string`; \}\>

### Constructors

#### Constructor

> **new BCPaginatedResponseError**(`path`, `data`, `reason`): [`BCPaginatedResponseError`](#bcpaginatedresponseerror)

Defined in: [lib/errors.ts:234](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L234)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `path` | `string` |
| `data` | `unknown` |
| `reason` | `string` |

##### Returns

[`BCPaginatedResponseError`](#bcpaginatedresponseerror)

##### Overrides

[`BaseError`](#abstract-baseerror).[`constructor`](#constructor)

### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="code-10"></a> `code` | `public` | `string` | `'BC_PAGINATED_RESPONSE_ERROR'` | Machine-readable error code. Unique per subclass. | [`BaseError`](#abstract-baseerror).[`code`](#code) | - | [lib/errors.ts:232](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L232) |
| <a id="context-10"></a> `context` | `readonly` | `object` | `undefined` | - | - | [`BaseError`](#abstract-baseerror).[`context`](#context) | [lib/errors.ts:18](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L18) |
| `context.data` | `public` | `unknown` | `undefined` | - | - | - | [lib/errors.ts:231](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L231) |
| `context.path` | `public` | `string` | `undefined` | - | - | - | [lib/errors.ts:231](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L231) |
| `context.reason` | `public` | `string` | `undefined` | - | - | - | [lib/errors.ts:231](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L231) |

***

## BCQueryValidationError

Defined in: [lib/errors.ts:131](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L131)

Thrown when `options.querySchema` validation fails before a request is sent.

### Extends

- [`BCSchemaValidationError`](#abstract-bcschemavalidationerror)

### Constructors

#### Constructor

> **new BCQueryValidationError**(`message`, `method`, `path`, `data`, `error`): [`BCQueryValidationError`](#bcqueryvalidationerror)

Defined in: [lib/errors.ts:125](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L125)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `method` | `string` |
| `path` | `string` |
| `data` | `unknown` |
| `error` | `FailureResult` |

##### Returns

[`BCQueryValidationError`](#bcqueryvalidationerror)

##### Inherited from

[`BCSchemaValidationError`](#abstract-bcschemavalidationerror).[`constructor`](#constructor-17)

### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="code-11"></a> `code` | `public` | `string` | `'BC_QUERY_VALIDATION_FAILED'` | Machine-readable error code. Unique per subclass. | [`BCSchemaValidationError`](#abstract-bcschemavalidationerror).[`code`](#code-17) | - | [lib/errors.ts:132](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L132) |
| <a id="context-11"></a> `context` | `readonly` | `object` | `undefined` | - | - | [`BCSchemaValidationError`](#abstract-bcschemavalidationerror).[`context`](#context-17) | [lib/errors.ts:18](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L18) |
| `context.data` | `public` | `unknown` | `undefined` | - | - | - | [lib/errors.ts:122](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L122) |
| `context.error` | `public` | `FailureResult` | `undefined` | - | - | - | [lib/errors.ts:123](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L123) |
| `context.method` | `public` | `string` | `undefined` | - | - | - | [lib/errors.ts:120](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L120) |
| `context.path` | `public` | `string` | `undefined` | - | - | - | [lib/errors.ts:121](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L121) |

***

## BCRateLimitDelayTooLongError

Defined in: [lib/errors.ts:95](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L95)

Thrown during retry when a 429 response specifies a reset window that exceeds
`config.retry.maxRetryAfter`, preventing an unbounded wait.

### Extends

- [`BaseError`](#abstract-baseerror)\<\{ `attempts`: `number`; `delay`: `number`; `maxDelay`: `number`; `method`: `string`; `url`: `string`; \}\>

### Constructors

#### Constructor

> **new BCRateLimitDelayTooLongError**(`request`, `attempts`, `maxDelay`, `delay`): [`BCRateLimitDelayTooLongError`](#bcratelimitdelaytoolongerror)

Defined in: [lib/errors.ts:104](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L104)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `request` | `KyRequest` |
| `attempts` | `number` |
| `maxDelay` | `number` |
| `delay` | `number` |

##### Returns

[`BCRateLimitDelayTooLongError`](#bcratelimitdelaytoolongerror)

##### Overrides

[`BaseError`](#abstract-baseerror).[`constructor`](#constructor)

### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="code-12"></a> `code` | `public` | `string` | `'BC_RATE_LIMIT_DELAY_TOO_LONG'` | Machine-readable error code. Unique per subclass. | [`BaseError`](#abstract-baseerror).[`code`](#code) | - | [lib/errors.ts:102](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L102) |
| <a id="context-12"></a> `context` | `readonly` | `object` | `undefined` | - | - | [`BaseError`](#abstract-baseerror).[`context`](#context) | [lib/errors.ts:18](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L18) |
| `context.attempts` | `public` | `number` | `undefined` | - | - | - | [lib/errors.ts:98](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L98) |
| `context.delay` | `public` | `number` | `undefined` | - | - | - | [lib/errors.ts:100](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L100) |
| `context.maxDelay` | `public` | `number` | `undefined` | - | - | - | [lib/errors.ts:99](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L99) |
| `context.method` | `public` | `string` | `undefined` | - | - | - | [lib/errors.ts:97](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L97) |
| `context.url` | `public` | `string` | `undefined` | - | - | - | [lib/errors.ts:96](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L96) |

***

## BCRateLimitNoHeadersError

Defined in: [lib/errors.ts:75](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L75)

Thrown during retry when a 429 response is received but the expected
`X-Rate-Limit-*` headers are absent, making it impossible to determine the backoff delay.

### Extends

- [`BaseError`](#abstract-baseerror)\<\{ `attempts`: `number`; `method`: `string`; `url`: `string`; \}\>

### Constructors

#### Constructor

> **new BCRateLimitNoHeadersError**(`request`, `attempts`): [`BCRateLimitNoHeadersError`](#bcratelimitnoheaderserror)

Defined in: [lib/errors.ts:82](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L82)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `request` | `KyRequest` |
| `attempts` | `number` |

##### Returns

[`BCRateLimitNoHeadersError`](#bcratelimitnoheaderserror)

##### Overrides

[`BaseError`](#abstract-baseerror).[`constructor`](#constructor)

### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="code-13"></a> `code` | `public` | `string` | `'BC_RATE_LIMIT_NO_HEADERS'` | Machine-readable error code. Unique per subclass. | [`BaseError`](#abstract-baseerror).[`code`](#code) | - | [lib/errors.ts:80](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L80) |
| <a id="context-13"></a> `context` | `readonly` | `object` | `undefined` | - | - | [`BaseError`](#abstract-baseerror).[`context`](#context) | [lib/errors.ts:18](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L18) |
| `context.attempts` | `public` | `number` | `undefined` | - | - | - | [lib/errors.ts:78](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L78) |
| `context.method` | `public` | `string` | `undefined` | - | - | - | [lib/errors.ts:77](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L77) |
| `context.url` | `public` | `string` | `undefined` | - | - | - | [lib/errors.ts:76](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L76) |

***

## BCRequestBodyValidationError

Defined in: [lib/errors.ts:136](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L136)

Thrown when `options.bodySchema` validation fails before a request is sent.

### Extends

- [`BCSchemaValidationError`](#abstract-bcschemavalidationerror)

### Constructors

#### Constructor

> **new BCRequestBodyValidationError**(`message`, `method`, `path`, `data`, `error`): [`BCRequestBodyValidationError`](#bcrequestbodyvalidationerror)

Defined in: [lib/errors.ts:125](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L125)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `method` | `string` |
| `path` | `string` |
| `data` | `unknown` |
| `error` | `FailureResult` |

##### Returns

[`BCRequestBodyValidationError`](#bcrequestbodyvalidationerror)

##### Inherited from

[`BCSchemaValidationError`](#abstract-bcschemavalidationerror).[`constructor`](#constructor-17)

### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="code-14"></a> `code` | `public` | `string` | `'BC_REQUEST_BODY_VALIDATION_FAILED'` | Machine-readable error code. Unique per subclass. | [`BCSchemaValidationError`](#abstract-bcschemavalidationerror).[`code`](#code-17) | - | [lib/errors.ts:137](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L137) |
| <a id="context-14"></a> `context` | `readonly` | `object` | `undefined` | - | - | [`BCSchemaValidationError`](#abstract-bcschemavalidationerror).[`context`](#context-17) | [lib/errors.ts:18](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L18) |
| `context.data` | `public` | `unknown` | `undefined` | - | - | - | [lib/errors.ts:122](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L122) |
| `context.error` | `public` | `FailureResult` | `undefined` | - | - | - | [lib/errors.ts:123](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L123) |
| `context.method` | `public` | `string` | `undefined` | - | - | - | [lib/errors.ts:120](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L120) |
| `context.path` | `public` | `string` | `undefined` | - | - | - | [lib/errors.ts:121](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L121) |

***

## BCResponseParseError

Defined in: [lib/errors.ts:199](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L199)

Thrown when the response body cannot be read or parsed as JSON.
`context.rawBody` contains the raw text that failed to parse (empty string if the body was empty).

### Extends

- [`BaseError`](#abstract-baseerror)\<\{ `method`: `string`; `path`: `string`; `rawBody?`: `string`; \}\>

### Constructors

#### Constructor

> **new BCResponseParseError**(`method`, `path`, `cause`, `rawBody?`): [`BCResponseParseError`](#bcresponseparseerror)

Defined in: [lib/errors.ts:202](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L202)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `method` | `string` |
| `path` | `string` |
| `cause` | `unknown` |
| `rawBody?` | `string` |

##### Returns

[`BCResponseParseError`](#bcresponseparseerror)

##### Overrides

[`BaseError`](#abstract-baseerror).[`constructor`](#constructor)

### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="code-15"></a> `code` | `public` | `string` | `'BC_RESPONSE_PARSE_ERROR'` | Machine-readable error code. Unique per subclass. | [`BaseError`](#abstract-baseerror).[`code`](#code) | - | [lib/errors.ts:200](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L200) |
| <a id="context-15"></a> `context` | `readonly` | `object` | `undefined` | - | - | [`BaseError`](#abstract-baseerror).[`context`](#context) | [lib/errors.ts:18](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L18) |
| `context.method` | `public` | `string` | `undefined` | - | - | - | [lib/errors.ts:199](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L199) |
| `context.path` | `public` | `string` | `undefined` | - | - | - | [lib/errors.ts:199](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L199) |
| `context.rawBody?` | `public` | `string` | `undefined` | - | - | - | [lib/errors.ts:199](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L199) |

***

## BCResponseValidationError

Defined in: [lib/errors.ts:141](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L141)

Thrown when `options.responseSchema` validation fails after a response is received.

### Extends

- [`BCSchemaValidationError`](#abstract-bcschemavalidationerror)

### Constructors

#### Constructor

> **new BCResponseValidationError**(`message`, `method`, `path`, `data`, `error`): [`BCResponseValidationError`](#bcresponsevalidationerror)

Defined in: [lib/errors.ts:125](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L125)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `method` | `string` |
| `path` | `string` |
| `data` | `unknown` |
| `error` | `FailureResult` |

##### Returns

[`BCResponseValidationError`](#bcresponsevalidationerror)

##### Inherited from

[`BCSchemaValidationError`](#abstract-bcschemavalidationerror).[`constructor`](#constructor-17)

### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="code-16"></a> `code` | `public` | `string` | `'BC_RESPONSE_VALIDATION_FAILED'` | Machine-readable error code. Unique per subclass. | [`BCSchemaValidationError`](#abstract-bcschemavalidationerror).[`code`](#code-17) | - | [lib/errors.ts:142](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L142) |
| <a id="context-16"></a> `context` | `readonly` | `object` | `undefined` | - | - | [`BCSchemaValidationError`](#abstract-bcschemavalidationerror).[`context`](#context-17) | [lib/errors.ts:18](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L18) |
| `context.data` | `public` | `unknown` | `undefined` | - | - | - | [lib/errors.ts:122](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L122) |
| `context.error` | `public` | `FailureResult` | `undefined` | - | - | - | [lib/errors.ts:123](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L123) |
| `context.method` | `public` | `string` | `undefined` | - | - | - | [lib/errors.ts:120](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L120) |
| `context.path` | `public` | `string` | `undefined` | - | - | - | [lib/errors.ts:121](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L121) |

***

## `abstract` BCSchemaValidationError

Defined in: [lib/errors.ts:119](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L119)

Abstract base for all StandardSchema validation errors. Carries the raw `data` that failed
validation and the schema `error` result. Use specific subclasses for `instanceof` checks.

### Extends

- [`BaseError`](#abstract-baseerror)\<\{ `data`: `unknown`; `error`: `StandardSchemaV1.FailureResult`; `method`: `string`; `path`: `string`; \}\>

### Extended by

- [`BCQueryValidationError`](#bcqueryvalidationerror)
- [`BCRequestBodyValidationError`](#bcrequestbodyvalidationerror)
- [`BCResponseValidationError`](#bcresponsevalidationerror)
- [`BCPaginatedItemValidationError`](#bcpaginateditemvalidationerror)

### Constructors

#### Constructor

> **new BCSchemaValidationError**(`message`, `method`, `path`, `data`, `error`): [`BCSchemaValidationError`](#abstract-bcschemavalidationerror)

Defined in: [lib/errors.ts:125](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L125)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| `method` | `string` |
| `path` | `string` |
| `data` | `unknown` |
| `error` | `FailureResult` |

##### Returns

[`BCSchemaValidationError`](#abstract-bcschemavalidationerror)

##### Overrides

[`BaseError`](#abstract-baseerror).[`constructor`](#constructor)

### Properties

| Property | Modifier | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="code-17"></a> `code` | `abstract` | `string` | Machine-readable error code. Unique per subclass. | [`BaseError`](#abstract-baseerror).[`code`](#code) | [lib/errors.ts:14](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L14) |
| <a id="context-17"></a> `context` | `readonly` | `object` | - | [`BaseError`](#abstract-baseerror).[`context`](#context) | [lib/errors.ts:18](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L18) |
| `context.data` | `public` | `unknown` | - | - | [lib/errors.ts:122](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L122) |
| `context.error` | `public` | `FailureResult` | - | - | [lib/errors.ts:123](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L123) |
| `context.method` | `public` | `string` | - | - | [lib/errors.ts:120](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L120) |
| `context.path` | `public` | `string` | - | - | [lib/errors.ts:121](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L121) |

***

## BCTimeoutError

Defined in: [lib/errors.ts:181](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L181)

Thrown when a request exceeds the configured timeout (default 120 s).

### Extends

- [`BaseError`](#abstract-baseerror)\<\{ `method`: `string`; `url`: `string`; \}\>

### Constructors

#### Constructor

> **new BCTimeoutError**(`err`): [`BCTimeoutError`](#bctimeouterror)

Defined in: [lib/errors.ts:187](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L187)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `err` | `TimeoutError` |

##### Returns

[`BCTimeoutError`](#bctimeouterror)

##### Overrides

[`BaseError`](#abstract-baseerror).[`constructor`](#constructor)

### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="code-18"></a> `code` | `public` | `string` | `'BC_TIMEOUT_ERROR'` | Machine-readable error code. Unique per subclass. | [`BaseError`](#abstract-baseerror).[`code`](#code) | - | [lib/errors.ts:185](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L185) |
| <a id="context-18"></a> `context` | `readonly` | `object` | `undefined` | - | - | [`BaseError`](#abstract-baseerror).[`context`](#context) | [lib/errors.ts:18](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L18) |
| `context.method` | `public` | `string` | `undefined` | - | - | - | [lib/errors.ts:182](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L182) |
| `context.url` | `public` | `string` | `undefined` | - | - | - | [lib/errors.ts:183](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L183) |

***

## BCUrlTooLongError

Defined in: [lib/errors.ts:59](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L59)

Thrown before a request is sent when the constructed URL exceeds 2048 characters.

### Extends

- [`BaseError`](#abstract-baseerror)\<\{ `len`: `number`; `max`: `number`; `url`: `string`; \}\>

### Constructors

#### Constructor

> **new BCUrlTooLongError**(`url`, `max`): [`BCUrlTooLongError`](#bcurltoolongerror)

Defined in: [lib/errors.ts:66](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L66)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `url` | `string` |
| `max` | `number` |

##### Returns

[`BCUrlTooLongError`](#bcurltoolongerror)

##### Overrides

[`BaseError`](#abstract-baseerror).[`constructor`](#constructor)

### Properties

| Property | Modifier | Type | Default value | Description | Overrides | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="code-19"></a> `code` | `public` | `string` | `'BC_URL_TOO_LONG'` | Machine-readable error code. Unique per subclass. | [`BaseError`](#abstract-baseerror).[`code`](#code) | - | [lib/errors.ts:64](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L64) |
| <a id="context-19"></a> `context` | `readonly` | `object` | `undefined` | - | - | [`BaseError`](#abstract-baseerror).[`context`](#context) | [lib/errors.ts:18](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L18) |
| `context.len` | `public` | `number` | `undefined` | - | - | - | [lib/errors.ts:62](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L62) |
| `context.max` | `public` | `number` | `undefined` | - | - | - | [lib/errors.ts:61](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L61) |
| `context.url` | `public` | `string` | `undefined` | - | - | - | [lib/errors.ts:60](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L60) |

***

## BigCommerceAuth

Defined in: [auth.ts:128](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/auth.ts#L128)

Handles authentication with BigCommerce OAuth

### Constructors

#### Constructor

> **new BigCommerceAuth**(`config`): [`BigCommerceAuth`](#bigcommerceauth)

Defined in: [auth.ts:142](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/auth.ts#L142)

Creates a new BigCommerceAuth instance for handling OAuth authentication

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `config` | `Config` | Configuration options for BigCommerce authentication |

##### Returns

[`BigCommerceAuth`](#bigcommerceauth)

##### Throws

If the redirect URI is invalid

### Methods

#### requestToken()

> **requestToken**(`data`): `Promise`\<[`TokenResponse`](#tokenresponse)\>

Defined in: [auth.ts:174](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/auth.ts#L174)

Exchanges an OAuth authorization code for an access token.

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `data` | `string` \| `AuthQuery` \| `URLSearchParams` | The auth callback payload: a raw query string, `URLSearchParams`, or a pre-parsed object with `code`, `scope`, and `context`. |

##### Returns

`Promise`\<[`TokenResponse`](#tokenresponse)\>

The token response including `access_token`, `user`, and `context`.

##### Throws

[BCAuthMissingParamError](#bcauthmissingparamerror) if `code`, `scope`, or `context` are absent.

##### Throws

[BCAuthScopeMismatchError](#bcauthscopemismatcherror) if the granted scopes don't include all `config.scopes`.

##### Throws

[BCApiError](#bcapierror) on HTTP error responses from the token endpoint.

##### Throws

[BCTimeoutError](#bctimeouterror) if the token request times out.

##### Throws

[BCClientError](#bcclienterror) on any other error.

#### verify()

> **verify**(`jwtPayload`, `storeHash`): `Promise`\<[`Claims`](#claims)\>

Defined in: [auth.ts:235](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/auth.ts#L235)

Verifies a JWT payload from BigCommerce

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `jwtPayload` | `string` | The JWT string to verify |
| `storeHash` | `string` | The store hash for the BigCommerce store |

##### Returns

`Promise`\<[`Claims`](#claims)\>

Promise resolving to the verified JWT claims

##### Throws

If the JWT is invalid

***

## BigCommerceClient

Defined in: [client.ts:57](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/client.ts#L57)

### Constructors

#### Constructor

> **new BigCommerceClient**(`config`): [`BigCommerceClient`](#bigcommerceclient)

Defined in: [client.ts:86](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/client.ts#L86)

Creates a new BigCommerceClient.

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `config` | [`ClientConfig`](#clientconfig) | Client configuration. Ky options (e.g. `prefixUrl`, `timeout`, `retry`, `hooks`) are forwarded to the underlying ky instance. |

##### Returns

[`BigCommerceClient`](#bigcommerceclient)

##### Throws

[BCCredentialsError](#bccredentialserror) if `storeHash` or `accessToken` are missing or if
  `concurrency` is out of range.

##### Throws

[BCClientError](#bcclienterror) if `prefixUrl` is not a valid URL.

### Methods

#### batchSafe()

> **batchSafe**\<`TBody`, `TRes`, `TQuery`\>(`requests`, `options?`): `Promise`\<[`Result`](#result)\<`TRes`, [`BaseError`](#abstract-baseerror)\<[`ErrorContext`](#errorcontext)\>\>[]\>

Defined in: [client.ts:638](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/client.ts#L638)

Executes multiple requests concurrently and returns all results as [Result](#result) values,
never throwing. Errors from individual requests are captured as `Err` results.

Use [batchStream](#batchstream) to process results as they arrive rather than waiting for all.

##### Type Parameters

| Type Parameter |
| ------ |
| `TBody` |
| `TRes` |
| `TQuery` *extends* [`Query`](#query-1) |

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `requests` | [`BatchRequestOptions`](#batchrequestoptions)\<`TBody`, `TRes`, `TQuery`\>[] | Array of request descriptors built with the [req](#req) helpers. |
| `options?` | [`ConcurrencyOptions`](#concurrencyoptions) | - |

##### Returns

`Promise`\<[`Result`](#result)\<`TRes`, [`BaseError`](#abstract-baseerror)\<[`ErrorContext`](#errorcontext)\>\>[]\>

Results in the order requests complete (not necessarily input order).

#### batchStream()

> **batchStream**\<`TBody`, `TRes`, `TQuery`\>(`requests`, `options?`): `AsyncGenerator`\<[`Result`](#result)\<`TRes`, [`BaseError`](#abstract-baseerror)\<[`ErrorContext`](#errorcontext)\>\>\>

Defined in: [client.ts:788](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/client.ts#L788)

Executes multiple requests with configurable concurrency, yielding each result as a
[Result](#result) as it completes. Errors from individual requests are yielded as `Err`
results rather than thrown.

Automatically adjusts concurrency up/down in response to rate-limit and error responses.
Use [batchSafe](#batchsafe) to collect all results into an array.

##### Type Parameters

| Type Parameter |
| ------ |
| `TBody` |
| `TRes` |
| `TQuery` *extends* [`Query`](#query-1) |

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `requests` | [`BatchRequestOptions`](#batchrequestoptions)\<`TBody`, `TRes`, `TQuery`\>[] | Array of request descriptors built with the [req](#req) helpers. |
| `options?` | [`ConcurrencyOptions`](#concurrencyoptions) | - |

##### Returns

`AsyncGenerator`\<[`Result`](#result)\<`TRes`, [`BaseError`](#abstract-baseerror)\<[`ErrorContext`](#errorcontext)\>\>\>

#### collect()

> **collect**\<`TItem`, `TQuery`\>(`path`, `options?`): `Promise`\<`TItem`[]\>

Defined in: [client.ts:465](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/client.ts#L465)

Fetches all pages from a v3 paginated endpoint and collects items into an array.

Use [stream](#stream) to process items lazily without buffering the full result set.

##### Type Parameters

| Type Parameter |
| ------ |
| `TItem` |
| `TQuery` *extends* [`Query`](#query-1) |

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` | API path relative to the store's versioned base URL. |
| `options?` | [`CollectOptions`](#collectoptions)\<`TItem`, `TQuery`\> | Ky options are forwarded to page requests. |

##### Returns

`Promise`\<`TItem`[]\>

All items across all pages.

##### Throws

[BCPaginatedOptionError](#bcpaginatedoptionerror) if `query.limit` or `query.page` is not a positive number.

##### Throws

[BCQueryValidationError](#bcqueryvalidationerror) if `querySchema` validation fails.

##### Throws

[BCApiError](#bcapierror) on HTTP error responses.

##### Throws

[BCTimeoutError](#bctimeouterror) if a request times out.

##### Throws

[BCResponseParseError](#bcresponseparseerror) if a response body cannot be parsed.

##### Throws

[BCUrlTooLongError](#bcurltoolongerror) if a constructed URL exceeds 2048 characters.

##### Throws

[BCRateLimitNoHeadersError](#bcratelimitnoheaderserror) if a 429 is received without rate-limit headers.

##### Throws

[BCRateLimitDelayTooLongError](#bcratelimitdelaytoolongerror) if the rate-limit reset window exceeds
  `config.retry.maxRetryAfter`.

##### Throws

[BCPaginatedResponseError](#bcpaginatedresponseerror) if a page response has an unexpected shape.

##### Throws

[BCPaginatedItemValidationError](#bcpaginateditemvalidationerror) if `itemSchema` validation fails for an item.

##### Throws

[BCClientError](#bcclienterror) on any other ky or unknown error.

#### collectCount()

> **collectCount**\<`TItem`, `TQuery`\>(`path`, `options?`): `Promise`\<`TItem`[]\>

Defined in: [client.ts:603](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/client.ts#L603)

Fetches items from a v2 paginated endpoint using a known total item `count` and collects
them into an array.

Use this for v2 endpoints that do not return pagination metadata. Use [streamCount](#streamcount)
to process items lazily.

##### Type Parameters

| Type Parameter |
| ------ |
| `TItem` |
| `TQuery` *extends* [`Query`](#query-1) |

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` | API path relative to the store's versioned base URL. |
| `options?` | `CountedCollectOptions`\<`TItem`, `TQuery`\> | Ky options are forwarded to page requests. |

##### Returns

`Promise`\<`TItem`[]\>

All items across the computed page range.

##### Throws

[BCPaginatedOptionError](#bcpaginatedoptionerror) if `count`, `query.limit`, or `query.page` is not a
  positive number.

##### Throws

[BCQueryValidationError](#bcqueryvalidationerror) if `querySchema` validation fails.

##### Throws

[BCApiError](#bcapierror) on HTTP error responses.

##### Throws

[BCTimeoutError](#bctimeouterror) if a request times out.

##### Throws

[BCResponseParseError](#bcresponseparseerror) if a response body cannot be parsed.

##### Throws

[BCUrlTooLongError](#bcurltoolongerror) if a constructed URL exceeds 2048 characters.

##### Throws

[BCRateLimitNoHeadersError](#bcratelimitnoheaderserror) if a 429 is received without rate-limit headers.

##### Throws

[BCRateLimitDelayTooLongError](#bcratelimitdelaytoolongerror) if the rate-limit reset window exceeds
  `config.retry.maxRetryAfter`.

##### Throws

[BCPaginatedItemValidationError](#bcpaginateditemvalidationerror) if `itemSchema` validation fails for an item.

##### Throws

[BCClientError](#bcclienterror) on any other ky or unknown error.

#### delete()

> **delete**\<`TRes`, `TQuery`\>(`path`, `options?`): `Promise`\<`void`\>

Defined in: [client.ts:250](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/client.ts#L250)

Sends a DELETE request to the given path.

Silently suppresses 404 responses (resource already gone) and empty response bodies.

##### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `TRes` | `never` |
| `TQuery` *extends* [`Query`](#query-1) | [`Query`](#query-1) |

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` | API path relative to the store's versioned base URL. |
| `options?` | [`DeleteOptions`](#deleteoptions)\<`TQuery`\> | Ky options are forwarded to the underlying request. |

##### Returns

`Promise`\<`void`\>

##### Throws

[BCApiError](#bcapierror) on non-404 HTTP error responses.

##### Throws

[BCTimeoutError](#bctimeouterror) if the request times out.

##### Throws

[BCResponseParseError](#bcresponseparseerror) if the response body is non-empty and cannot be parsed.

##### Throws

[BCUrlTooLongError](#bcurltoolongerror) if the constructed URL exceeds 2048 characters.

##### Throws

[BCRateLimitNoHeadersError](#bcratelimitnoheaderserror) if a 429 is received without rate-limit headers.

##### Throws

[BCRateLimitDelayTooLongError](#bcratelimitdelaytoolongerror) if the rate-limit reset window exceeds
  `config.retry.maxRetryAfter`.

##### Throws

[BCQueryValidationError](#bcqueryvalidationerror) if `querySchema` validation fails.

##### Throws

[BCClientError](#bcclienterror) on any other ky or unknown error.

#### get()

> **get**\<`TRes`, `TQuery`\>(`path`, `options?`): `Promise`\<`TRes`\>

Defined in: [client.ts:145](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/client.ts#L145)

Sends a GET request to the given path.

##### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `TRes` | - |
| `TQuery` *extends* [`Query`](#query-1) | [`Query`](#query-1) |

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` | API path relative to the store's versioned base URL (e.g. `catalog/products`). |
| `options?` | [`GetOptions`](#getoptions)\<`TRes`, `TQuery`\> | Ky options are forwarded to the underlying request. |

##### Returns

`Promise`\<`TRes`\>

Parsed and optionally validated response body.

##### Throws

[BCApiError](#bcapierror) on HTTP error responses.

##### Throws

[BCTimeoutError](#bctimeouterror) if the request times out.

##### Throws

[BCResponseParseError](#bcresponseparseerror) if the response body cannot be parsed.

##### Throws

[BCUrlTooLongError](#bcurltoolongerror) if the constructed URL exceeds 2048 characters.

##### Throws

[BCRateLimitNoHeadersError](#bcratelimitnoheaderserror) if a 429 is received without rate-limit headers.

##### Throws

[BCRateLimitDelayTooLongError](#bcratelimitdelaytoolongerror) if the rate-limit reset window exceeds
  `config.retry.maxRetryAfter`.

##### Throws

[BCQueryValidationError](#bcqueryvalidationerror) if `querySchema` validation fails.

##### Throws

[BCResponseValidationError](#bcresponsevalidationerror) if `responseSchema` validation fails.

##### Throws

[BCClientError](#bcclienterror) on any other ky or unknown error.

#### post()

> **post**\<`TRes`, `TBody`, `TQuery`\>(`path`, `options?`): `Promise`\<`TRes`\>

Defined in: [client.ts:180](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/client.ts#L180)

Sends a POST request to the given path.

##### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `TRes` | - |
| `TBody` | `unknown` |
| `TQuery` *extends* [`Query`](#query-1) | [`Query`](#query-1) |

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` | API path relative to the store's versioned base URL. |
| `options?` | [`PostOptions`](#postoptions)\<`TBody`, `TRes`, `TQuery`\> | Ky options are forwarded to the underlying request. |

##### Returns

`Promise`\<`TRes`\>

Parsed and optionally validated response body.

##### Throws

[BCApiError](#bcapierror) on HTTP error responses.

##### Throws

[BCTimeoutError](#bctimeouterror) if the request times out.

##### Throws

[BCResponseParseError](#bcresponseparseerror) if the response body cannot be parsed.

##### Throws

[BCUrlTooLongError](#bcurltoolongerror) if the constructed URL exceeds 2048 characters.

##### Throws

[BCRateLimitNoHeadersError](#bcratelimitnoheaderserror) if a 429 is received without rate-limit headers.

##### Throws

[BCRateLimitDelayTooLongError](#bcratelimitdelaytoolongerror) if the rate-limit reset window exceeds
  `config.retry.maxRetryAfter`.

##### Throws

[BCQueryValidationError](#bcqueryvalidationerror) if `querySchema` validation fails.

##### Throws

[BCRequestBodyValidationError](#bcrequestbodyvalidationerror) if `bodySchema` validation fails.

##### Throws

[BCResponseValidationError](#bcresponsevalidationerror) if `responseSchema` validation fails.

##### Throws

[BCClientError](#bcclienterror) on any other ky or unknown error.

#### put()

> **put**\<`TRes`, `TBody`, `TQuery`\>(`path`, `options?`): `Promise`\<`TRes`\>

Defined in: [client.ts:218](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/client.ts#L218)

Sends a PUT request to the given path.

##### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `TRes` | - |
| `TBody` | `unknown` |
| `TQuery` *extends* [`Query`](#query-1) | [`Query`](#query-1) |

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` | API path relative to the store's versioned base URL. |
| `options?` | [`PutOptions`](#putoptions)\<`TBody`, `TRes`, `TQuery`\> | Ky options are forwarded to the underlying request. |

##### Returns

`Promise`\<`TRes`\>

Parsed and optionally validated response body.

##### Throws

[BCApiError](#bcapierror) on HTTP error responses.

##### Throws

[BCTimeoutError](#bctimeouterror) if the request times out.

##### Throws

[BCResponseParseError](#bcresponseparseerror) if the response body cannot be parsed.

##### Throws

[BCUrlTooLongError](#bcurltoolongerror) if the constructed URL exceeds 2048 characters.

##### Throws

[BCRateLimitNoHeadersError](#bcratelimitnoheaderserror) if a 429 is received without rate-limit headers.

##### Throws

[BCRateLimitDelayTooLongError](#bcratelimitdelaytoolongerror) if the rate-limit reset window exceeds
  `config.retry.maxRetryAfter`.

##### Throws

[BCQueryValidationError](#bcqueryvalidationerror) if `querySchema` validation fails.

##### Throws

[BCRequestBodyValidationError](#bcrequestbodyvalidationerror) if `bodySchema` validation fails.

##### Throws

[BCResponseValidationError](#bcresponsevalidationerror) if `responseSchema` validation fails.

##### Throws

[BCClientError](#bcclienterror) on any other ky or unknown error.

#### query()

> **query**\<`TItem`, `TQuery`\>(`path`, `options`): `Promise`\<`TItem`[]\>

Defined in: [client.ts:313](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/client.ts#L313)

Fetches items from a v3 paginated endpoint by splitting `values` across multiple requests
using the given `key` query param, chunking to stay within URL length limits.

Collects all results into an array. Use [queryStream](#querystream) to process items lazily.

##### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `TItem` | - |
| `TQuery` *extends* [`Query`](#query-1) | [`Query`](#query-1) |

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` | API path relative to the store's versioned base URL. |
| `options` | `QueryOptions`\<`TItem`, `TQuery`\> | - |

##### Returns

`Promise`\<`TItem`[]\>

All matching items across all chunked requests.

##### Throws

[BCPaginatedOptionError](#bcpaginatedoptionerror) if `query.limit` is not a positive number.

##### Throws

[BCQueryValidationError](#bcqueryvalidationerror) if `querySchema` validation fails.

##### Throws

[BCApiError](#bcapierror) on HTTP error responses.

##### Throws

[BCTimeoutError](#bctimeouterror) if a request times out.

##### Throws

[BCResponseParseError](#bcresponseparseerror) if a response body cannot be parsed.

##### Throws

[BCUrlTooLongError](#bcurltoolongerror) if a constructed URL exceeds 2048 characters.

##### Throws

[BCRateLimitNoHeadersError](#bcratelimitnoheaderserror) if a 429 is received without rate-limit headers.

##### Throws

[BCRateLimitDelayTooLongError](#bcratelimitdelaytoolongerror) if the rate-limit reset window exceeds
  `config.retry.maxRetryAfter`.

##### Throws

[BCPaginatedResponseError](#bcpaginatedresponseerror) if a page response has an unexpected shape.

##### Throws

[BCPaginatedItemValidationError](#bcpaginateditemvalidationerror) if `itemSchema` validation fails for an item.

##### Throws

[BCClientError](#bcclienterror) on any other ky or unknown error.

#### queryStream()

> **queryStream**\<`TItem`, `TQuery`\>(`path`, `options`): `AsyncGenerator`\<[`Result`](#result)\<`TItem`, [`BaseError`](#abstract-baseerror)\<[`ErrorContext`](#errorcontext)\>\>\>

Defined in: [client.ts:356](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/client.ts#L356)

Streaming variant of [query](#query). Yields each item individually as results arrive,
splitting `values` into URL-length-safe chunks across concurrent requests.

Each yielded value is a [Result](#result) — check `err` before using `data`.

##### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `TItem` | - |
| `TQuery` *extends* [`Query`](#query-1) | [`Query`](#query-1) |

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` | API path relative to the store's versioned base URL. |
| `options` | `QueryOptions`\<`TItem`, `TQuery`\> | - |

##### Returns

`AsyncGenerator`\<[`Result`](#result)\<`TItem`, [`BaseError`](#abstract-baseerror)\<[`ErrorContext`](#errorcontext)\>\>\>

##### Throws

[BCPaginatedOptionError](#bcpaginatedoptionerror) if `query.limit` is not a positive number.

##### Throws

[BCQueryValidationError](#bcqueryvalidationerror) if `querySchema` validation fails.

#### stream()

> **stream**\<`TItem`, `TQuery`\>(`path`, `options?`): `AsyncGenerator`\<[`Result`](#result)\<`TItem`, [`BaseError`](#abstract-baseerror)\<[`ErrorContext`](#errorcontext)\>\>\>

Defined in: [client.ts:679](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/client.ts#L679)

Streams all items from a v3 paginated endpoint, fetching the first page sequentially
and remaining pages concurrently via [batchStream](#batchstream).

Each yielded value is a [Result](#result) — check `err` before using `data`. Use
[collect](#collect) to gather all items into an array.

##### Type Parameters

| Type Parameter |
| ------ |
| `TItem` |
| `TQuery` *extends* [`Query`](#query-1) |

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` | API path relative to the store's versioned base URL. |
| `options?` | [`CollectOptions`](#collectoptions)\<`TItem`, `TQuery`\> | Ky options are forwarded to page requests. |

##### Returns

`AsyncGenerator`\<[`Result`](#result)\<`TItem`, [`BaseError`](#abstract-baseerror)\<[`ErrorContext`](#errorcontext)\>\>\>

##### Throws

[BCPaginatedOptionError](#bcpaginatedoptionerror) if `query.limit` or `query.page` is not a positive number.

##### Throws

[BCQueryValidationError](#bcqueryvalidationerror) if `querySchema` validation fails.

#### streamCount()

> **streamCount**\<`TItem`, `TQuery`\>(`path`, `options?`): `AsyncGenerator`\<[`Result`](#result)\<`TItem`, [`BaseError`](#abstract-baseerror)\<[`ErrorContext`](#errorcontext)\>\>\>

Defined in: [client.ts:510](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/client.ts#L510)

Streams items from a v2 paginated endpoint using a known total item `count`.

Use this for v2 endpoints that do not return pagination metadata. Yields each item
as a [Result](#result) — check `err` before using `data`. Use [collectCount](#collectcount) to
collect all results into an array.

##### Type Parameters

| Type Parameter |
| ------ |
| `TItem` |
| `TQuery` *extends* [`Query`](#query-1) |

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` | API path relative to the store's versioned base URL. |
| `options?` | `CountedCollectOptions`\<`TItem`, `TQuery`\> | Ky options are forwarded to page requests. |

##### Returns

`AsyncGenerator`\<[`Result`](#result)\<`TItem`, [`BaseError`](#abstract-baseerror)\<[`ErrorContext`](#errorcontext)\>\>\>

##### Throws

[BCPaginatedOptionError](#bcpaginatedoptionerror) if `count`, `query.limit`, or `query.page` is not a
  positive number.

##### Throws

[BCQueryValidationError](#bcqueryvalidationerror) if `querySchema` validation fails.

***

## FallbackLogger

Defined in: [lib/logger.ts:49](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/logger.ts#L49)

Console-based [Logger](#logger-1) that filters messages below a minimum level.

Used automatically when `config.logger` is `true`, `undefined`, or a [LogLevel](#loglevel) string.
Can also be instantiated directly for custom log level control.

### Example

```ts
new BigCommerceClient({ ..., logger: new FallbackLogger('debug') });
```

### Implements

- [`Logger`](#logger-1)

### Constructors

#### Constructor

> **new FallbackLogger**(`level`): [`FallbackLogger`](#fallbacklogger)

Defined in: [lib/logger.ts:53](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/logger.ts#L53)

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `level` | `"debug"` \| `"info"` \| `"warn"` \| `"error"` | Minimum level to output. Messages below this level are silently dropped. |

##### Returns

[`FallbackLogger`](#fallbacklogger)

### Properties

| Property | Modifier | Type | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="level"></a> `level` | `readonly` | `"debug"` \| `"info"` \| `"warn"` \| `"error"` | Minimum level to output. Messages below this level are silently dropped. | [lib/logger.ts:53](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/logger.ts#L53) |

### Methods

#### debug()

> **debug**(`data`, `message?`): `void`

Defined in: [lib/logger.ts:55](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/logger.ts#L55)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | `Record`\<`string`, `unknown`\> |
| `message?` | `string` |

##### Returns

`void`

##### Implementation of

[`Logger`](#logger-1).[`debug`](#debug-1)

#### error()

> **error**(`data`, `message?`): `void`

Defined in: [lib/logger.ts:67](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/logger.ts#L67)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | `Record`\<`string`, `unknown`\> |
| `message?` | `string` |

##### Returns

`void`

##### Implementation of

[`Logger`](#logger-1).[`error`](#error-1)

#### info()

> **info**(`data`, `message?`): `void`

Defined in: [lib/logger.ts:59](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/logger.ts#L59)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | `Record`\<`string`, `unknown`\> |
| `message?` | `string` |

##### Returns

`void`

##### Implementation of

[`Logger`](#logger-1).[`info`](#info-1)

#### warn()

> **warn**(`data`, `message?`): `void`

Defined in: [lib/logger.ts:63](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/logger.ts#L63)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | `Record`\<`string`, `unknown`\> |
| `message?` | `string` |

##### Returns

`void`

##### Implementation of

[`Logger`](#logger-1).[`warn`](#warn-1)

***

## ClientConfig

Defined in: [lib/common.ts:23](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/common.ts#L23)

### Extends

- `Omit`\<`KyOptions`, `"throwHttpErrors"` \| `"parseJson"` \| `"method"` \| `"body"` \| `"json"` \| `"searchParams"`\>.[`ConcurrencyOptions`](#concurrencyoptions)

### Properties

| Property | Type | Inherited from | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="accesstoken"></a> `accessToken` | `string` | - | [lib/common.ts:27](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/common.ts#L27) |
| <a id="backoff"></a> `backoff?` | `number` \| ((`concurrency`, `status`) => `number`) | `ConcurrencyOptions.backoff` | [lib/common.ts:8](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/common.ts#L8) |
| <a id="backoffrecover"></a> `backoffRecover?` | `number` \| ((`concurrency`) => `number`) | `ConcurrencyOptions.backoffRecover` | [lib/common.ts:10](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/common.ts#L10) |
| <a id="concurrency"></a> `concurrency?` | `number` \| `false` | `ConcurrencyOptions.concurrency` | [lib/common.ts:7](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/common.ts#L7) |
| <a id="logger"></a> `logger?` | `boolean` \| [`Logger`](#logger-1) \| `"debug"` \| `"info"` \| `"warn"` \| `"error"` | - | [lib/common.ts:28](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/common.ts#L28) |
| <a id="ratelimitbackoff"></a> `rateLimitBackoff?` | `number` | `ConcurrencyOptions.rateLimitBackoff` | [lib/common.ts:9](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/common.ts#L9) |
| <a id="storehash"></a> `storeHash` | `string` | - | [lib/common.ts:26](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/common.ts#L26) |

***

## Logger

Defined in: [lib/logger.ts:3](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/logger.ts#L3)

### Methods

#### debug()

> **debug**(`data`, `message?`): `void`

Defined in: [lib/logger.ts:4](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/logger.ts#L4)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | `Record`\<`string`, `unknown`\> |
| `message?` | `string` |

##### Returns

`void`

#### error()

> **error**(`data`, `message?`): `void`

Defined in: [lib/logger.ts:7](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/logger.ts#L7)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | `Record`\<`string`, `unknown`\> |
| `message?` | `string` |

##### Returns

`void`

#### info()

> **info**(`data`, `message?`): `void`

Defined in: [lib/logger.ts:5](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/logger.ts#L5)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | `Record`\<`string`, `unknown`\> |
| `message?` | `string` |

##### Returns

`void`

#### warn()

> **warn**(`data`, `message?`): `void`

Defined in: [lib/logger.ts:6](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/logger.ts#L6)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | `Record`\<`string`, `unknown`\> |
| `message?` | `string` |

##### Returns

`void`

***

## ApiVersion

> **ApiVersion** = `"v3"` \| `"v2"`

Defined in: [lib/request.ts:5](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/request.ts#L5)

***

## BatchRequestOptions

> **BatchRequestOptions**\<`TBody`, `TRes`, `TQuery`\> = `object` & [`RequestOptions`](#requestoptions)\<`TBody`, `TRes`, `TQuery`\>

Defined in: [lib/request.ts:64](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/request.ts#L64)

### Type Declaration

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `path` | `string` | [lib/request.ts:65](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/request.ts#L65) |

### Type Parameters

| Type Parameter |
| ------ |
| `TBody` |
| `TRes` |
| `TQuery` *extends* [`Query`](#query-1) |

***

## Claims

> **Claims** = `object`

Defined in: [auth.ts:93](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/auth.ts#L93)

JWT claims from BigCommerce

### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="aud"></a> `aud` | `string` | JWT audience | [auth.ts:95](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/auth.ts#L95) |
| <a id="channel_id"></a> `channel_id` | `number` \| `null` | The channel ID (if applicable) | [auth.ts:122](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/auth.ts#L122) |
| <a id="exp"></a> `exp` | `number` | JWT expiration timestamp | [auth.ts:103](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/auth.ts#L103) |
| <a id="iat"></a> `iat` | `number` | JWT issued at timestamp | [auth.ts:99](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/auth.ts#L99) |
| <a id="iss"></a> `iss` | `string` | JWT issuer | [auth.ts:97](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/auth.ts#L97) |
| <a id="jti"></a> `jti` | `string` | JWT unique identifier | [auth.ts:105](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/auth.ts#L105) |
| <a id="nbf"></a> `nbf` | `number` | JWT not before timestamp | [auth.ts:101](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/auth.ts#L101) |
| <a id="owner"></a> `owner` | `object` | Information about the store owner | [auth.ts:115](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/auth.ts#L115) |
| `owner.email` | `string` | - | [auth.ts:117](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/auth.ts#L117) |
| `owner.id` | `number` | - | [auth.ts:116](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/auth.ts#L116) |
| <a id="sub"></a> `sub` | `string` | JWT subject | [auth.ts:107](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/auth.ts#L107) |
| <a id="url"></a> `url` | `string` | The store URL | [auth.ts:120](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/auth.ts#L120) |
| <a id="user"></a> `user` | `object` | Information about the authenticated user | [auth.ts:109](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/auth.ts#L109) |
| `user.email` | `string` | - | [auth.ts:111](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/auth.ts#L111) |
| `user.id` | `number` | - | [auth.ts:110](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/auth.ts#L110) |
| `user.locale` | `string` | - | [auth.ts:112](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/auth.ts#L112) |

***

## CollectOptions

> **CollectOptions**\<`TItem`, `TQuery`\> = [`ConcurrencyOptions`](#concurrencyoptions) & `Omit`\<[`GetOptions`](#getoptions)\<`TItem`, `TQuery`\>, `"responseSchema"` \| `"version"`\> & `object`

Defined in: [lib/request.ts:126](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/request.ts#L126)

### Type Declaration

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `itemSchema?` | `StandardSchemaV1`\<`TItem`\> | [lib/request.ts:128](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/request.ts#L128) |

### Type Parameters

| Type Parameter |
| ------ |
| `TItem` |
| `TQuery` *extends* [`Query`](#query-1) |

***

## ConcurrencyOptions

> **ConcurrencyOptions** = `object`

Defined in: [lib/common.ts:6](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/common.ts#L6)

### Extended by

- [`ClientConfig`](#clientconfig)

### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="backoff-1"></a> `backoff?` | ((`concurrency`, `status`) => `number`) \| `number` | [lib/common.ts:8](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/common.ts#L8) |
| <a id="backoffrecover-1"></a> `backoffRecover?` | ((`concurrency`) => `number`) \| `number` | [lib/common.ts:10](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/common.ts#L10) |
| <a id="concurrency-1"></a> `concurrency?` | `number` \| `false` | [lib/common.ts:7](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/common.ts#L7) |
| <a id="ratelimitbackoff-1"></a> `rateLimitBackoff?` | `number` | [lib/common.ts:9](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/common.ts#L9) |

***

## DeleteOptions

> **DeleteOptions**\<`TQuery`\> = `Omit`\<[`RequestOptions`](#requestoptions)\<`never`, `never`, `TQuery`\>, `"body"` \| `"bodySchema"` \| `"method"` \| `"responseSchema"`\>

Defined in: [lib/request.ts:59](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/request.ts#L59)

### Type Parameters

| Type Parameter |
| ------ |
| `TQuery` *extends* [`Query`](#query-1) |

***

## Err

> **Err**\<`E`\> = `object`

Defined in: [lib/result.ts:7](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/result.ts#L7)

Creates a failed [Result](#result). Check `result.ok` or `result.err` before accessing `err`.

### Param

The error value.

### Type Parameters

| Type Parameter |
| ------ |
| `E` |

### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="data"></a> `data` | `undefined` | [lib/result.ts:9](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/result.ts#L9) |
| <a id="err-1"></a> `err` | `E` | [lib/result.ts:10](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/result.ts#L10) |
| <a id="ok"></a> `ok` | `false` | [lib/result.ts:8](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/result.ts#L8) |

***

## ErrorContext

> **ErrorContext** = `Record`\<`string`, `unknown`\>

Defined in: [lib/errors.ts:4](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/errors.ts#L4)

***

## GetOptions

> **GetOptions**\<`TRes`, `TQuery`\> = `Omit`\<[`RequestOptions`](#requestoptions)\<`never`, `TRes`, `TQuery`\>, `"body"` \| `"bodySchema"` \| `"method"`\>

Defined in: [lib/request.ts:52](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/request.ts#L52)

### Type Parameters

| Type Parameter |
| ------ |
| `TRes` |
| `TQuery` *extends* [`Query`](#query-1) |

***

## HttpMethod

> **HttpMethod** = `"POST"` \| `"GET"` \| `"PUT"` \| `"DELETE"`

Defined in: [lib/request.ts:29](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/request.ts#L29)

***

## LogLevel

> **LogLevel** = *typeof* `LOG_LEVELS`\[`number`\]

Defined in: [lib/logger.ts:19](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/logger.ts#L19)

***

## Ok

> **Ok**\<`T`\> = `object`

Defined in: [lib/result.ts:1](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/result.ts#L1)

Creates a successful [Result](#result). Check `result.ok` or `result.err` before accessing `data`.

### Param

The success value.

### Type Parameters

| Type Parameter |
| ------ |
| `T` |

### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="data-1"></a> `data` | `T` | [lib/result.ts:3](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/result.ts#L3) |
| <a id="err-2"></a> `err` | `undefined` | [lib/result.ts:4](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/result.ts#L4) |
| <a id="ok-2"></a> `ok` | `true` | [lib/result.ts:2](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/result.ts#L2) |

***

## Pagination

> **Pagination** = `object`

Defined in: [lib/pagination.ts:1](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/pagination.ts#L1)

### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="count"></a> `count` | `number` | [lib/pagination.ts:3](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/pagination.ts#L3) |
| <a id="current_page"></a> `current_page` | `number` | [lib/pagination.ts:5](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/pagination.ts#L5) |
| <a id="links"></a> `links` | `object` | [lib/pagination.ts:7](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/pagination.ts#L7) |
| `links.current` | `string` | [lib/pagination.ts:9](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/pagination.ts#L9) |
| `links.next` | `string` \| `null` | [lib/pagination.ts:10](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/pagination.ts#L10) |
| `links.previous` | `string` \| `null` | [lib/pagination.ts:8](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/pagination.ts#L8) |
| <a id="per_page"></a> `per_page` | `number` | [lib/pagination.ts:4](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/pagination.ts#L4) |
| <a id="total"></a> `total` | `number` | [lib/pagination.ts:2](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/pagination.ts#L2) |
| <a id="total_pages"></a> `total_pages` | `number` | [lib/pagination.ts:6](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/pagination.ts#L6) |

***

## PostOptions

> **PostOptions**\<`TBody`, `TRes`, `TQuery`\> = `Omit`\<[`RequestOptions`](#requestoptions)\<`TBody`, `TRes`, `TQuery`\>, `"method"`\>

Defined in: [lib/request.ts:57](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/request.ts#L57)

### Type Parameters

| Type Parameter |
| ------ |
| `TBody` |
| `TRes` |
| `TQuery` *extends* [`Query`](#query-1) |

***

## PowertoolsLikeLogger

> **PowertoolsLikeLogger** = `object`

Defined in: [lib/logger.ts:10](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/logger.ts#L10)

### Methods

#### debug()

> **debug**(`message`, ...`data`): `void`

Defined in: [lib/logger.ts:11](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/logger.ts#L11)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| ...`data` | `Record`\<`string`, `unknown`\>[] |

##### Returns

`void`

#### error()

> **error**(`message`, ...`data`): `void`

Defined in: [lib/logger.ts:14](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/logger.ts#L14)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| ...`data` | `Record`\<`string`, `unknown`\>[] |

##### Returns

`void`

#### info()

> **info**(`message`, ...`data`): `void`

Defined in: [lib/logger.ts:12](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/logger.ts#L12)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| ...`data` | `Record`\<`string`, `unknown`\>[] |

##### Returns

`void`

#### warn()

> **warn**(`message`, ...`data`): `void`

Defined in: [lib/logger.ts:13](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/logger.ts#L13)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |
| ...`data` | `Record`\<`string`, `unknown`\>[] |

##### Returns

`void`

***

## PutOptions

> **PutOptions**\<`TBody`, `TRes`, `TQuery`\> = [`PostOptions`](#postoptions)\<`TBody`, `TRes`, `TQuery`\>

Defined in: [lib/request.ts:58](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/request.ts#L58)

### Type Parameters

| Type Parameter |
| ------ |
| `TBody` |
| `TRes` |
| `TQuery` *extends* [`Query`](#query-1) |

***

## Query

> **Query** = `Record`\<`string`, [`QueryValue`](#queryvalue)\>

Defined in: [lib/request.ts:9](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/request.ts#L9)

***

## QueryValue

> **QueryValue** = `string` \| `number` \| (`string` \| `number`)[]

Defined in: [lib/request.ts:7](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/request.ts#L7)

***

## RequestOptions

> **RequestOptions**\<`TBody`, `TRes`, `TQuery`\> = `BaseKyRequest` & `QuerySchemaOptions`\<`TQuery`\> & `BodySchemaOptions`\<`TBody`\> & `object`

Defined in: [lib/request.ts:44](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/request.ts#L44)

### Type Declaration

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `method` | [`HttpMethod`](#httpmethod) | [lib/request.ts:47](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/request.ts#L47) |
| `responseSchema?` | `StandardSchemaV1`\<`TRes`\> | [lib/request.ts:49](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/request.ts#L49) |
| `version?` | [`ApiVersion`](#apiversion) | [lib/request.ts:48](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/request.ts#L48) |

### Type Parameters

| Type Parameter |
| ------ |
| `TBody` |
| `TRes` |
| `TQuery` *extends* [`Query`](#query-1) |

***

## Result

> **Result**\<`T`, `E`\> = [`Ok`](#ok-1)\<`T`\> \| [`Err`](#err)\<`E`\>

Defined in: [lib/result.ts:13](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/result.ts#L13)

### Type Parameters

| Type Parameter |
| ------ |
| `T` |
| `E` |

***

## TokenResponse

> **TokenResponse** = `object`

Defined in: [auth.ts:75](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/auth.ts#L75)

Response from BigCommerce token endpoint

### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="access_token"></a> `access_token` | `string` | The OAuth access token | [auth.ts:77](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/auth.ts#L77) |
| <a id="account_uuid"></a> `account_uuid` | `string` | The BigCommerce account UUID | [auth.ts:87](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/auth.ts#L87) |
| <a id="context-20"></a> `context` | `string` | The store context | [auth.ts:85](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/auth.ts#L85) |
| <a id="owner-1"></a> `owner` | [`User`](#user-2) | Information about the store owner | [auth.ts:83](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/auth.ts#L83) |
| <a id="scope"></a> `scope` | `string` | The granted OAuth scopes | [auth.ts:79](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/auth.ts#L79) |
| <a id="user-1"></a> `user` | [`User`](#user-2) | Information about the authenticated user | [auth.ts:81](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/auth.ts#L81) |

***

## User

> **User** = `object`

Defined in: [auth.ts:63](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/auth.ts#L63)

User information returned from BigCommerce

### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="email"></a> `email` | `string` | The user's email address | [auth.ts:69](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/auth.ts#L69) |
| <a id="id"></a> `id` | `number` | The user's ID | [auth.ts:65](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/auth.ts#L65) |
| <a id="username"></a> `username` | `string` | The user's username | [auth.ts:67](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/auth.ts#L67) |

***

## V3Resource

> **V3Resource**\<`T`\> = `object`

Defined in: [lib/pagination.ts:14](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/pagination.ts#L14)

### Type Parameters

| Type Parameter |
| ------ |
| `T` |

### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="data-2"></a> `data` | `T` | [lib/pagination.ts:15](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/pagination.ts#L15) |
| <a id="meta"></a> `meta` | `object` | [lib/pagination.ts:16](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/pagination.ts#L16) |
| `meta.pagination` | [`Pagination`](#pagination) | [lib/pagination.ts:17](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/pagination.ts#L17) |

***

## Err

> **Err**: \<`T`, `E`\>(`err`) => [`Result`](#result)\<`T`, `E`\>

Defined in: [lib/result.ts:7](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/result.ts#L7)

Creates a failed [Result](#result). Check `result.ok` or `result.err` before accessing `err`.

### Type Parameters

| Type Parameter |
| ------ |
| `T` |
| `E` |

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `err` | `E` | The error value. |

### Returns

[`Result`](#result)\<`T`, `E`\>

***

## Ok

> **Ok**: \<`T`, `E`\>(`data`) => [`Result`](#result)\<`T`, `E`\>

Defined in: [lib/result.ts:1](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/result.ts#L1)

Creates a successful [Result](#result). Check `result.ok` or `result.err` before accessing `data`.

### Type Parameters

| Type Parameter |
| ------ |
| `T` |
| `E` |

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `data` | `T` | The success value. |

### Returns

[`Result`](#result)\<`T`, `E`\>

***

## req

> `const` **req**: `object`

Defined in: [lib/request.ts:80](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/request.ts#L80)

Helpers for building typed request descriptors to pass to
[BigCommerceClient.batchSafe](#batchsafe) or [BigCommerceClient.batchStream](#batchstream).

### Type Declaration

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="property-delete"></a> `delete()` | \<`TQuery`\>(`path`, `options?`) => [`BatchRequestOptions`](#batchrequestoptions)\<`never`, `never`, `TQuery`\> | Builds a DELETE request descriptor. | [lib/request.ts:119](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/request.ts#L119) |
| <a id="property-get"></a> `get()` | \<`TRes`, `TQuery`\>(`path`, `options?`) => [`BatchRequestOptions`](#batchrequestoptions)\<`never`, `TRes`, `TQuery`\> | Builds a GET request descriptor. | [lib/request.ts:86](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/request.ts#L86) |
| <a id="property-post"></a> `post()` | \<`TRes`, `TBody`, `TQuery`\>(`path`, `options?`) => [`BatchRequestOptions`](#batchrequestoptions)\<`TBody`, `TRes`, `TQuery`\> | Builds a POST request descriptor. | [lib/request.ts:97](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/request.ts#L97) |
| <a id="property-put"></a> `put()` | \<`TRes`, `TBody`, `TQuery`\>(`path`, `options?`) => [`BatchRequestOptions`](#batchrequestoptions)\<`TBody`, `TRes`, `TQuery`\> | Builds a PUT request descriptor. | [lib/request.ts:108](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/request.ts#L108) |

### Example

```ts
const results = await client.batchSafe([
  req.get('catalog/products/1'),
  req.post('catalog/products', { body: { name: 'Widget' } }),
]);
```

***

## fromAwsPowertoolsLogger()

> **fromAwsPowertoolsLogger**(`logger`): [`Logger`](#logger-1)

Defined in: [lib/logger.ts:31](https://github.com/kernelpanic99/bc-api-client/blob/97c7612256b00cdcf2dd1fe2688cd9b26ca6f557/src/lib/logger.ts#L31)

Adapts an AWS Lambda Powertools logger to the [Logger](#logger-1) interface expected by
[BigCommerceClient](#bigcommerceclient) and [BigCommerceAuth](#bigcommerceauth).

Powertools loggers use `(message, ...data)` argument order whereas this library uses
`(data, message)`. This adapter swaps the arguments.

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `logger` | [`PowertoolsLikeLogger`](#powertoolslikelogger) | An AWS Lambda Powertools (or any [PowertoolsLikeLogger](#powertoolslikelogger)-compatible) logger. |

### Returns

[`Logger`](#logger-1)

A [Logger](#logger-1) wrapper suitable for `config.logger`.
