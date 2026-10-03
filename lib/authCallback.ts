/*
 * verinice.veo web - Copyright (C) 2026 DataGood contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
/** Synchronize the router after the adapter has accepted a standard-flow callback. */
export function cleanAuthenticationReturn(fullPath: string): string {
  const url = new URL(fullPath, 'http://localhost');
  if (!url.searchParams.has('code') || !url.searchParams.has('state') || !url.searchParams.has('iss')) return fullPath;
  for (const key of ['code', 'state', 'session_state', 'iss', 'kc_action_status', 'kc_action'])
    url.searchParams.delete(key);
  return url.pathname + url.search + url.hash;
}
