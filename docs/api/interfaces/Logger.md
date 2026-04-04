[**bc-api-client**](../README.md)

***

[bc-api-client](../README.md) / Logger

# Interface: Logger

Defined in: lib/logger.ts:9

Logging interface for the BigCommerce client.

Implement this interface to provide custom logging. The client passes context data
as the first argument, making it compatible with structured loggers.

## Methods

### debug()

> **debug**(`data`, `message?`): `void`

Defined in: lib/logger.ts:10

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | `Record`\<`string`, `unknown`\> |
| `message?` | `string` |

#### Returns

`void`

***

### error()

> **error**(`data`, `message?`): `void`

Defined in: lib/logger.ts:13

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | `Record`\<`string`, `unknown`\> |
| `message?` | `string` |

#### Returns

`void`

***

### info()

> **info**(`data`, `message?`): `void`

Defined in: lib/logger.ts:11

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | `Record`\<`string`, `unknown`\> |
| `message?` | `string` |

#### Returns

`void`

***

### warn()

> **warn**(`data`, `message?`): `void`

Defined in: lib/logger.ts:12

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | `Record`\<`string`, `unknown`\> |
| `message?` | `string` |

#### Returns

`void`
