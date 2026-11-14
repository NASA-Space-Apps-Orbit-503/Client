# API service standard

Create one service file per API entity under `app/services/<entity-name>.service.ts`, using
kebab-case for compound entity names. Every service must expose a named default object:

```ts
const EntityService = {
  async method() {
    // ...
  }
}

export default EntityService
```

Service methods must:

- Use types from `~/types/api/<entity-name>` for responses, request bodies, and queries.
- Check `useMocksEnabled()` before making an API request and return the matching mock when
  mocks are enabled.
- Use the generated `$api` client for real requests with contract-defined routes, methods,
  path/query parameters, request bodies, and headers.
- Preserve CSV response handling and `content-type` headers where defined by the contract.

Consumers must import the service default object and call methods through it, for example
`EntityService.list()`. Do not import service methods as standalone named exports.
