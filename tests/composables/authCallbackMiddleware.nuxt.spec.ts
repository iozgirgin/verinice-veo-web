/*
 * verinice.veo web - Copyright (C) 2026 DataGood contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import { describe, expect, it, vi } from 'vitest';
import fixture from '../fixtures/auth-return-cases.json';
const state = vi.hoisted(() => ({ authenticated: { value: true }, navigate: vi.fn() }));
vi.mock('~/composables/VeoUser', () => ({
  useVeoUser: () => ({ authenticated: state.authenticated, keycloakInitialized: { value: true }, initialize: vi.fn() })
}));
vi.mock('~/composables/VeoPermissions', () => ({
  useVeoPermissions: () => ({ ability: { value: { cannot: () => false } } })
}));
mockNuxtImport('navigateTo', () => state.navigate);
const { default: middleware } = await vi.importActual<typeof import('../../middleware/authentication.global')>(
  '../../middleware/authentication.global'
);
const Harness = {
  setup() {
    return () => null;
  }
};
const route = (fullPath: string) => {
  const url = new URL(fullPath, 'http://localhost');
  return { path: url.pathname, fullPath, query: Object.fromEntries(url.searchParams), name: 'units' } as any;
};
describe('Actual authentication middleware callback routing', () => {
  it('replaces the accepted callback path with the same object tab', async () => {
    const wrapper = await mountSuspended(Harness);
    state.authenticated.value = true;
    state.navigate.mockClear();
    await middleware(route(fixture.callbackCases[0].path), {} as any);
    expect(state.navigate).toHaveBeenCalledExactlyOnceWith(fixture.callbackCases[0].expected, { replace: true });
    wrapper.unmount();
  });
  it('sends an unauthenticated request to login without treating its query as accepted', async () => {
    const wrapper = await mountSuspended(Harness);
    state.authenticated.value = false;
    state.navigate.mockClear();
    await middleware(route(fixture.callbackCases[0].path), {} as any);
    expect(state.navigate).toHaveBeenCalledExactlyOnceWith({
      path: '/login',
      query: { redirect_uri: fixture.callbackCases[0].path }
    });
    wrapper.unmount();
  });
  it('keeps an ordinary authenticated state query unchanged', async () => {
    const wrapper = await mountSuspended(Harness);
    state.authenticated.value = true;
    state.navigate.mockClear();
    await middleware(route(fixture.callbackCases[2].path), {} as any);
    expect(state.navigate).not.toHaveBeenCalled();
    wrapper.unmount();
  });
});
