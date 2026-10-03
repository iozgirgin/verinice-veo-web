/*
 * verinice.veo web - Copyright (C) 2026 DataGood contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import { describe, expect, it, vi } from 'vitest';
import TutorialButton from '~/components/layout/TutorialButton.vue';
import fixture from '../fixtures/tutorial-help-cases.json';
const state = vi.hoisted(() => ({ count: 0, visible: false, load: vi.fn(), stop: vi.fn() }));
vi.mock('~/composables/intro', () => ({
  useTutorials: () => ({
    tutorialsForRoute: Array.from({ length: state.count }, (_, index) => ({ id: index })),
    visible: state.visible,
    load: state.load,
    stop: state.stop
  })
}));
mockNuxtImport('useI18n', () => () => ({ t: () => 'Bağlamsal yardımı göster' }));
const Tooltip = { template: '<div><slot name="activator" :props="{}" /></div>' };
const Button = { props: ['disabled'], template: '<button :disabled="disabled"><slot /></button>' };

describe('Contextual help start and stop controls', () => {
  it.each(fixture.buttonCases)('$caseId', async (testCase) => {
    state.count = testCase.count;
    state.visible = testCase.visible;
    state.load.mockClear();
    state.stop.mockClear();
    const wrapper = await mountSuspended(TutorialButton, {
      global: { stubs: { VTooltip: Tooltip, VBtn: Button, VIcon: true } }
    });
    const button = wrapper.get('button');
    expect((button.element as HTMLButtonElement).disabled).toBe(testCase.disabled);
    await button.trigger('click');
    expect(state.load).toHaveBeenCalledTimes(testCase.action === 'load' ? 1 : 0);
    expect(state.stop).toHaveBeenCalledTimes(testCase.action === 'stop' ? 1 : 0);
    wrapper.unmount();
  });
});
