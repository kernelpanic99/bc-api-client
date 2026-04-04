[**bc-api-client**](../README.md)

***

[bc-api-client](../README.md) / RequestOptions

# Type Alias: RequestOptions\<TBody, TRes, TQuery\>

> **RequestOptions**\<`TBody`, `TRes`, `TQuery`\> = `BaseKyRequest` & `QuerySchemaOptions`\<`TQuery`\> & `BodySchemaOptions`\<`TBody`\> & `object`

Defined in: lib/request.ts:47

## Type Declaration

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `method` | [`HttpMethod`](HttpMethod.md) | lib/request.ts:50 |
| `responseSchema?` | [`StandardSchemaV1`](../interfaces/StandardSchemaV1.md)\<`TRes`\> | lib/request.ts:52 |
| `version?` | [`ApiVersion`](ApiVersion.md) | lib/request.ts:51 |

## Type Parameters

| Type Parameter |
| ------ |
| `TBody` |
| `TRes` |
| `TQuery` *extends* [`Query`](Query.md) |
