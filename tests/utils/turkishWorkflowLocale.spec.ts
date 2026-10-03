/*
 * verinice.veo web - Copyright (C) 2026 DataGood contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from 'vitest';
import { createI18n } from 'vue-i18n';
import { baseCompile } from '@intlify/message-compiler';
import { readFileSync } from 'node:fs';
import fixture from '../fixtures/ui-workflow-cases.json';

const locales = new URL('../../locales/', import.meta.url);
const read = (file: string) => JSON.parse(readFileSync(new URL(file, locales), 'utf8'));
const strings = (data: Record<string, unknown>): string[] =>
  Object.values(data).flatMap((value) =>
    typeof value === 'string' ? [value] : strings(value as Record<string, unknown>)
  );

describe('Turkish workflow message syntax and real i18n rendering', () => {
  it('compiles every Turkish JSON message with the production message compiler', () => {
    const messages = [
      ...strings(read('base/tr.json')),
      ...Object.values(import.meta.glob('../../locales/base/**/*.json', { eager: true, import: 'default' }))
        .filter((locale: any) => locale.en && locale.tr)
        .flatMap((locale: any) => strings(locale.tr)),
      ...fixture.translatedDomainFiles.flatMap((file) => strings(read(file.replace('/en.json', '/tr.json'))))
    ];
    expect(messages).toHaveLength(fixture.expectedJsonMessageCount);
    for (const message of messages) {
      const errors: unknown[] = [];
      baseCompile(message, { onError: (error) => errors.push(error) });
      expect(errors, message).toEqual([]);
    }
  });
  it.each(fixture.cases)('$caseId', (testCase) => {
    const data = read(testCase.file);
    const tr = data.tr || data;
    const i18n = createI18n({ legacy: false, locale: 'tr', fallbackLocale: false, messages: { tr } });
    const params = testCase.list.length ? testCase.list : testCase.params;
    const actual =
      testCase.plural === null ?
        i18n.global.t(testCase.key, params)
      : i18n.global.t(testCase.key, params, testCase.plural);
    expect(actual).toBe(testCase.expected);
  });
});
