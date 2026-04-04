[**bc-api-client**](../README.md)

***

[bc-api-client](../README.md) / FallbackLogger

# Class: FallbackLogger

Defined in: lib/logger.ts:49

Console-based [Logger](../interfaces/Logger.md) that filters messages below a minimum level.

Used automatically when `config.logger` is `true`, `undefined`, or a [LogLevel](../type-aliases/LogLevel.md) string.
Can also be instantiated directly for custom log level control.

## Example

```ts
new BigCommerceClient({ ..., logger: new FallbackLogger('debug') });
```

## Implements

- [`Logger`](../interfaces/Logger.md)

## Constructors

### Constructor

> **new FallbackLogger**(`level`): `FallbackLogger`

Defined in: lib/logger.ts:53

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `level` | `"debug"` \| `"info"` \| `"warn"` \| `"error"` | Minimum level to output. Messages below this level are silently dropped. |

#### Returns

`FallbackLogger`

## Properties

| Property | Modifier | Type | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="level"></a> `level` | `readonly` | `"debug"` \| `"info"` \| `"warn"` \| `"error"` | Minimum level to output. Messages below this level are silently dropped. | lib/logger.ts:53 |

## Methods

### debug()

> **debug**(`data`, `message?`): `void`

Defined in: lib/logger.ts:55

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | `Record`\<`string`, `unknown`\> |
| `message?` | `string` |

#### Returns

`void`

#### Implementation of

[`Logger`](../interfaces/Logger.md).[`debug`](../interfaces/Logger.md#debug)

***

### error()

> **error**(`data`, `message?`): `void`

Defined in: lib/logger.ts:67

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | `Record`\<`string`, `unknown`\> |
| `message?` | `string` |

#### Returns

`void`

#### Implementation of

[`Logger`](../interfaces/Logger.md).[`error`](../interfaces/Logger.md#error)

***

### info()

> **info**(`data`, `message?`): `void`

Defined in: lib/logger.ts:59

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | `Record`\<`string`, `unknown`\> |
| `message?` | `string` |

#### Returns

`void`

#### Implementation of

[`Logger`](../interfaces/Logger.md).[`info`](../interfaces/Logger.md#info)

***

### warn()

> **warn**(`data`, `message?`): `void`

Defined in: lib/logger.ts:63

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | `Record`\<`string`, `unknown`\> |
| `message?` | `string` |

#### Returns

`void`

#### Implementation of

[`Logger`](../interfaces/Logger.md).[`warn`](../interfaces/Logger.md#warn)
