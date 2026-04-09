[**bc-api-client**](../README.md)

***

[bc-api-client](../README.md) / PageResult

# Type Alias: PageResult\<T, E\>

> **PageResult**\<`T`, `E`\> = [`Result`](Result.md)\<`T`, `E`\> & `object`

Defined in: lib/result.ts:49

A [Result](Result.md) extended with the one-based page number from which the item was fetched.

Because concurrent requests complete out of page order, `page` is the only reliable way
to correlate a result back to its source page when using [BigCommerceClient.stream](../classes/BigCommerceClient.md#stream)
or [BigCommerceClient.streamBlind](../classes/BigCommerceClient.md#streamblind).

## Type Declaration

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `page` | `number` | lib/result.ts:49 |

## Type Parameters

| Type Parameter |
| ------ |
| `T` |
| `E` |

## Example

```ts
for await (const { page, err, data } of client.stream('catalog/products')) {
  if (err) { console.error(`page ${page}:`, err); continue; }
  console.log(`page ${page}:`, data);
}
```
