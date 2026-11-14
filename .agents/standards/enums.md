# Enum and static-list standard

Avoid hardcoded strings for reusable static lists. When a list represents a fixed set of
values, create an enum under `app/enums/` instead of repeating string literals throughout
components, composables, pages, services, or types.

Enum files must:

- Use kebab-case names with the `.enum.ts` extension:
  `app/enums/<enum-name>.enum.ts`.
- Export a clearly named enum whose name ends with the `Enum` suffix, such as
  `export enum StatusEnum`.
- Keep values aligned with the API contract when the list is API-defined.
- Be imported and reused wherever the static list is needed.
- Not be created for genuinely dynamic data or a one-off display string.

When an API schema defines an enum, preserve the generated API type in
`app/types/api/`; use an application enum from `app/enums/` when the values are also needed
as a reusable runtime list for UI or application logic.
