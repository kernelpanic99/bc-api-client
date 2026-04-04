[**bc-api-client**](../../../../README.md)

***

[bc-api-client](../../../../README.md) / [StandardSchemaV1](../README.md) / Props

# Interface: Props\<Input, Output\>

Defined in: lib/standard-schema.ts:9

The Standard Schema properties interface.

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `Input` | `unknown` |
| `Output` | `Input` |

## Properties

| Property | Modifier | Type | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="types"></a> `types?` | `readonly` | [`Types`](Types.md)\<`Input`, `Output`\> | Inferred types associated with the schema. | lib/standard-schema.ts:20 |
| <a id="validate"></a> `validate` | `readonly` | (`value`, `options?`) => [`Result`](../type-aliases/Result.md)\<`Output`\> \| `Promise`\<[`Result`](../type-aliases/Result.md)\<`Output`\>\> | Validates unknown input values. | lib/standard-schema.ts:15 |
| <a id="vendor"></a> `vendor` | `readonly` | `string` | The vendor name of the schema library. | lib/standard-schema.ts:13 |
| <a id="version"></a> `version` | `readonly` | `1` | The version number of the standard. | lib/standard-schema.ts:11 |
