[**bc-api-client**](../README.md)

***

[bc-api-client](../README.md) / CollectOptions

# Type Alias: CollectOptions\<TItem, TQuery\>

> **CollectOptions**\<`TItem`, `TQuery`\> = [`ConcurrencyOptions`](ConcurrencyOptions.md) & `Omit`\<[`GetOptions`](GetOptions.md)\<`TItem`, `TQuery`\>, `"responseSchema"` \| `"version"`\> & `object`

Defined in: lib/request.ts:157

Options for v3 paginated collection operations ([BigCommerceClient.collect](../classes/BigCommerceClient.md#collect), [BigCommerceClient.stream](../classes/BigCommerceClient.md#stream)).

## Type Declaration

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `itemSchema?` | [`StandardSchemaV1`](../interfaces/StandardSchemaV1.md)\<`TItem`\> | Schema to validate each item in the response. | lib/request.ts:160 |

## Type Parameters

| Type Parameter |
| ------ |
| `TItem` |
| `TQuery` *extends* [`Query`](Query.md) |
