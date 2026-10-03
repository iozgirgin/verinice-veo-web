/*
 * verinice.veo web - Copyright (C) 2026 DataGood contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
export interface ReportTargetType {
  modelType: string;
  subTypes?: string[] | null;
}

/** Keep both selections within the report metadata, including URL-supplied filters. */
export function getReportTargetFilter(targets: ReportTargetType[], modelType?: unknown, subType?: unknown) {
  const target = targets.find((entry) => entry.modelType === modelType) || targets[0];
  const allowed = target?.subTypes || [];
  return {
    objectType: target?.modelType,
    subType:
      allowed.length ?
        allowed.includes(subType as string) ?
          (subType as string)
        : allowed[0]
      : undefined
  };
}

export function isReportTargetAllowed(targets: ReportTargetType[], modelType: string, subType: string) {
  return targets.some(
    (entry) => entry.modelType === modelType && (!entry.subTypes?.length || entry.subTypes.includes(subType))
  );
}
