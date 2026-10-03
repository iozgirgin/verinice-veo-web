/*
 * verinice.veo web - Copyright (C) 2026 DataGood contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from 'vitest';
import { calculateNis2Timeline, NIS2_RULE_VERSION } from '../../lib/nis2Timeline';
import fixture from '../fixtures/nis2-timeline-cases.json';

describe('NIS2 article 23 preview with independent canonical expectations', () => {
  it.each(fixture.cases)('$caseId', (testCase) => {
    const before = JSON.stringify(testCase.input);
    const result = calculateNis2Timeline(testCase.input, Date.parse(testCase.now));
    const expected = testCase.expected as any;
    expect(result.state).toBe(expected.state);
    expect(result.ruleVersion).toBe(fixture.ruleVersion);
    expect(NIS2_RULE_VERSION).toBe(fixture.ruleVersion);
    if (expected.rowCount !== undefined) expect(result.rows).toHaveLength(expected.rowCount);
    for (const [stage, due] of Object.entries(expected.due || {}))
      expect(result.rows.find((row) => row.stage === stage)?.due).toBe(due);
    for (const [stage, status] of Object.entries(expected.status || {}))
      expect(result.rows.find((row) => row.stage === stage)?.status).toBe(status);
    for (const error of expected.errors || []) expect(result.errors).toContain(error);
    expect(JSON.stringify(testCase.input)).toBe(before);
  });
});
