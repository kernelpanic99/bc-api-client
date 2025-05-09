# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0-beta.6] - 2024-05-09

### Added
- Concurrency options to `Config` for `BigCommerceClient`
- The use of client level options as fallback to concurrency methods
- Some tips and concurrency disclaimer to README.md

### Changed
- More detailed JSDoc for `BigCommerceClient` methods
- Updated API documentation section in README.md

## [0.1.0-beta.5] - 2024-05-09

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
  client.get({ endpoint: '/products', query: { limit: '10' } })
  client.post({ endpoint: '/products', body: { name: 'Test' } })
  
  // New
  client.get('/products', { query: { limit: '10' } })
  client.post('/products', { body: { name: 'Test' } })
  ``` 