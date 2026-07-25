'use client';

import { useFieldScrollDriver } from '@/hooks/useFieldDrivers';

/**
 * Mounts the scroll → field-state driver for the current route.
 *
 * A component rather than a hook call in the page so that pages themselves can
 * stay server components: only this leaf needs to be client-side. Rendered once
 * per page that has `[data-field-state]` sections.
 */
export function FieldScrollDriver() {
  useFieldScrollDriver();
  return null;
}
