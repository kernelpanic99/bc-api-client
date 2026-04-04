[**bc-api-client**](../README.md)

***

[bc-api-client](../README.md) / Err

# Type Alias: Err\<E\>

> **Err**\<`E`\> = `object`

Defined in: lib/result.ts:7

Creates a failed [Result](Result.md). Check `result.ok` or `result.err` before accessing `err`.

## Param

The error value.

## Type Parameters

| Type Parameter |
| ------ |
| `E` |

## Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="data"></a> `data` | `undefined` | lib/result.ts:9 |
| <a id="err"></a> `err` | `E` | lib/result.ts:10 |
| <a id="ok"></a> `ok` | `false` | lib/result.ts:8 |
