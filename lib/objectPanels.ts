/*
 * verinice.veo web - Copyright (C) 2026 DataGood contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
/** Collapsed states for the information/form pair; compact screens show one panel. */
export function compactObjectPanels(states: boolean[], previous: boolean[]): boolean[] {
  if (states[0] !== states[1]) return [...states];
  return [!previous[0], !previous[1]];
}
