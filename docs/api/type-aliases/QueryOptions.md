[**bc-api-client**](../README.md)

***

[bc-api-client](../README.md) / QueryOptions

# Type Alias: QueryOptions\<TItem, TQuery\>

> **QueryOptions**\<`TItem`, `TQuery`\> = [`CollectOptions`](CollectOptions.md)\<`TItem`, `TQuery`\> & `object`

Defined in: lib/request.ts:178

Options for query-based filtering operations ([BigCommerceClient.query](../classes/BigCommerceClient.md#query), [BigCommerceClient.queryStream](../classes/BigCommerceClient.md#querystream)).

## Type Declaration

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `key` | `string` | Query parameter name for value filtering (e.g., `'id:in'`). | lib/request.ts:180 |
| `values` | (`string` \| `number`)[] | Values to filter by. Automatically chunked across multiple requests. | lib/request.ts:182 |

## Type Parameters

| Type Parameter |
| ------ |
| `TItem` |
| `TQuery` *extends* [`Query`](Query.md) |
