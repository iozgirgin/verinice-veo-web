/*
 * verinice.veo web - Copyright (C) 2026 DataGood contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
/** Customer configurations can predate an added UI language. Empty links stay empty. */
export function customerField(fields: Record<string, string> | undefined, locale: string, fallback = ''): string {
  return [fields?.[locale], fields?.en, ...Object.values(fields || {})].find((value) => value?.trim()) || fallback;
}
