[**bc-api-client**](../README.md)

***

[bc-api-client](../README.md) / BigCommerceAuth

# Class: BigCommerceAuth

Defined in: auth.ts:128

Handles authentication with BigCommerce OAuth

## Constructors

### Constructor

> **new BigCommerceAuth**(`config`): `BigCommerceAuth`

Defined in: auth.ts:142

Creates a new BigCommerceAuth instance for handling OAuth authentication

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `config` | [`BigCommerceAuthConfig`](../type-aliases/BigCommerceAuthConfig.md) | Configuration options for BigCommerce authentication |

#### Returns

`BigCommerceAuth`

#### Throws

If the redirect URI is invalid

## Methods

### requestToken()

> **requestToken**(`data`): `Promise`\<[`TokenResponse`](../type-aliases/TokenResponse.md)\>

Defined in: auth.ts:174

Exchanges an OAuth authorization code for an access token.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `data` | `string` \| [`BigCommerceAuthQuery`](../type-aliases/BigCommerceAuthQuery.md) \| `URLSearchParams` | The auth callback payload: a raw query string, `URLSearchParams`, or a pre-parsed object with `code`, `scope`, and `context`. |

#### Returns

`Promise`\<[`TokenResponse`](../type-aliases/TokenResponse.md)\>

The token response including `access_token`, `user`, and `context`.

#### Throws

[BCAuthMissingParamError](BCAuthMissingParamError.md) if `code`, `scope`, or `context` are absent.

#### Throws

[BCAuthScopeMismatchError](BCAuthScopeMismatchError.md) if the granted scopes don't include all `config.scopes`.

#### Throws

[BCApiError](BCApiError.md) on HTTP error responses from the token endpoint.

#### Throws

[BCTimeoutError](BCTimeoutError.md) if the token request times out.

#### Throws

[BCClientError](BCClientError.md) on any other error.

***

### verify()

> **verify**(`jwtPayload`, `storeHash`): `Promise`\<[`Claims`](../type-aliases/Claims.md)\>

Defined in: auth.ts:235

Verifies a JWT payload from BigCommerce

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `jwtPayload` | `string` | The JWT string to verify |
| `storeHash` | `string` | The store hash for the BigCommerce store |

#### Returns

`Promise`\<[`Claims`](../type-aliases/Claims.md)\>

Promise resolving to the verified JWT claims

#### Throws

If the JWT is invalid
