/*
 * verinice.veo web - Copyright (C) 2026 DataGood contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { expect, it } from 'vitest';
import { cleanAuthenticationReturn } from '../../lib/authCallback';
import fixture from '../fixtures/auth-return-cases.json';
it.each(fixture.callbackCases)('$caseId', (testCase) => {
  expect(cleanAuthenticationReturn(testCase.path)).toBe(testCase.expected);
  expect(cleanAuthenticationReturn(testCase.expected)).toBe(testCase.expected);
});
