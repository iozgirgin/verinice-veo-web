/*
 * verinice.veo web - Copyright (C) 2026 DataGood contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { expect, it } from 'vitest';
import { localizeText } from '../../lib/localizeText';
import fixture from '../fixtures/ui-message-fallback-cases.json';
it.each(fixture.cases)('$caseId', ({ messages, locale, expected }) => {
  expect(localizeText(messages as Record<string, string>, locale)).toEqual(expected);
});
