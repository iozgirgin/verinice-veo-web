/*
 * verinice.veo web - Copyright (C) 2026 DataGood contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from 'vitest';
import { getReportTargetFilter, isReportTargetAllowed } from '../../lib/reportTargets';
import fixture from '../fixtures/report-target-cases.json';

describe('report target constraints', () => {
  it.each(fixture.selections)('$caseId', ({ targets, requested, expected }) => {
    expect(getReportTargetFilter(targets, requested.objectType, requested.subType)).toEqual({
      objectType: expected.objectType ?? undefined,
      subType: expected.subType ?? undefined
    });
  });
  it.each(fixture.eligibility)('$caseId', ({ modelType, subType, expected }) => {
    expect(isReportTargetAllowed(fixture.workflowTargets, modelType, subType)).toBe(expected);
  });
});
