/*
 * verinice.veo web - Copyright (C) 2026 DataGood contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from 'vitest';
import { compactObjectPanels } from '~/lib/objectPanels';
import fixture from '../fixtures/mobile-object-cases.json';

describe('Compact object information/form navigation', () => {
  it.each(fixture.panelCases)('$caseId leaves exactly one panel open', (testCase) => {
    const original = JSON.stringify(testCase);
    const result = compactObjectPanels(testCase.requested, testCase.previous);
    expect(result).toEqual(testCase.expected);
    expect(result.filter((collapsed) => !collapsed)).toHaveLength(1);
    expect(JSON.stringify(testCase)).toBe(original);
  });
});
