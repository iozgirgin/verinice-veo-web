/*
 * verinice.veo web - Copyright (C) 2026 DataGood contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
/** Server messages may not contain the newly selected UI language. */
export function localizeText(messages: Record<string, string>, locale: string): string {
  return (
    [messages[locale], messages.en, ...Object.values(messages)].find((text) => text?.trim()) ||
    (locale === 'tr' ? 'Sistem bildirimi' : 'System message')
  );
}
