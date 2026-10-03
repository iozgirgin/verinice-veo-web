/*
 * verinice.veo web - Copyright (C) 2026 DataGood contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import { describe, expect, it, vi } from 'vitest';
import Entrypoint from '~/components/dynamic-form/Entrypoint.vue';
import fixture from '../../fixtures/bcm-form-cases.json';

mockNuxtImport('useVeoReactiveFormActions', () => () => ({ defaultReactiveFormActions: () => ({}) }));
mockNuxtImport('useVeoErrorFormatter', () => () => ({ formatErrors: () => new Map() }));
vi.mock('~/components/dynamic-form/controls/Control', () => ({
  default: { name: 'RecoveryControl', props: ['modelValue'], emits: ['update:model-value'], template: '<div />' }
}));

describe('Pending form changes before saving', () => {
  it('BCM-UI-FAST-SAVE-09 flushes the newest value before the debounce interval', async () => {
    const wrapper = await mountSuspended(Entrypoint, {
      props: {
        modelValue: { rpo: 'PT30M' },
        objectSchema: { type: 'object', properties: { rpo: { type: 'string' } } },
        formSchema: { type: 'Control', scope: '#/properties/rpo' }
      }
    });
    wrapper
      .findComponent({ name: 'RecoveryControl' })
      .vm.$emit('update:model-value', '#/properties/rpo', fixture.fastSaveCase.value, 'PT30M');
    expect(wrapper.emitted('update:model-value')).toBeUndefined();
    (wrapper.vm as any).flushPendingUpdates();
    expect(wrapper.emitted('update:model-value')![0][0]).toEqual({ rpo: 'PT1M' });
    wrapper.unmount();
  });
});
