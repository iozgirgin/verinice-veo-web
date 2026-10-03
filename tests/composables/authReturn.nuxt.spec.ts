/*
 * verinice.veo web - Copyright (C) 2026 DataGood contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, expect, it, vi } from 'vitest';
// Bypass the shared test setup's automatic user stub.
const { useVeoUser } = await vi.importActual<typeof import('../../composables/VeoUser')>('../../composables/VeoUser');
import fixture from '../fixtures/auth-return-cases.json';
const mocks = vi.hoisted(() => ({
  init: vi.fn().mockResolvedValue(false),
  login: vi.fn().mockResolvedValue(undefined),
  loadUserProfile: vi.fn().mockResolvedValue({})
}));
vi.mock('keycloak-js', () => ({
  default: class {
    authenticated = false;
    init = mocks.init;
    login = mocks.login;
    loadUserProfile = mocks.loadUserProfile;
  }
}));

// Call the real authentication composable; mock only the provider transport.
let user: ReturnType<typeof useVeoUser>;
const Harness = {
  setup() {
    user = useVeoUser();
    return () => null;
  }
};
describe('Authentication return to synthetic application routes', () => {
  it('initializes query response mode so callback parameters do not occupy the application tab', async () => {
    const wrapper = await mountSuspended(Harness);
    await user.initialize({
      $config: { public: { oidcUrl: 'http://localhost:8781', oidcRealm: 'datagood-local', oidcClient: 'datagood-web' } }
    });
    expect(mocks.init).toHaveBeenCalledWith({
      onLoad: 'check-sso',
      responseMode: fixture.expectedResponseMode,
      silentCheckSsoRedirectUri: window.location.origin + '/sso',
      checkLoginIframe: false
    });
    wrapper.unmount();
  });
  it.each(fixture.cases)('$caseId preserves the complete requested return path', async (testCase) => {
    mocks.login.mockClear();
    await user.login(testCase.destination ?? undefined);
    expect(mocks.login).toHaveBeenCalledExactlyOnceWith({
      redirectUri: window.location.origin + (testCase.destination || '/'),
      scope: 'openid'
    });
  });
});
