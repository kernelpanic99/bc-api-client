# V0 -> V1 Migration guide

## Intro

V1 is a full rewrite, adding new features, improving stability and addressing some of the rushed decisions.

### Overview of the changes

- Networking refactor: most of the networking heavy lifting is now delegated to [ky](https://github.com/sindresorhus/ky) - a powerful HTTP client that backs this library. All the custom tweaks this library provides like 429 handling and custom concurrency backoff have been condensed into several, minimal ky hooks.

- Concurrency: `p-limit` has been introduced, replacing `Promise.all` based batching in legacy. This not only increases performance, but allows to control concurrency at runtime (e.g. drop to 1 on 429).

- The base batching primitive is now `AsyncGenerator`, allowing for full control and observability over batching process.

- `endpoints` module removed. These were populated manually and were significantly increasing maintenance scope of the library. This library is a thin transport client and should not be concerned with the api details.

- Query params are now generic. The type has been expanded significantly. StandardSchema validation also supported. Legacy query was `Record<string, string>`, which is compatible by default.

- Options structure rework:

  - Concurrency options now include configuration for the backoff mechanism. Pass `concurrency: false` to disable all concurrency machinery and get deterministic behavior.
  - `kyOptions` are removed. Constructor and methods now directly passthrough most of the ky options.
  - `skipErrors` - was a terrible design decision. The ability to partially process or handle errors dynamically is now exposed to the user via async generator methods.
  - runtime validation schema can now be passed for query, response and body. Runtime validation is completely opt-in and generic types will work just as before.

- Renamed methods/alternatives:

  - `concurrent` -> `batchStream` (async generator)
  - `concurrentSettled` -> `batchSafe`
  - `collectV2` -> `collectBlind`

- Methods added:

  - `stream` - async generator version of `collect`
  - `streamBlind` - async generator version of `collectBlind`
  - `queryStream` - async generator version of `query`

- Logging: The client will be initialized with a dummy console logger by default. `logger` options now accepts a log level which will be passed to default logger. Pass `logger: false` to disable logging completely.

- Errors: introduced a custom hierarchy of fully typed errors.

## Breaking changes

### `endpoints` module

`endpoints` module has been removed. Refer to the documentation for a desired api path.

**Before**

```ts
import { bc as endpoints } from 'bc-api-client/endpoints';

...

await client.get(endpoints.products.path);
```

**After**

```ts
await client.get('/catalog/products'); // Leading slash can be omitted
```

### Constructor

- `skipErrors` is removed, use async generators or `batchSafe` to observe and act on errors.
- `kyOptions` removed, most ky options can now be passed directly
- Without `logger: false` the client will use a dummy console logger at `info` level

**Before**

```ts
new BigCommerceClient({
    storeHash: 'hash',
    accessToken: 'hash',
    skipErrors: true,
    kyOptions: {
        timeout: 10000
    }
})
```

**After**

```ts
new BigCommerceClient({
    storeHash: 'hash',
    accessToken: 'hash',
    timeout: 10000,
    logger: false // Disable default logger (matches v0 behavior)
})
```

### Default logger

V0 had no default logger. V1 initializes a console logger at `info` level by default. If you have log aggregation in place and don't want the extra noise, explicitly opt out:

```ts
new BigCommerceClient({
    storeHash: 'hash',
    accessToken: 'token',
    logger: false,
})

```

### Generics

- Generic order has been inverted in method declarations. response -> body -> query vs body -> response (no query) in legacy.
- Defaults added to every generic.
- If runtime validation schema provided, the corresponding types will be inferred from the schema.

**Before**

```ts
type Response = {
    data: {
        id: number;
        name: string;
    };
};

const body = {
    name: "Test",
};

// Even though the body can be inferred here, still required to provide the first type
const res = await client.post<typeof body, Response>("test", { body });
```

**After**

```ts
type Response = {
    data: {
        id: number;
        name: string;
    };
};

const body = {
    name: "Test",
};

// All good, TBody has a default
const res = await client.post<Response>("/catalog/products", { body });

// Or
const responseSchema = z.object({
    data: z.object({
        id: z.int().positive(),
        name: z.string(),
    }),
});

// res inferred from the schema
const res = await client.post("/catalog/products", { body, responseSchema });
```

### concurrentSettled

- The direct counterpart to `concurrentSettled` is `batchSafe`, but with significant changes in the request and return shapes.
- The legacy method was returning an array of raw `PromiseSettledResult`s, new one returns a custom, spread friendly `Result` type.
- `request.endpoint` -> `request.path`
- A new utility added to construct request arrays in a typesafe manner - `req`

**Before**

```ts
const requests = [100, 101, 102, 103, 104].map((id) => ({
    method: "PUT" as const,
    endpoint: `/catalog/products/${id}`,
    body: { is_visible: true },
}));

const results = await client.concurrentSettled(requests);

for (const result of results) {
    if (result.status === "fulfilled") {
        // process result.value
    } else {
        // handle result.reason
    }
}
```

**After**

```ts
const requests = [100, 101, 102, 103, 104].map((id) =>
    req.put(`/catalog/products/${id}`, { body: { is_visible: true } }),
);

const results = await client.batchSafe(requests);

for (const { err, data } of results) {
    if (err) {
        //handle err
    } else {
        //process data
    }
}
```

### `concurrent`

`concurrent` was a dummy wrapper around `concurrentSettled`, which means it had to wait for all requests to complete, iterate an array of results and throw on first error encountered. The proper early exit can now be achieved with either of the async generators.

**Before**

```ts
const requests = [100, 101, 102, 103, 104].map((id) => ({
    method: "GET" as const,
    endpoint: `/catalog/products/${id}`,
}));

try {
    const products = await client.concurrent<never, { data: { id: number } }>(
        requests,
    );

    products.forEach(({ data }) => console.log(data.id));
} catch (err) {
    // handle err
}
```

**After**

```ts
const requests = [100, 101, 102, 103, 104].map((id) =>
    req.get<{ data: { id: number } }>(`/catalog/products/${id}`),
);

for await (const { err, data } of client.batchStream(requests)) {
    if (err) {
        console.error(err);
        // throw err
        // break
        // return
    } else {
        console.log(data.data.id);
    }
}
```

**Caveat:** If the requests mutate the remote, when the `for await` loop is exited, the in-flight request in the active concurrent batch, are aborted but may still commit the mutation. The results of such request are silently dropped. If you want truly deterministic behavior pass `concurrency: false` (you lose concurrency, naturally). This is still better than legacy, that was committing every request unconditionally.

### `collectV2`

Replaced by `collectBlind` and `streamBlind`:

- `streamBlind` - fetches v2 (flat array) endpoints like `/orders` until empty response (204/404)
- `collectBlind` - Direct counterpart to `collectV2`. Simple, convenience wraper for `streamBlind` above that returns all the items in an array and throws on first error (other than 404).

**Before**

```ts
const orders = await client.collectV2<{id: number; status: string;}>('/orders');
```

**After**

```ts
const orders = await client.collectBlind<{id: number; status: string;}>('/orders');
```

### `delete` — 404 no longer throws

V1 `delete` silently suppresses 404 responses (resource already gone) and logs a warning. Legacy threw `RequestError` with `status === 404`. If you relied on catching a 404 from `delete` to detect double-deletes, that signal is now lost.

**Before**

```ts
try {
    await client.delete(`/catalog/products/${id}`);
} catch (err) {
    if (err instanceof RequestError && err.status === 404) {
        console.log("Already deleted");
    }
}
```

**After**

```ts
// 404 is swallowed — no catch needed (and no catch possible)
await client.delete(`/catalog/products/${id}`);
```

### `collectBlind` / `streamBlind` — `maxPages` limit

`collectBlind` and `streamBlind` stop after **500 pages** by default and log a warning instead of continuing indefinitely. Pass `maxPages` to override.

```ts
// Fetch up to 2000 pages before stopping
const orders = await client.collectBlind("/orders", { maxPages: 2000 });
```

### `skipErrors`

`skipErrors` was an option for the constructor and some batch methods that would prompt the batch methods to simply warn an error with configured logger, and proceed execution. In combination with logging disabled by default it was a recipe for disaster. Async generators not only make this option redundant, but provide much better flexibility.

**Before**

```ts
const products = await client.collect<{ name: string }>("/catalog/products", {
    skipErrors: true,
});

products.forEach(({ name }) => console.log(`Fetched product: ${name}`));
```

**After**

```ts
for await (const { data: product, err } of client.stream<{ name: string }>(
    "/catalog/products",
)) {
    if (err) {
        console.warn("Failed to fetch products", err);
    } else {
        console.log(`Fetched product: ${product.name}`);
    }
}
```

### Errors

`RequestError` is replaced by a typed error hierarchy, all exported from `bc-api-client`. The most common migration touch point is HTTP errors: `RequestError` -> `BCApiError`, with `.status` moved to `.context.status`.

All errors extend `BaseError` and carry:

- `.code` - machine-readable string (e.g. `'BC_API_ERROR'`)
- `.context` - structured object with diagnostic data

**Before**

```ts
import { RequestError } from 'bc-api-client/net'; // was internal, not exported

try {
    await client.get("/catalog/products/999");
} catch (err) {
    if (err instanceof RequestError && err.status === 404) {
        console.log("Not found");
    }
}
```

**After**

```ts
import { BCApiError } from 'bc-api-client';

try {
    await client.get("/catalog/products/999");
} catch (err) {
    if (err instanceof BCApiError && err.context.status === 404) {
        console.log("Not found");
    }
}
```

Other errors you may want to handle: `BCTimeoutError` (request timed out), `BCResponseParseError` (malformed response body). Validation errors (`BCQueryValidationError`, `BCRequestBodyValidationError`, `BCResponseValidationError`, `BCPaginatedItemValidationError`) only fire when the corresponding `*Schema` options are passed.

## For contributors

Dev tooling has been overhauled.

- [Mise](https://mise.jdx.dev/) is used to bootstrap node and pnpm. See `.tool-versions`
- Both linter (eslint) and formatter (prettier) changed to [biome](https://biomejs.dev) (`pnpm lint [--unsafe]`)
- New build tool - [tsdown](https://tsdown.dev/) (`pnpm build`)
- [Attw](https://github.com/arethetypeswrong/arethetypeswrong.github.io) check is now part of the build
- Typecheck introduced via `@typescript/developer-preview`
- Dependencies upgraded to the latest versions available at the time of writing and hard locked.
- API documentation is generated in `docs/api` via [Typedoc](https://typedoc.org/) and [Markdown plugin](https://typedoc-plugin-markdown.org/) (`pnpm doc`)
- Pre-commit hook runs quality checks via [Lefthook](https://github.com/evilmartians/lefthook)
- CI: publish workflow updated to use mise action to bootstrap the setup above.
- CI: Added another action to run quality checks on prs and pushes.
