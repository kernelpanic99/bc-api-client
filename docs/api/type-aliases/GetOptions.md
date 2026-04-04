[**bc-api-client**](../README.md)

***

[bc-api-client](../README.md) / GetOptions

# Type Alias: GetOptions\<TRes, TQuery\>

> **GetOptions**\<`TRes`, `TQuery`\> = `Omit`\<[`RequestOptions`](RequestOptions.md)\<`never`, `TRes`, `TQuery`\>, `"body"` \| `"bodySchema"` \| `"method"`\>

Defined in: lib/request.ts:71

Options for GET requests.

## Type Parameters

| Type Parameter |
| ------ |
| `TRes` |
| `TQuery` *extends* [`Query`](Query.md) |
