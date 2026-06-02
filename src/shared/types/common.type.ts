/**
 * Types shared across multiple modules.
 * Module-specific types belong in src/modules/<name>/types/<name>.type.ts.
 * Only add to this file when a type is genuinely used by two or more modules.
 */
export interface SelectOption {
  id: number
  name: string
}
