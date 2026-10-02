/*
 * verinice.veo web - Copyright (C) 2026 DataGood contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
/** Report names declare the languages accepted by the reporting service. */
export function getReportLanguages(names: Record<string, string>): string[] {
  const languages = Object.keys(names).filter((language) => !!names[language]);
  return languages.length ? languages : ['en'];
}
