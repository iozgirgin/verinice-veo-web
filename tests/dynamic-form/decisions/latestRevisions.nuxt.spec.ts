/* SPDX-License-Identifier: AGPL-3.0-or-later */
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { expect, it, vi } from 'vitest';
import { reactive, ref } from 'vue';
import { useLatestRevisions } from '~/composables/requests/useHistory';
import fixture from '../../fixtures/domain-navigation-cases.json';
const state = vi.hoisted(() => ({ route: undefined as any, options: undefined as any, read: vi.fn() }));
mockNuxtImport('useRoute', () => () => state.route);
vi.mock('vue-query-v5', () => ({
  useQuery: (options: any) => {
    state.options = options;
    return {};
  }
}));
vi.mock('~/requests/crud', () => ({ read: state.read }));

it('DOMAIN-NAV-CACHE-11 uses distinct reactive unit keys and paths, disabling requests without a unit', async () => {
  state.route = reactive({ params: { unit: fixture.unitId } });
  const explicitUnit = ref('');
  useLatestRevisions(explicitUnit);
  const unitKey = state.options.queryKey[1].unitId;
  expect(unitKey.value).toBe(fixture.unitId);
  await state.options.queryFn();
  expect(state.read).toHaveBeenLastCalledWith({ path: 'history/revisions/my-latest?owner=/units/' + fixture.unitId });
  const otherUnit = fixture.cases[4].unitId;
  state.route.params.unit = otherUnit;
  expect(unitKey.value).toBe(otherUnit);
  await state.options.queryFn();
  expect(state.read).toHaveBeenLastCalledWith({ path: 'history/revisions/my-latest?owner=/units/' + otherUnit });
  explicitUnit.value = fixture.unitId;
  expect(unitKey.value).toBe(fixture.unitId);
  explicitUnit.value = '';
  state.route.params.unit = '';
  expect(state.options.enabled.value).toBe(false);
});
