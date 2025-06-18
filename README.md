# Bigcommerce management API client and JWT authenticator

<span style="color:orange">BETA VERSION - Use at your own risk</span>

An opinionated and minimalistic client focusing on simplicity and concurrent performance.
Features (or antifeatures - depends on your opinion)
- Node 20+ LTS, ESM
- Bring Your Own Types
- Basic API methods (get, post, put, delete)
- Advanced methods for concurrent querying and fetching
- All methods are generic
- Rate limit handling
- App authenticator module. Request token and verify JWT.

⚠️ **Disclaimer**: This library provides concurrent request capabilities. BigCommerce has strict rate limits that vary by plan and endpoint. The author is not responsible for any issues arising from improper API usage. Use at your own risk.

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
  - [API Client](#api-client)
  - [Authentication](#authentication)
- [API](#api)
  - [BigCommerceClient](#bigcommerceclient)
  - [BigCommerceAuth](#bigcommerceauth)
- [Tips](#tips)
- [License](#license)

## Installation

```bash
npm install bc-api-client
# or
pnpm add bc-api-client
# or
yarn add bc-api-client
```

## Usage

### API Client

```typescript
import { BigCommerceClient, V3Response } from 'bigcommerce-client';
import { bc } from 'bigcommerce-client/endpoints';

type MyProduct = {
    id: number;
    name: string;
    sku: string;
    inventory_level: number;
}

const fields = 'id,name,sku,inventory_level';

const client = new BigCommerceClient({
  storeHash: 'your-store-hash',
  accessToken: 'your-access-token'
});

// Basic GET request
const products = await client.get<V3Response<MyProduct[]>>(bc.products.path, {
  query: { 'include_fields': fields },
});

// Low level concurrent requests with error handling
const results = await client.concurrent<never, V3Response<MyProduct>>(
  [
    { method: 'GET', endpoint: bc.products.byId(1), query: { include_fields: fields }},
    { method: 'GET', endpoint: bc.products.byId(2), query: { include_fields: fields }},
  ],
  { 
    concurrency: 10,
    skipErrors: true // Optional: skip failed requests instead of throwing
  }
);

// Collect all pages from v3 endpoint
const allProducts = await client.collect<MyProduct>(bc.products.path, {
  query: {
    include_fields: fields,
  },
  concurrency: 10, // Optional: control concurrent requests
  skipErrors: true // Optional: skip failed requests
});

// Collect all pages from v2 endpoint
type MyOrder = {
    id: number;
    status: string;
}

const orders = await client.collectV2<MyOrder>(bc.orders.v2.path, {
  query: {
    limit: '5',
  },
  concurrency: 10, // Optional: control concurrent requests
  skipErrors: true // Optional: skip failed requests
});

// Query with multiple filter values
// Note: productIds would be a large array of IDs in a real scenario
const productIds = [1, 2, 3, 4, 5]; // Example IDs

const filteredProducts = await client.query<MyProduct>(bc.products.path, {
  key: 'id:in',
  values: productIds,
  query: {
    include_fields: fields,
  },
  concurrency: 10, // Optional: control concurrent requests
  skipErrors: true // Optional: skip failed requests
});
```

### Authentication

```typescript
import { BigCommerceAuth } from 'bigcommerce-client';

const auth = new BigCommerceAuth({
  clientId: 'your-client-id',
  secret: 'your-client-secret',
  redirectUri: 'your-redirect-uri',
});

// Request token
const token = await auth.requestToken(authQuery);

// Verify JWT
const claims = await auth.verify(jwtPayload, 'your-store-hash');
```

## API

### BigCommerceClient

#### Constructor
```typescript
new BigCommerceClient(config: {
    storeHash: string;
    accessToken: string;
    maxRetries?: number;      // default: 5
    maxDelay?: number;        // default: 60000 (1 minute)
    concurrency?: number;     // default: 10
    skipErrors?: boolean;     // default: false
    logger?: Logger;          // optional
})
```

#### `get<R>(endpoint: string, options?: GetOptions): Promise<R>`
Makes a GET request to the BigCommerce API.
- `endpoint`: The API endpoint to request
- `options.query`: Query parameters to include in the request
- `options.version`: API version to use (v2 or v3, default: v3)

#### `post<T, R>(endpoint: string, options?: PostOptions<T>): Promise<R>`
Makes a POST request to the BigCommerce API.
- `endpoint`: The API endpoint to request
- `options.query`: Query parameters to include in the request
- `options.version`: API version to use (v2 or v3, default: v3)
- `options.body`: Request body data of type `T`

#### `put<T, R>(endpoint: string, options?: PostOptions<T>): Promise<R>`
Makes a PUT request to the BigCommerce API.
- `endpoint`: The API endpoint to request
- `options.query`: Query parameters to include in the request
- `options.version`: API version to use (v2 or v3, default: v3)
- `options.body`: Request body data of type `T`

#### `delete<R>(endpoint: string, options?: Pick<GetOptions, 'version'>): Promise<void>`
Makes a DELETE request to the BigCommerce API.
- `endpoint`: The API endpoint to delete
- `options.version`: API version to use (v2 or v3, default: v3)

#### `concurrent<T, R>(requests: RequestOptions<T>[], options?: ConcurrencyOptions): Promise<R[]>`
Executes multiple requests concurrently with rate limit handling.
- `requests`: Array of request options to execute
- `options.concurrency`: Maximum number of concurrent requests (default: 10)
- `options.skipErrors`: Whether to skip errors and continue processing (the errors will be logged if logger is provided), default: false)

#### `concurrentSettled<T, R>(requests: RequestOptions<T>[], options?: Pick<ConcurrencyOptions, 'concurrency'>): Promise<PromiseSettledResult<R>[]>`
Lowest level concurrent request method. This method executes requests in chunks and returns bare PromiseSettledResult objects. Use this method if you need to handle errors in a custom way.
- `requests`: Array of request options to execute
- `options.concurrency`: Maximum number of concurrent requests (default: 10)

#### `collect<T>(endpoint: string, options: Omit<GetOptions, 'version'> & ConcurrencyOptions): Promise<T[]>`
Automatically fetches all pages of a paginated v3 endpoint. Pulls the first page and uses pagination meta to collect remaining pages concurrently.
- `endpoint`: The API endpoint to request
- `options.query`: Query parameters to include in the request (limit defaults to 250)
- `options.concurrency`: Maximum number of concurrent requests (default: 10)
- `options.skipErrors`: Whether to skip errors and continue processing (default: false)

#### `collectV2<T>(endpoint: string, options: Omit<GetOptions, 'version'> & ConcurrencyOptions): Promise<T[]>`
Automatically fetches all pages of a paginated v2 endpoint. Pulls all pages concurrently until a 204 is returned.
- `endpoint`: The API endpoint to request
- `options.query`: Query parameters to include in the request (limit defaults to 250)
- `options.concurrency`: Maximum number of concurrent requests (default: 10)
- `options.skipErrors`: Whether to skip errors and continue processing (default: false)

#### `query<T>(endpoint: string, options: QueryOptions): Promise<T[]>`
Queries multiple values against a single field using the v3 API. If the URL + query params are too long, the query will be chunked.
- `endpoint`: The API endpoint to request
- `options.key`: The field name to query against (e.g. 'id:in')
- `options.values`: Array of values to query for
- `options.query`: Additional query parameters (limit defaults to 250)
- `options.concurrency`: Maximum number of concurrent requests (default: 10)
- `options.skipErrors`: Whether to skip errors and continue processing (default: false)

### BigCommerceAuth

#### Constructor
```typescript
new BigCommerceAuth(config: {
    clientId: string;
    secret: string;
    redirectUri: string;
    scopes?: string[];        // optional
    logger?: Logger;          // optional
})
```

#### `requestToken(data: string | UrlSearchParams | AuthQuery): Promise<TokenResponse>`
Requests an access token from BigCommerce OAuth.

#### `verify(jwtPayload: string, storeHash: string): Promise<Claims>`
Verifies a JWT payload from BigCommerce.

## Tips

- I made this library based on my experience of building real-time integrations. It might not be the best choice if you just need to make simple requests or want built-in types. Also, if you're not on enterprise - you can't realistically get much benefit from concurrency, so this library can offer zero to negative (getting throttled) benefit. Check out [this client](https://github.com/kzhang-dsg/bigcommerce-api-client) for a more extensive solution with much better DX. You can also use that library as a source of types and this one for concurrency if you don't mind having two installed.
- Be careful with concurrent methods as they might get you flagged, especially if you are not working with enterprise stores (which I mostly do). Also, some endpoints have explicit concurrency limits. Check the documentation.
- Utilize `include_fields` when available and make simplified types to include only the properties you need. This will increase the speed and efficiency of the requests significantly and improve DX as your autocomplete won't be cluttered.
- Use `query` if you need to fetch, for example, customers from a list of emails, or products from a list of SKUs.
- This library will not wait for a rate limit longer than 60 seconds by default. I mostly work on real-time applications, so it doesn't make sense to wait longer for me. If you need a longer timeout, pass `maxDelay` to the `BigCommerceClient` constructor.
- Be careful with endpoints. I populated them manually from the docs and ran them through Claude as a double-check. You can make an issue if something throws a 404, and use the string meanwhile. Also, some may be missing - always check the documentation for your request.

## License

MIT

