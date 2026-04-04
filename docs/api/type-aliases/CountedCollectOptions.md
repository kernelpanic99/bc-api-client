[**bc-api-client**](../README.md)

***

[bc-api-client](../README.md) / CountedCollectOptions

# Type Alias: CountedCollectOptions\<TItem, TQuery\>

> **CountedCollectOptions**\<`TItem`, `TQuery`\> = [`CollectOptions`](CollectOptions.md)\<`TItem`, `TQuery`\> & `object`

Defined in: lib/request.ts:166

Options for v2 paginated operations with known count ([BigCommerceClient.collectCount](../classes/BigCommerceClient.md#collectcount), [BigCommerceClient.streamCount](../classes/BigCommerceClient.md#streamcount)).

## Type Declaration

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `count?` | `number` | Total number of items expected (for v2 endpoints without pagination metadata). | lib/request.ts:168 |

## Type Parameters

| Type Parameter |
| ------ |
| `TItem` |
| `TQuery` *extends* [`Query`](Query.md) |
