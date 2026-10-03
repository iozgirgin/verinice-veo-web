/*
 * verinice.veo web - Copyright (C) 2026 DataGood contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from 'vitest';
import { createI18n } from 'vue-i18n';
import tr from '../../locales/base/tr.json';
import en from '../../locales/base/en.json';
import fixture from '../fixtures/ui-turkish-cases.json';

const i18n = createI18n({ legacy: false, locale: 'tr', fallbackLocale: 'en', messages: { tr, en } });
describe('Turkish global UI messages', () => {
  it.each(fixture.cases)('$caseId', ({ key, params, expected }) => {
    expect(i18n.global.t(key, params || {})).toEqual(expected);
  });
});
