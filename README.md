# Bigcommerce management API client and JWT authenticator

[![CI](https://github.com/kernelpanic99/bc-api-client/actions/workflows/ci.yml/badge.svg)](https://github.com/kernelpanic99/bc-api-client/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/bc-api-client)](https://www.npmjs.com/package/bc-api-client)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node 22+](https://img.shields.io/badge/node-22%2B-brightgreen)](https://nodejs.org)

<span style="color:orange">V1 is a complete rewrite. See [Migration Guide](docs/V1_MIGRATION_GUIDE.md)</span>

An opinionated and minimalistic client focusing on simplicity and concurrent performance.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [API Client](#api-client)
  - [Authentication](#authentication)
- [API Reference](#api-reference)
  - [BigCommerceClient](#bigcommerceclient)
  - [BigCommerceAuth](#bigcommerceauth)
- [Tips](#tips)
- [License](#license)

## Features

- Node 22+, ESM only
- Built-in [Standard Schema](https://standardschema.dev/) validation support
- Basic API methods (get, post, put, delete)
- Rate limit handling and retries on transient errors
- High-performance concurrency utilities:
  - Async generator streams
  - Automatic concurrency backoff on 429 and 5xx
  - V3 envelope pagination
  - V2 "blind" pagination until 404, 204 or a given page limit
- App authenticator module. Request token and verify JWT.

## Installation

```bash
npm install bc-api-client
# or
pnpm add bc-api-client
# or
yarn add bc-api-client
```

## Usage

See the [full usage guide](docs/USAGE.md) for all methods and options.

### API Client

```typescript
import { BigCommerceClient } from "bc-api-client";
import z from "zod";

// Using zod as the most popular one, but any validator supporting [StandardSchema](https://standardschema.dev/) will work
const productSchema = z.object({
    id: z.int().positive(),
    name: z.string(),
    sku: z.string(),
    inventory_level: z.int().nonnegative(),
});

const fields = Object.keys(productSchema.shape);

const client = new BigCommerceClient({
    storeHash: "your-store-hash",
    accessToken: "your-access-token",
});

// Basic GET request — response is typed automatically
const { data: product } = await client.get("/catalog/products/123", {
    responseSchema: z.object({ data: productSchema }),
    query: { include_fields: fields },
});

console.log(`Got product: ${product.name}`);

// Paginate v3 collection concurrently with async generator
for await (const { err, data: product } of client.stream("/catalog/products", {
    itemSchema: productSchema,
})) {
    if (err) {
        console.error("Something went wrong", err);
    } else {
        console.log(`Fetched product: ${product.name}`);
    }
}
```

### Authentication

```typescript
import { BigCommerceAuth } from "bc-api-client";

const auth = new BigCommerceAuth({
    clientId: "your-client-id",
    secret: "your-client-secret",
    redirectUri: "your-redirect-uri",
});

// Request token
const token = await auth.requestToken(authQuery);

// Verify JWT
const claims = await auth.verify(jwtPayload, "your-store-hash");
```

## API Reference

- [BigCommerceClient](/docs/api/classes/BigCommerceClient.md)
- [BigCommerceAuth](/docs/api/classes/BigCommerceAuth.md)

## Tips

- This library is built for real-time integrations on enterprise stores. If you're on a lower-tier plan, concurrency can do more harm than good (throttling). Note that some endpoints have explicit concurrency limits; always check the BC docs. **Use at your own risk.**
- Utilize `include_fields` when available and define simplified schemas with only the fields you need. This significantly improves request speed and keeps autocomplete clean.
- Use `query` to fetch resources by a large list of values, e.g. products by a list of IDs or customers by a list of emails. It works around the max URL size limitation.
- By default, the client will not wait more than 120 seconds for a rate limit to reset. For longer waits, pass `retry: { maxRetryAfter: <ms> }` to the constructor.

## License

MIT
