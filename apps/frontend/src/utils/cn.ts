/**
 * PURPOSE: Tiny className combinator (falsy-safe join) used by every UI
 * primitive instead of pulling in clsx/tailwind-merge as a new dependency.
 * DEPENDENCIES: none
 */

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
