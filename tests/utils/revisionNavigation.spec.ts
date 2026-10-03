/* SPDX-License-Identifier: AGPL-3.0-or-later */
import { describe, expect, it } from 'vitest';
import { revisionTarget } from '~/lib/revisionNavigation';
import fixture from '../fixtures/domain-navigation-cases.json';

describe('Unit and domain aware revision navigation', () => {
  it.each(fixture.cases)('$caseId opens the intended domain without changing source data', (testCase) => {
    const before = JSON.stringify(testCase);
    expect(
      revisionTarget(testCase.revision as any, testCase.unitId, testCase.selectedDomainId, testCase.availableDomainIds)
    ).toEqual(testCase.expected ?? undefined);
    expect(JSON.stringify(testCase)).toBe(before);
  });
});
