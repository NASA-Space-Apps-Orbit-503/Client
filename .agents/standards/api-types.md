# API type standard

API contract types belong in `app/types/api/`, separate from application and UI types
stored directly in `app/types/`.

Create one kebab-case file per API entity, matching the service entity name:
`app/types/api/<entity-name>.ts`. Each file must:

- Import generated OpenAPI types from `#open-fetch-schemas/api`.
- Export aliases for the entity's response schemas and creation request bodies.
- Export explicit query parameter types for every operation that accepts query parameters.
- Keep shared types owned by the relevant entity instead of declaring them in services.
- Avoid duplicating generated response schemas or using `any`.

Services and consumers must import API types from `~/types/api/<entity-name>`. When the
OpenAPI contract changes, regenerate Nuxt types before updating these aliases.
