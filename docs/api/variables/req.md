[**bc-api-client**](../README.md)

***

[bc-api-client](../README.md) / req

# Variable: req

> `const` **req**: `object`

Defined in: lib/request.ts:83

Helpers for building typed request descriptors to pass to
[BigCommerceClient.batchSafe](../classes/BigCommerceClient.md#batchsafe) or [BigCommerceClient.batchStream](../classes/BigCommerceClient.md#batchstream).

## Type Declaration

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="property-delete"></a> `delete()` | \<`TQuery`\>(`path`, `options?`) => [`BatchRequestOptions`](../type-aliases/BatchRequestOptions.md)\<`never`, `never`, `TQuery`\> | Builds a DELETE request descriptor. | lib/request.ts:122 |
| <a id="property-get"></a> `get()` | \<`TRes`, `TQuery`\>(`path`, `options?`) => [`BatchRequestOptions`](../type-aliases/BatchRequestOptions.md)\<`never`, `TRes`, `TQuery`\> | Builds a GET request descriptor. | lib/request.ts:89 |
| <a id="property-post"></a> `post()` | \<`TRes`, `TBody`, `TQuery`\>(`path`, `options?`) => [`BatchRequestOptions`](../type-aliases/BatchRequestOptions.md)\<`TBody`, `TRes`, `TQuery`\> | Builds a POST request descriptor. | lib/request.ts:100 |
| <a id="property-put"></a> `put()` | \<`TRes`, `TBody`, `TQuery`\>(`path`, `options?`) => [`BatchRequestOptions`](../type-aliases/BatchRequestOptions.md)\<`TBody`, `TRes`, `TQuery`\> | Builds a PUT request descriptor. | lib/request.ts:111 |

## Example

```ts
const results = await client.batchSafe([
  req.get('catalog/products/1'),
  req.post('catalog/products', { body: { name: 'Widget' } }),
]);
```
