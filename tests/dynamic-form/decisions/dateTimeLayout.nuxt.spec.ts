/*
 * verinice.veo web - Copyright (C) 2026 DataGood contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import { describe, expect, it, vi } from 'vitest';
import { createI18n } from 'vue-i18n';
import InputDateTime from '~/components/dynamic-form/controls/InputDateTime.vue';
import fixture from '../../fixtures/kvkk-date-time-cases.json';
const i18n = vi.hoisted(() => ({ instance: undefined as any }));
mockNuxtImport('useI18n', () => () => i18n.instance.global);

describe('Date/time control preserves recorded timestamps in its responsive layout', () => {
  it.each(fixture.cases)('$caseId retains both inputs and the timestamp', async (testCase) => {
    i18n.instance = createI18n({ legacy: false, locale: 'tr', messages: { tr: { hint: '{0}' } } });
    const wrapper = await mountSuspended(InputDateTime, {
      props: {
        modelValue: testCase.timestamp,
        objectSchema: { type: 'string', format: 'date-time' },
        objectSchemaPointer: '#/properties/customAspects/properties/kvkkRequest/properties/' + testCase.field,
        valuePointer: '/customAspects/kvkkRequest/' + testCase.field,
        formSchemaPointer: '/elements/2',
        errors: new Map(),
        options: { visible: true, label: testCase.label, required: false }
      }
    });
    expect(wrapper.classes()).toContain('d-flex');
    expect(wrapper.classes()).toContain('flex-wrap');
    const date = wrapper.find('input[type=date]');
    const time = wrapper.find('input[type=time]');
    const local = new Date(testCase.timestamp);
    expect((date.element as HTMLInputElement).value).toBe(
      `${local.getFullYear()}-${String(local.getMonth() + 1).padStart(2, '0')}-${String(local.getDate()).padStart(2, '0')}`
    );
    expect((time.element as HTMLInputElement).value.startsWith(String(local.getHours()).padStart(2, '0'))).toBe(true);
    expect(wrapper.emitted('update:model-value')).toBeUndefined();
    wrapper.unmount();
  });
});
