/*
 * verinice.veo web - Copyright (C) 2026 DataGood contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
export const NIS2_RULE_VERSION = 'EU-2022-2555-ART23-PREVIEW-1';
export type TimelineInput = Record<string, unknown>;
export type TimelineRow = {
  stage: 'earlyWarning' | 'notification' | 'progressReport' | 'finalReport';
  due: string | null;
  submitted: string | null;
  status: 'missingAnchor' | 'pending' | 'overdue' | 'withinLimit' | 'afterLimit';
};
export type TimelineResult = {
  state: 'reviewRequired' | 'notApplicable' | 'invalid' | 'ready';
  errors: string[];
  rows: TimelineRow[];
  ruleVersion: string;
};

// Require an explicit offset and reject JS Date's normalization of impossible dates.
export function parseIncidentInstant(value: unknown): number | null {
  if (typeof value !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day, hour, minute, second, , offset] = match;
  const y = Number(year),
    m = Number(month),
    d = Number(day);
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  if (
    y < 100 ||
    m < 1 ||
    m > 12 ||
    d < 1 ||
    d > days ||
    Number(hour) > 23 ||
    Number(minute) > 59 ||
    Number(second) > 59
  )
    return null;
  if (offset !== 'Z' && (Number(offset.slice(1, 3)) > 23 || Number(offset.slice(4)) > 59)) return null;
  const instant = Date.parse(value);
  return Number.isFinite(instant) ? instant : null;
}

// Calendar arithmetic uses the input's fixed offset; named-zone/DST rules require
// a jurisdiction profile. Clamp dates such as January 31 to the next month's end.
export function addIncidentCalendarMonth(value: string): string | null {
  if (parseIncidentInstant(value) === null) return null;
  const y = Number(value.slice(0, 4)),
    m = Number(value.slice(5, 7)),
    d = Number(value.slice(8, 10));
  const nextYear = m === 12 ? y + 1 : y;
  const nextMonth = m === 12 ? 1 : m + 1;
  const lastDay = new Date(Date.UTC(nextYear, nextMonth, 0)).getUTCDate();
  const civil = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(Math.min(d, lastDay)).padStart(2, '0')}${value.slice(10)}`;
  const instant = parseIncidentInstant(civil);
  return instant === null ? null : new Date(instant).toISOString();
}

export function calculateNis2Timeline(input: TimelineInput = {}, now = Date.now()): TimelineResult {
  const result: TimelineResult = { state: 'ready', errors: [], rows: [], ruleVersion: NIS2_RULE_VERSION };
  if (input.applicability === 'NOT_APPLIES' || input.significanceAssessment === 'NOT_SIGNIFICANT') {
    return { ...result, state: 'notApplicable' };
  }
  if (
    input.applicability !== 'APPLIES' ||
    input.significanceAssessment !== 'SIGNIFICANT' ||
    !['GENERAL', 'TRUST_SERVICE_IMPACT'].includes(String(input.reportingProfile))
  ) {
    return { ...result, state: 'reviewRequired' };
  }
  const fields = ['awareness', 'earlyWarning', 'notification', 'progressReport', 'finalReport', 'handlingCompleted'];
  const times: Record<string, number | null> = {};
  for (const key of fields) {
    const value = input[key];
    times[key] = value === undefined || value === null || value === '' ? null : parseIncidentInstant(value);
    if (value !== undefined && value !== null && value !== '' && times[key] === null)
      result.errors.push(`invalid:${key}`);
  }
  if (times.awareness === null) result.errors.push('missing:awareness');
  for (const key of fields.slice(1)) {
    if (times[key] !== null && times.awareness !== null && times[key]! < times.awareness)
      result.errors.push(`beforeAwareness:${key}`);
    if (times[key] !== null && times[key]! > now) result.errors.push(`future:${key}`);
  }
  if (times.awareness !== null && times.awareness > now) result.errors.push('future:awareness');
  for (const key of ['progressReport', 'finalReport']) {
    if (times[key] !== null && times.notification === null) result.errors.push(`missingNotification:${key}`);
    if (times[key] !== null && times.notification !== null && times[key]! < times.notification)
      result.errors.push(`beforeNotification:${key}`);
  }
  if (input.ongoingAtReportDue !== true && input.ongoingAtReportDue !== false)
    result.errors.push('missing:ongoingAtReportDue');
  if (input.ongoingAtReportDue === true && times.finalReport !== null && times.handlingCompleted === null)
    result.errors.push('missing:handlingCompleted');
  if (
    input.ongoingAtReportDue === true &&
    times.finalReport !== null &&
    times.handlingCompleted !== null &&
    times.finalReport < times.handlingCompleted
  )
    result.errors.push('beforeHandling:finalReport');
  if (result.errors.length) return { ...result, state: 'invalid' };
  const row = (stage: TimelineRow['stage'], due: string | null): TimelineRow => {
    const submitted = times[stage] === null ? null : new Date(times[stage]!).toISOString();
    return {
      stage,
      due,
      submitted,
      status:
        due === null ? 'missingAnchor'
        : submitted !== null ?
          times[stage]! <= Date.parse(due) ?
            'withinLimit'
          : 'afterLimit'
        : now > Date.parse(due) ? 'overdue'
        : 'pending'
    };
  };
  result.rows.push(row('earlyWarning', new Date(times.awareness! + 24 * 3600000).toISOString()));
  const hours = input.reportingProfile === 'TRUST_SERVICE_IMPACT' ? 24 : 72;
  result.rows.push(row('notification', new Date(times.awareness! + hours * 3600000).toISOString()));
  const monthAfterNotification =
    times.notification === null ? null : addIncidentCalendarMonth(String(input.notification));
  if (input.ongoingAtReportDue === true) {
    result.rows.push(row('progressReport', monthAfterNotification));
    result.rows.push(
      row(
        'finalReport',
        times.handlingCompleted === null ? null : addIncidentCalendarMonth(String(input.handlingCompleted))
      )
    );
  } else result.rows.push(row('finalReport', monthAfterNotification));
  return result;
}
