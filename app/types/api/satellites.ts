/**
 * Satellite catalog entry.
 *
 * The OpenAPI contract does not define a satellites endpoint or schema yet (only the `satellite`
 * query filter, a comma-separated list of codes). Replace this type with the generated alias,
 * `components['schemas']['Satellite']`, once the contract includes it.
 */
export interface Satellite {
  id: number
  /** Code accepted by the API `satellite` filter (FIRMS naming), e.g. `N20`. */
  code: string
  name: string
  /** Code of the instrument on board, e.g. `VIIRS`. */
  instrument: string
}
