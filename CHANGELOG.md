# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.4] - 2025-12-22

Versions 0.1.1 through 0.1.4 were attempts to setup publishing via OIDC. No functional changes here.
Good news is that now this library is a lot more resistand to the likes of Shai-Hulud.
I disabled token publishing completely so the only way to publish is via CI.

*Note to myself and anyone interested: Don't forget to bump your npm version to 11.5.1 or later for OIDC to work*

## [0.1.0] - 2025-12-17

### Changed

- Allow query option in `delete` method

## [0.1.0-beta.27] - 2025-11-01

### Added

- Custom base URL configuration support via `baseUrl` option in client config
- Tests for custom base URL configuration

## [0.1.0-beta.26] - 2025-08-08

### Changed

- Added more data to error logs for better debugging

## [0.1.0-beta.25] - 2025-08-02

### Changed

- Restructured CI/CD action steps

## [0.1.0-beta.24] - 2025-08-02

### Changed

- CI debugging improvements

## [0.1.0-beta.23] - 2025-08-02

### Changed

- CI authentication debugging

## [0.1.0-beta.22] - 2025-08-02

### Changed

- Added `--no-git-checks` flag to pnpm publish step in CI

## [0.1.0-beta.21] - 2025-08-02

### Changed

- Removed environment validation for CI

## [0.1.0-beta.20] - 2025-08-02

### Added

- GitHub Actions workflow for automated publishing

## [0.1.0-beta.19] - 2025-07-10

### Added

- Logging to the `BigCommerceClient.concurrentSettled` to better monitor the concurrent fetching progress

### Changed

- Ran prettier for the entire project
- Brought the changelog up to speed and fixed some formatting in the code blocks

## [0.1.0-beta.18] - 2025-07-09

### Fixed

- Updated `chunkStrLength` and `BigCommerceClient.query` methods to account for url encoding while chunking the url.
- Adjust the live test to fetch by sku, to better cover the encoding case

## [0.1.0-beta.17] - 2025-06-23

### Added

- An endpoint variable for '/catalog/trees/categories'

## [0.1.0-beta.16] - 2025-06-19

### Changed

- Instead of response body, log request body when the request fails

## [0.1.0-beta.15] - 2025-06-19

### Added

- Additonal details to the error data in `safeRequest` method. Specifically endpoint, query and body of the request

## [0.1.0-beta.14] - 2025-06-18

### Added

- new method `concurrentSettled` to perform concurrent requests. Unlike `concurrent` this one simply returns bare responses from `Promise.allSettled`.

### Changed

- `concurrent` now uses `concurrentSettled` under the hood
- Minor documentation edits

## [0.1.0-beta.13] - 2025-05-26

### Changed

- Options argument is not required for collect methods anymore

## [0.1.0-beta.12] - 2025-05-25

### Changed

- `BigCommerceAuth.requestToken` added explicit return type and adjusted type inference

## [0.1.0-beta.11] - 2025-05-25

### Changed

- Improved error handling in token requests with better error messages and logging
- Added detailed error information from BigCommerce responses
- Enhanced error chaining for better debugging

## [0.1.0-beta.10] - 2025-05-25

### Breaking changes

- `BigCommerceAuth` constructor does not require `storeHash` anymore
- `BigCommerceAuth.verify` method now requires `storeHash` as second argument

**Migration guide:**

```ts
// before
const client = new BigCommerceAuth({
    clientId: 'test',
    secret: 'test',
    redirectUri: 'http://localhost:3000/bc/auth',
    storeHash: 'hash',
});

client.verify('jwt_payload');

// after
const client = new BigCommerceAuth({
    clientId: 'test',
    secret: 'test',
    redirectUri: 'http://localhost:3000/bc/auth',
});

client.verify('jwt_payload', 'hash');
```

### Changed

- Update documentation for `BigCommerceAuth` constructor to include the exact required params
- Update auth.test.ts according to new changes
- Update documentation for `BigCommerceAuth` and `BigCommerceClient` constructors
- Update api documentation section in README to include constructors

## [0.1.0-beta.9] - 2025-05-25

### Changed

- `BigCommerceAuth.requestToken` can now accept `UrlSearchParams` instance

## [0.1.0-beta.8] - 2025-05-10

### Changed

- Improved logging throughout the codebase:
    - Added generic logging interface
    - Add logging to basic request functions
    - Added logging for authentication operations
    - Added logging for concurrent methods

### Added

- Added Pino logger configuration in tests to showcase usage of a custom logger

## [0.1.0-beta.7] - 2025-05-09

### Changed

- Removed Remeda dependency in favor of native JavaScript array methods

## [0.1.0-beta.6] - 2025-05-09

### Added

- Concurrency options to `Config` for `BigCommerceClient`
- The use of client level options as fallback to concurrency methods
- Some tips and concurrency disclaimer to README.md

### Changed

- More detailed JSDoc for `BigCommerceClient` methods
- Updated API documentation section in README.md

## [0.1.0-beta.5] - 2025-05-09

### Breaking Changes

- Changed method signatures to accept endpoint as first argument for better API consistency:

    - `get<R>(endpoint: string, options?: GetOptions): Promise<R>`
    - `post<T, R>(endpoint: string, options?: PostOptions<T>): Promise<R>`
    - `put<T, R>(endpoint: string, options?: PostOptions<T>): Promise<R>`
    - `delete<R>(endpoint: string, options?: Pick<GetOptions, 'version'>): Promise<void>`
    - `collect<T>(endpoint: string, options: Omit<GetOptions, 'version'> & ConcurrencyOptions): Promise<T[]>`
    - `collectV2<T>(endpoint: string, options: Omit<GetOptions, 'version'> & ConcurrencyOptions): Promise<T[]>`
    - `query<T>(endpoint: string, options: QueryOptions): Promise<T[]>`

    Migration guide:

    ```typescript
    // Old
    client.get({ endpoint: '/products', query: { limit: '10' } });
    client.post({ endpoint: '/products', body: { name: 'Test' } });

    // New
    client.get('/products', { query: { limit: '10' } });
    client.post('/products', { body: { name: 'Test' } });
    ```
