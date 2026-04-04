[**bc-api-client**](../README.md)

***

[bc-api-client](../README.md) / CollectOptions

# Type Alias: CollectOptions\<TItem, TQuery\>

> **CollectOptions**\<`TItem`, `TQuery`\> = [`ConcurrencyOptions`](ConcurrencyOptions.md) & `Omit`\<[`GetOptions`](GetOptions.md)\<`TItem`, `TQuery`\>, `"responseSchema"` \| `"version"`\> & `object`

Defined in: lib/request.ts:126

## Type Declaration

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `itemSchema?` | `StandardSchemaV1`\<`TItem`\> | lib/request.ts:128 |

## Type Parameters

| Type Parameter |
| ------ |
| `TItem` |
| `TQuery` *extends* [`Query`](Query.md) |
