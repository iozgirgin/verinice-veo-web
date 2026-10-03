/* SPDX-License-Identifier: AGPL-3.0-or-later */
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import { describe, expect, it, vi } from 'vitest';
import { reactive, ref, nextTick } from 'vue';
import { createI18n } from 'vue-i18n';
import Widget from '~/components/widget/MyLatestRevisions.vue';
import messages from '~/locales/base/components/widget-my-latest-revisions.json';
import fixture from '../../fixtures/domain-navigation-cases.json';
const state = vi.hoisted(() => ({
  i18n: undefined as any,
  route: undefined as any,
  revisions: undefined as any,
  domains: undefined as any
}));
mockNuxtImport('useI18n', () => () => state.i18n.global);
mockNuxtImport('useRoute', () => () => state.route);
mockNuxtImport('useLatestRevisions', () => () => ({ data: state.revisions }));
mockNuxtImport('useDomains', () => () => ({ data: state.domains }));

describe('Revision widget domain context', () => {
  it('DOMAIN-NAV-UI-09 preserves the selected domain for a shared record and reacts to selector changes', async () => {
    state.i18n = createI18n({ legacy: false, locale: 'tr', messages });
    state.route = reactive({ params: { unit: fixture.unitId, domain: fixture.domains[1].id } });
    state.revisions = ref([fixture.baseRevision]);
    state.domains = ref(fixture.domains);
    const wrapper = await mountSuspended(Widget);
    expect(wrapper.find('a').attributes('href')).toBe(fixture.cases[0].expected!.url);
    expect(wrapper.text()).toContain('KVKK (sentetik)');
    expect(wrapper.text()).toContain(messages.tr.unitScope);
    state.route.params.domain = fixture.domains[0].id;
    await nextTick();
    expect(wrapper.find('a').attributes('href')).toBe(fixture.cases[1].expected!.url);
    expect(wrapper.text()).toContain('ISO 27001 (sentetik)');
    wrapper.unmount();
  });
  it('DOMAIN-NAV-UI-10 does not create a misleading link while domain data is unavailable', async () => {
    state.i18n = createI18n({ legacy: false, locale: 'tr', messages });
    state.route = reactive({ params: { unit: fixture.unitId, domain: fixture.domains[1].id } });
    state.revisions = ref([fixture.baseRevision]);
    state.domains = ref(undefined);
    const wrapper = await mountSuspended(Widget);
    expect(wrapper.findAll('a')).toHaveLength(0);
    expect(wrapper.text()).toContain(fixture.baseRevision.content.name);
    state.domains.value = fixture.domains;
    await nextTick();
    expect(wrapper.find('a').attributes('href')).toBe(fixture.cases[0].expected!.url);
    wrapper.unmount();
  });
});
