/*
 * verinice.veo web - Copyright (C) 2026 DataGood contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import { describe, expect, it, vi } from 'vitest';
import { createI18n } from 'vue-i18n';
import DecisionResults from '~/components/dynamic-form/controls/DecisionResults.vue';
import messages from '~/locales/base/components/dynamic-form-controls-input-duration.json';
import fixture from '../../fixtures/bcm-form-cases.json';
const state = vi.hoisted(() => ({ i18n: undefined as any }));
mockNuxtImport('useI18n', () => () => state.i18n.global);
const resultOptions = fixture.forms[0].content.elements.find((element: any) =>
  element.scope?.endsWith('/decisionResults')
)!.options;

describe('Read-only computed decision results', () => {
  it.each(fixture.displayCases)('$caseId renders real i18n durations without editable fields', async (testCase) => {
    state.i18n = createI18n({ legacy: false, locale: 'tr', fallbackLocale: 'en', messages });
    const before = JSON.stringify(testCase.results);
    const wrapper = await mountSuspended(DecisionResults, {
      props: {
        modelValue: testCase.results,
        objectSchema: { type: 'object', readOnly: true },
        options: { ...resultOptions, visible: true, label: 'Hesaplanan kurtarma hedefleri' },
        objectSchemaPointer: '#/properties/decisionResults',
        valuePointer: '/decisionResults',
        formSchemaPointer: '/elements/3'
      }
    });
    expect(wrapper.findAll('dd').map((cell) => cell.text())).toEqual(testCase.expected);
    expect(wrapper.findAll('dt').map((cell) => cell.text())).toEqual([
      'RTO — kurtarma süresi hedefi',
      'RPO — veri kaybı toleransı hedefi'
    ]);
    expect(wrapper.findAll('input, select, textarea, button')).toHaveLength(0);
    expect(wrapper.emitted('update:model-value')).toBeUndefined();
    expect(JSON.stringify(testCase.results)).toBe(before);
    wrapper.unmount();
  });
});
