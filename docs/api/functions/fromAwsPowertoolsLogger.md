[**bc-api-client**](../README.md)

***

[bc-api-client](../README.md) / fromAwsPowertoolsLogger

# Function: fromAwsPowertoolsLogger()

> **fromAwsPowertoolsLogger**(`logger`): [`Logger`](../interfaces/Logger.md)

Defined in: lib/logger.ts:31

Adapts an AWS Lambda Powertools logger to the [Logger](../interfaces/Logger.md) interface expected by
[BigCommerceClient](../classes/BigCommerceClient.md) and [BigCommerceAuth](../classes/BigCommerceAuth.md).

Powertools loggers use `(message, ...data)` argument order whereas this library uses
`(data, message)`. This adapter swaps the arguments.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `logger` | [`PowertoolsLikeLogger`](../type-aliases/PowertoolsLikeLogger.md) | An AWS Lambda Powertools (or any [PowertoolsLikeLogger](../type-aliases/PowertoolsLikeLogger.md)-compatible) logger. |

## Returns

[`Logger`](../interfaces/Logger.md)

A [Logger](../interfaces/Logger.md) wrapper suitable for `config.logger`.
