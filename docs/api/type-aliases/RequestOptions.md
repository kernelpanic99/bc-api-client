[**bc-api-client**](../README.md)

***

[bc-api-client](../README.md) / RequestOptions

# Type Alias: RequestOptions\<TBody, TRes, TQuery\>

> **RequestOptions**\<`TBody`, `TRes`, `TQuery`\> = `BaseKyRequest` & `QuerySchemaOptions`\<`TQuery`\> & `BodySchemaOptions`\<`TBody`\> & `object`

Defined in: lib/request.ts:44

## Type Declaration

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `method` | [`HttpMethod`](HttpMethod.md) | lib/request.ts:47 |
| `responseSchema?` | `StandardSchemaV1`\<`TRes`\> | lib/request.ts:49 |
| `version?` | [`ApiVersion`](ApiVersion.md) | lib/request.ts:48 |

## Type Parameters

| Type Parameter |
| ------ |
| `TBody` |
| `TRes` |
| `TQuery` *extends* [`Query`](Query.md) |
