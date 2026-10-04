/*
 * verinice.veo web - Copyright (C) 2026 DataGood contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { JsonPointer } from './jsonPointer';

export interface DateOrderRule {
  before: string;
  after: string;
  message: string;
}

/** Optional recorded dates are compared as instants, independently of display timezone. */
export function dateOrderErrors(
  data: unknown,
  rules: DateOrderRule[] = [],
  translations: Record<string, unknown> = {}
): Map<string, string[]> {
  const errors = new Map<string, string[]>();
  for (const rule of rules) {
    for (const pointer of [rule.before, rule.after]) {
      if (!/^\/[^/~]+(?:~[01][^/~]*)*(?:\/[^/~]+(?:~[01][^/~]*)*)*$/.test(pointer)) {
        throw new Error('Invalid date order field pointer');
      }
    }
    const first = JsonPointer.get(data, rule.before);
    const second = JsonPointer.get(data, rule.after);
    // Missing values are optional. Invalid formats remain handled by JSON schema validation.
    if (typeof first !== 'string' || typeof second !== 'string' || !first || !second) continue;
    const start = Date.parse(first);
    const end = Date.parse(second);
    if (!Number.isFinite(start) || !Number.isFinite(end) || start <= end) continue;
    const pointer =
      '#' +
      rule.after
        .split('/')
        .slice(1)
        .map((part) => '/properties/' + part)
        .join('');
    const message = translations[rule.message];
    if (typeof message !== 'string' || !message) throw new Error('Missing date order message translation');
    const existing = errors.get(pointer) || [];
    if (!existing.includes(message)) existing.push(message);
    errors.set(pointer, existing);
  }
  return errors;
}
