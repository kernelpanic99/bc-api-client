[**bc-api-client**](../README.md)

***

[bc-api-client](../README.md) / Err

# Variable: Err

> **Err**: \<`T`, `E`\>(`err`) => [`Result`](../type-aliases/Result.md)\<`T`, `E`\>

Defined in: lib/result.ts:7

Creates a failed [Result](../type-aliases/Result.md). Check `result.ok` or `result.err` before accessing `err`.

## Type Parameters

| Type Parameter |
| ------ |
| `T` |
| `E` |

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `err` | `E` | The error value. |

## Returns

[`Result`](../type-aliases/Result.md)\<`T`, `E`\>
