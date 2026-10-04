/*
 * verinice.veo web - Copyright (C) 2026 DataGood contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { VeoElementTypePlurals } from '~/types/VeoTypes';
import type { IVeoLegacyObjectHistoryEntry } from '~/types/history';

export function revisionTarget(
  revision: IVeoLegacyObjectHistoryEntry,
  unitId: string,
  selectedDomainId: string,
  availableDomainIds: string[]
): { url: string; domainId: string } | undefined {
  const content = revision?.content;
  if (!unitId || content?.owner?.id !== unitId || !content?.id) return;
  const domains = content.domains || {};
  // A domain dashboard must never fall back to a different standard or regulation.
  if (!Object.hasOwn(domains, selectedDomainId) || !availableDomainIds.includes(selectedDomainId)) return;
  const domainId = selectedDomainId;
  const objectType = VeoElementTypePlurals[content.type as keyof typeof VeoElementTypePlurals];
  if (!domainId || !objectType || !domains[domainId]?.subType) return;
  const segments = [unitId, 'domains', domainId, objectType, domains[domainId].subType, content.id];
  return { url: '/' + segments.map(encodeURIComponent).join('/') + '/', domainId };
}
