/*
 * verinice.veo web - Copyright (C) 2026 DataGood contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import { describe, expect, it, vi } from 'vitest';
import Entrypoint from '~/components/dynamic-form/Entrypoint.vue';
import fixture from '../../fixtures/kvkk-form-chronology.json';

mockNuxtImport('useVeoReactiveFormActions', () => () => ({ defaultReactiveFormActions: () => ({}) }));
mockNuxtImport('useVeoErrorFormatter', () => () => ({
  formatErrors: () => new Map([['#/properties/name', ['schema error']]])
}));
vi.mock('~/components/dynamic-form/controls/Control', () => ({
  default: { name: 'DateControl', props: ['modelValue'], emits: ['update:model-value'], template: '<div />' }
}));

const rule = fixture.forms.DataSubjectRequest[1];
const schema = { type: 'object', properties: { name: { type: 'string' }, customAspects: { type: 'object' } } };
const base = {
  customAspects: { kvkkRequest: { receivedAt: '2026-01-05T08:00:00Z', respondedAt: '2026-01-05T07:00:00Z' } }
};
const form = { type: 'Control', scope: '#/properties/name', options: { dateOrderRules: [rule] } };

describe('form date order validation integration', () => {
  it('reports invalid dates before the parent-model debounce completes', async () => {
    const wrapper = await mountSuspended(Entrypoint, {
      props: {
        modelValue: {
          customAspects: { kvkkRequest: { ...base.customAspects.kvkkRequest, respondedAt: '2026-01-05T09:00:00Z' } }
        },
        objectSchema: schema,
        formSchema: form,
        translations: { tr: fixture.translations.tr },
        locale: 'tr'
      }
    });
    wrapper
      .findComponent({ name: 'DateControl' })
      .vm.$emit(
        'update:model-value',
        '#/properties/customAspects/properties/kvkkRequest/properties/respondedAt',
        '2026-01-05T07:00:00Z',
        '2026-01-05T09:00:00Z'
      );
    expect(wrapper.emitted('update:valid')!.at(-1)).toEqual([false]);
    expect(wrapper.emitted('update:model-value')).toBeUndefined();
    wrapper.unmount();
  });
  it('emits invalid and field errors, then clears them when corrected', async () => {
    const wrapper = await mountSuspended(Entrypoint, {
      props: {
        modelValue: base,
        objectSchema: schema,
        formSchema: form,
        translations: { tr: fixture.translations.tr },
        locale: 'tr'
      }
    });
    expect(wrapper.emitted('update:valid')!.at(-1)).toEqual([false]);
    expect((wrapper.emitted('update:messages')!.at(-1)![0] as Map<string, string[]>).size).toBe(1);
    await wrapper.setProps({
      modelValue: {
        customAspects: { kvkkRequest: { ...base.customAspects.kvkkRequest, respondedAt: '2026-01-05T09:00:00Z' } }
      }
    });
    expect(wrapper.emitted('update:valid')!.at(-1)).toEqual([true]);
    expect((wrapper.emitted('update:messages')!.at(-1)![0] as Map<string, string[]>).size).toBe(0);
    wrapper.unmount();
  });

  it('preserves existing schema errors alongside chronology errors', async () => {
    const wrapper = await mountSuspended(Entrypoint, {
      props: {
        modelValue: { ...base, name: 42 },
        objectSchema: schema,
        formSchema: form,
        translations: { tr: fixture.translations.tr },
        locale: 'tr'
      }
    });
    const errors = wrapper.emitted('update:messages')!.at(-1)![0] as Map<string, string[]>;
    expect(errors.get('#/properties/name')).toEqual(['schema error']);
    expect(errors.size).toBe(2);
    expect(wrapper.emitted('update:valid')!.at(-1)).toEqual([false]);
    wrapper.unmount();
  });

  it('validates when form rules load after the data', async () => {
    const wrapper = await mountSuspended(Entrypoint, {
      props: {
        modelValue: base,
        objectSchema: schema,
        formSchema: { ...form, options: {} },
        translations: { tr: fixture.translations.tr },
        locale: 'tr'
      }
    });
    expect(wrapper.emitted('update:valid')!.at(-1)).toEqual([true]);
    await wrapper.setProps({ formSchema: form });
    expect(wrapper.emitted('update:valid')!.at(-1)).toEqual([false]);
    wrapper.unmount();
  });
});
