[**bc-api-client**](../../../../README.md)

***

[bc-api-client](../../../../README.md) / [StandardSchemaV1](../README.md) / SuccessResult

# Interface: SuccessResult\<Output\>

Defined in: lib/standard-schema.ts:27

The result interface if validation succeeds.

## Type Parameters

| Type Parameter |
| ------ |
| `Output` |

## Properties

| Property | Modifier | Type | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="issues"></a> `issues?` | `readonly` | `undefined` | A falsy value for `issues` indicates success. | lib/standard-schema.ts:31 |
| <a id="value"></a> `value` | `readonly` | `Output` | The typed output value. | lib/standard-schema.ts:29 |
