[**bc-api-client**](../README.md)

***

[bc-api-client](../README.md) / TokenResponse

# Type Alias: TokenResponse

> **TokenResponse** = `object`

Defined in: auth.ts:75

Response from BigCommerce token endpoint

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="access_token"></a> `access_token` | `string` | The OAuth access token | auth.ts:77 |
| <a id="account_uuid"></a> `account_uuid` | `string` | The BigCommerce account UUID | auth.ts:87 |
| <a id="context"></a> `context` | `string` | The store context | auth.ts:85 |
| <a id="owner"></a> `owner` | [`User`](User.md) | Information about the store owner | auth.ts:83 |
| <a id="scope"></a> `scope` | `string` | The granted OAuth scopes | auth.ts:79 |
| <a id="user"></a> `user` | [`User`](User.md) | Information about the authenticated user | auth.ts:81 |
