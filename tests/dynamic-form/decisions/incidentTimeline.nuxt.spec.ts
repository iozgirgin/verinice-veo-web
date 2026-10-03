/*
 * verinice.veo web - Copyright (C) 2026 DataGood contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import { describe, expect, it, vi } from 'vitest';
import { createI18n } from 'vue-i18n';
import IncidentTimeline, { CONTROL_DEFINITION } from '~/components/dynamic-form/controls/IncidentTimeline.vue';
import messages from '~/locales/base/components/dynamic-form-controls-incident-timeline.json';
import fixture from '../../fixtures/nis2-timeline-cases.json';
const state = vi.hoisted(() => ({ i18n: undefined as any }));
mockNuxtImport('useI18n', () => () => state.i18n.global);
const props = {
  objectSchema: { type: 'object' },
  objectSchemaPointer: '#/properties/customAspects/properties/nis2Incident',
  valuePointer: '/customAspects/nis2Incident',
  formSchemaPointer: '/elements/3',
  options: { format: 'incident-timeline', visible: true, label: 'Bildirim takvimi önizlemesi' }
};

describe('Read-only incident preview', () => {
  it.each(fixture.localeCases)('renders the review state in $locale', async (testCase) => {
    state.i18n = createI18n({ legacy: false, locale: testCase.locale, fallbackLocale: 'en', messages });
    const wrapper = await mountSuspended(IncidentTimeline, {
      props: { ...props, modelValue: { ...fixture.baseRecord, applicability: 'REVIEW_PENDING' } }
    });
    expect(wrapper.text()).toContain(testCase.reviewRequired);
    expect(wrapper.findAll('time')).toHaveLength(0);
    wrapper.unmount();
  });
  it('matches the implicit object schema returned by the actual core custom aspect endpoint', () => {
    const coreSchema = fixture.objectSchemaCase.schema;
    expect(CONTROL_DEFINITION.conditions!({ ...props, objectSchema: coreSchema } as any).every(Boolean)).toBe(true);
    expect(CONTROL_DEFINITION.conditions!({ ...props, objectSchema: { type: 'string' } } as any).every(Boolean)).toBe(
      false
    );
  });
  it('renders UTC deadlines and recalculates trust-service profile without mutating the draft', async () => {
    state.i18n = createI18n({ legacy: false, locale: 'tr', fallbackLocale: 'en', messages });
    const before = JSON.stringify(fixture.baseRecord);
    const wrapper = await mountSuspended(IncidentTimeline, { props: { ...props, modelValue: fixture.baseRecord } });
    expect(wrapper.findAll('time').map((item) => item.attributes('datetime'))).toEqual([
      '2026-01-06T08:00:00.000Z',
      '2026-01-08T08:00:00.000Z',
      '2026-02-06T08:00:00.000Z'
    ]);
    expect(wrapper.text()).toContain('Gönderim üst süre sınırı içinde');
    await wrapper.setProps({ modelValue: { ...fixture.baseRecord, reportingProfile: 'TRUST_SERVICE_IMPACT' } });
    expect(wrapper.findAll('time')[1].attributes('datetime')).toBe('2026-01-06T08:00:00.000Z');
    expect(wrapper.findAll('input,select,textarea,button')).toHaveLength(0);
    expect(wrapper.emitted('update:model-value')).toBeUndefined();
    expect(JSON.stringify(fixture.baseRecord)).toBe(before);
    wrapper.unmount();
  });
  it('withholds deadlines until applicability is assessed and explains chronology errors', async () => {
    state.i18n = createI18n({ legacy: false, locale: 'tr', fallbackLocale: 'en', messages });
    const wrapper = await mountSuspended(IncidentTimeline, {
      props: { ...props, modelValue: { ...fixture.baseRecord, applicability: 'REVIEW_PENDING' } }
    });
    expect(wrapper.findAll('time')).toHaveLength(0);
    expect(wrapper.text()).toContain('Önce uygulanabilirlik');
    await wrapper.setProps({ modelValue: { ...fixture.baseRecord, earlyWarning: '2026-01-04T08:00:00Z' } });
    expect(wrapper.findAll('time')).toHaveLength(0);
    expect(wrapper.text()).toContain('Erken uyarı, farkına varılma zamanından önce.');
    wrapper.unmount();
  });
});
