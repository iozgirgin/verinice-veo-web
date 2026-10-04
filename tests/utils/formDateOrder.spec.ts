/*
 * verinice.veo web - Copyright (C) 2026 DataGood contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from 'vitest';
import fixture from '../fixtures/kvkk-form-chronology.json';
import { dateOrderErrors } from '../../lib/formDateOrder';
import { JsonPointer } from '../../lib/jsonPointer';

describe('recorded form date order', () => {
  it.each(fixture.cases)('$caseId rejects the later field preceding its anchor', (testCase) => {
    const data = {};
    JsonPointer.set(data, testCase.rule.before, testCase.before);
    JsonPointer.set(data, testCase.rule.after, testCase.after);
    const errors = dateOrderErrors(data, [testCase.rule], fixture.translations.tr);
    expect(errors.size).toBe(testCase.errorCount);
    expect([...errors.values()][0]).toEqual([
      fixture.translations.tr[testCase.rule.message as keyof typeof fixture.translations.tr]
    ]);
    expect([...errors.keys()][0]).toContain('/properties/');
  });

  const rule = fixture.forms.DataSubjectRequest[1];
  function data(first: unknown, second: unknown) {
    return { customAspects: { kvkkRequest: { receivedAt: first, respondedAt: second } } };
  }

  it('compares instants across UTC offsets and allows equality', () => {
    expect(
      dateOrderErrors(data('2026-01-05T08:00:00Z', '2026-01-05T11:00:00+03:00'), [rule], fixture.translations.tr).size
    ).toBe(0);
    expect(
      dateOrderErrors(data('2026-01-05T08:00:00Z', '2026-01-05T10:59:59+03:00'), [rule], fixture.translations.tr).size
    ).toBe(1);
  });

  it.each([undefined, null, '', 'not-an-instant', 123])(
    'leaves optional or invalid formats to schema validation: %s',
    (value) => {
      expect(dateOrderErrors(data(value, '2026-01-05T08:00:00Z'), [rule], fixture.translations.tr).size).toBe(0);
      expect(dateOrderErrors(data('2026-01-05T08:00:00Z', value), [rule], fixture.translations.tr).size).toBe(0);
    }
  );

  it('does not infer chronology rules for other forms', () => {
    expect(dateOrderErrors(data('2026-01-05T08:00:00Z', '2026-01-05T07:00:00Z')).size).toBe(0);
  });

  it('recomputes after correcting the date without mutating form data', () => {
    const original = data('2026-01-05T08:00:00Z', '2026-01-05T07:00:00Z');
    const snapshot = JSON.stringify(original);
    expect(dateOrderErrors(original, [rule], fixture.translations.tr).size).toBe(1);
    expect(JSON.stringify(original)).toBe(snapshot);
    original.customAspects.kvkkRequest.respondedAt = '2026-01-05T09:00:00Z';
    expect(dateOrderErrors(original, [rule], fixture.translations.tr).size).toBe(0);
  });

  it('does not bypass invalid configuration or missing translations', () => {
    expect(() => dateOrderErrors({}, [{ ...rule, after: 'invalid' }], fixture.translations.tr)).toThrow();
    expect(() => dateOrderErrors(data('2026-01-05T08:00:00Z', '2026-01-05T07:00:00Z'), [rule], {})).toThrow();
  });
});
