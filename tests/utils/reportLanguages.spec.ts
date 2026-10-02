/*
 * verinice.veo web - Copyright (C) 2026 DataGood contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from 'vitest';
import { getReportLanguages } from '../../lib/reportLanguages';
import fixture from '../fixtures/report-language-cases.json';

describe('report language availability', () => {
  it.each(fixture.cases)('$caseId', ({ name, expected }) => {
    expect(getReportLanguages(name as Record<string, string>)).toEqual(expected);
  });
});
