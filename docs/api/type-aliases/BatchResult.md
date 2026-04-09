[**bc-api-client**](../README.md)

***

[bc-api-client](../README.md) / BatchResult

# Type Alias: BatchResult\<T, E\>

> **BatchResult**\<`T`, `E`\> = [`Result`](Result.md)\<`T`, `E`\> & `object`

Defined in: lib/result.ts:32

A [Result](Result.md) extended with the zero-based index of the originating request in the input
array passed to [BigCommerceClient.batchStream](../classes/BigCommerceClient.md#batchstream) or [BigCommerceClient.batchSafe](../classes/BigCommerceClient.md#batchsafe).

Because concurrent requests complete out of insertion order, `index` is the only reliable way
to correlate a result back to its input.

## Type Declaration

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `index` | `number` | lib/result.ts:32 |

## Type Parameters

| Type Parameter |
| ------ |
| `T` |
| `E` |

## Example

```ts
const requests = ids.map(id => req.get(`catalog/products/${id}`));
for await (const { index, err, data } of client.batchStream(requests)) {
  const originalId = ids[index];
  if (err) { console.error(originalId, err); continue; }
  console.log(originalId, data);
}
```
