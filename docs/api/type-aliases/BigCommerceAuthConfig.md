[**bc-api-client**](../README.md)

***

[bc-api-client](../README.md) / BigCommerceAuthConfig

# Type Alias: BigCommerceAuthConfig

> **BigCommerceAuthConfig** = `object`

Defined in: auth.ts:18

Configuration options for BigCommerce authentication

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="clientid"></a> `clientId` | `string` | The OAuth client ID from BigCommerce | auth.ts:20 |
| <a id="logger"></a> `logger?` | [`Logger`](../interfaces/Logger.md) \| [`LogLevel`](LogLevel.md) \| `boolean` | Optional logger instance | auth.ts:28 |
| <a id="redirecturi"></a> `redirectUri` | `string` | The redirect URI registered with BigCommerce | auth.ts:24 |
| <a id="scopes"></a> `scopes?` | `string`[] | Optional array of scopes to validate during auth callback | auth.ts:26 |
| <a id="secret"></a> `secret` | `string` | The OAuth client secret from BigCommerce | auth.ts:22 |
