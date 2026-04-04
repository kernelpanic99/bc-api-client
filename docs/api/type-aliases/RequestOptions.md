[**bc-api-client**](../README.md)

***

[bc-api-client](../README.md) / RequestOptions

# Type Alias: RequestOptions\<TBody, TRes, TQuery\>

> **RequestOptions**\<`TBody`, `TRes`, `TQuery`\> = `BaseKyRequest` & `QuerySchemaOptions`\<`TQuery`\> & `BodySchemaOptions`\<`TBody`\> & `object`

Defined in: lib/request.ts:59

Full request options for direct API calls.

## Type Declaration

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `method` | [`HttpMethod`](HttpMethod.md) | HTTP method for the request. | lib/request.ts:63 |
| `responseSchema?` | [`StandardSchemaV1`](../interfaces/StandardSchemaV1.md)\<`TRes`\> | Schema to validate the response body. | lib/request.ts:67 |
| `version?` | [`ApiVersion`](ApiVersion.md) | API version to use. Defaults to `'v3'`. | lib/request.ts:65 |

## Type Parameters

| Type Parameter |
| ------ |
| `TBody` |
| `TRes` |
| `TQuery` *extends* [`Query`](Query.md) |

## See

[GetOptions](GetOptions.md), [PostOptions](PostOptions.md), [PutOptions](PutOptions.md), [DeleteOptions](DeleteOptions.md)
