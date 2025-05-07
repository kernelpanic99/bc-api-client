# Bigcommerce management API client and JWT authenticator


<span style="color:orange">THIS LIBRARY IS NOT READY FOR PRODUCTION!!!</span>

An opinionated and minimalistic client focusing on simplicity and performance.
Features (or antifeatures - depends on your opinion)
- Node 20+ LTS, ESM
- Bring Your Own Types
- Basic API methods (get, post, put, delete)
- Advanced methods for concurrent querying and fetching
- All methods are generic
- Rate limit handling
- App authenticator module. Request token and verify JWT.

## Installation

```bash
npm install bigcommerce-client
# or
pnpm add bigcommerce-client
# or
yarn add bigcommerce-client
```

## Usage

### API Client

```typescript
import { BigCommerceClient, V3Response } from 'bigcommerce-client';

type MyProduct = {
    name: string,
    sku: string,
    inventory_level: number,
}

const fields = 'name,sku,inventory_level';

const client = new BigCommerceClient({
  storeHash: 'your-store-hash',
  accessToken: 'your-access-token'
});

// Basic GET request
const products = await client.get<V3Response<MyProduct[]>>({
  endpoint: 'catalog/products',
  query: { 'include_fields': fields },
});

// Low level concurrent requests
const results = await client.concurrent<never, V3Response<MyProduct>>(
  [
    { method: 'GET', endpoint: 'catalog/products/1', query: { include_fields: fields }},
    { method: 'GET', endpoint: 'catalog/products/2', query: { include_fields: fields }},
  ],
  10 // concurrency limit
);

// Collect all pages
const allProducts = await client.collect<MyProduct>({
  endpoint: 'catalog/products',
  query: {
    include_fields: fields,
  },
});
```

### Authentication

```typescript
import { BigCommerceAuth } from 'bigcommerce-client';

const auth = new BigCommerceAuth({
  clientId: 'your-client-id',
  secret: 'your-client-secret',
  redirectUri: 'your-redirect-uri',
  storeHash: 'your-store-hash'
});

// Request token
const token = await auth.requestToken(authQuery);

// Verify JWT
const claims = await auth.verify(jwtPayload);
```

## API

### BigCommerceClient

#### `get<R>(options: GetOptions): Promise<R>`
Makes a GET request to the BigCommerce API.

#### `post<T, R>(options: PostOptions<T>): Promise<R>`
Makes a POST request to the BigCommerce API.

#### `put<T, R>(options: PostOptions<T>): Promise<R>`
Makes a PUT request to the BigCommerce API.

#### `delete<R>(endpoint: string): Promise<void>`
Makes a DELETE request to the BigCommerce API.

#### `concurrent<T, R>(requests: RequestOptions<T>[], concurrency = 10): Promise<R[]>`
Executes multiple requests concurrently with rate limit handling.

#### `collect<T>(options: Omit<GetOptions, 'version'>, concurrency = 10): Promise<T[]>`
Automatically fetches all pages of a paginated endpoint. Only works with v3 endpoints.

### BigCommerceAuth

#### `requestToken(data: string | AuthQuery): Promise<TokenResponse>`
Requests an access token from BigCommerce OAuth.

#### `verify(jwtPayload: string): Promise<Claims>`
Verifies a JWT payload from BigCommerce.

## License

MIT

