[**bc-api-client**](../README.md)

***

[bc-api-client](../README.md) / Claims

# Type Alias: Claims

> **Claims** = `object`

Defined in: auth.ts:93

JWT claims from BigCommerce

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="aud"></a> `aud` | `string` | JWT audience | auth.ts:95 |
| <a id="channel_id"></a> `channel_id` | `number` \| `null` | The channel ID (if applicable) | auth.ts:122 |
| <a id="exp"></a> `exp` | `number` | JWT expiration timestamp | auth.ts:103 |
| <a id="iat"></a> `iat` | `number` | JWT issued at timestamp | auth.ts:99 |
| <a id="iss"></a> `iss` | `string` | JWT issuer | auth.ts:97 |
| <a id="jti"></a> `jti` | `string` | JWT unique identifier | auth.ts:105 |
| <a id="nbf"></a> `nbf` | `number` | JWT not before timestamp | auth.ts:101 |
| <a id="owner"></a> `owner` | `object` | Information about the store owner | auth.ts:115 |
| `owner.email` | `string` | - | auth.ts:117 |
| `owner.id` | `number` | - | auth.ts:116 |
| <a id="sub"></a> `sub` | `string` | JWT subject | auth.ts:107 |
| <a id="url"></a> `url` | `string` | The store URL | auth.ts:120 |
| <a id="user"></a> `user` | `object` | Information about the authenticated user | auth.ts:109 |
| `user.email` | `string` | - | auth.ts:111 |
| `user.id` | `number` | - | auth.ts:110 |
| `user.locale` | `string` | - | auth.ts:112 |
