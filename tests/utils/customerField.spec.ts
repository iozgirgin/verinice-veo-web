/*
 * verinice.veo web - Copyright (C) 2026 DataGood contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { expect, it } from 'vitest';
import { customerField } from '../../lib/customerField';
import fixture from '../fixtures/tutorial-help-cases.json';
it.each(fixture.customerFieldCases)('$caseId', (testCase) => {
  expect(customerField(testCase.fields || undefined, testCase.locale, testCase.fallback)).toBe(testCase.expected);
});
