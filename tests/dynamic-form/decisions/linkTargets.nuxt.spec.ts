/*
 * verinice.veo web - Copyright (C) 2026 DataGood contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, expect, it, vi } from 'vitest';
import LinksField from '~/components/dynamic-form/controls/LinksField.vue';
import fixture from '../../fixtures/bcm-form-cases.json';

vi.mock('~/components/dynamic-form/controls/LinksFieldRow.vue', () => ({
  default: { props: ['modelValue', 'index'], emits: ['update:model-value'], template: '<div />' }
}));

describe('Link targets preserve recovery requirements', () => {
  it.each(fixture.linkTargetCases)(
    '$caseId preserves attributes and other rows without mutating input',
    async (testCase) => {
      const before = JSON.stringify(testCase.links);
      const wrapper = await mountSuspended(LinksField, {
        props: {
          modelValue: testCase.links,
          objectSchema: { type: 'array', items: { properties: { target: { type: 'object' } } } },
          options: { visible: true, label: 'Kaynak' },
          objectSchemaPointer: '#/properties/links/properties/recoveryRequirement',
          valuePointer: '/links/recoveryRequirement',
          formSchemaPointer: '/elements/8',
          errors: new Map()
        },
        global: { stubs: { DynamicFormControlsLinksFieldRow: true } }
      });
      (wrapper.vm as any).onLinksFieldRowInput(testCase.editedIndex, testCase.newTarget);
      const emitted = wrapper.emitted('update:model-value')![0][0] as any[];
      const original = testCase.links[testCase.editedIndex] as any;
      expect(emitted[testCase.editedIndex].target).toEqual(testCase.newTarget);
      expect(emitted[testCase.editedIndex].attributes).toEqual(original.attributes);
      testCase.links.forEach((link, index) => {
        if (index !== testCase.editedIndex) expect(emitted[index]).toEqual(link);
      });
      expect(JSON.stringify(testCase.links)).toBe(before);
      wrapper.unmount();
    }
  );
});
