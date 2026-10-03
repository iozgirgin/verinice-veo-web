<!--
  verinice.veo web - Copyright (C) 2026 DataGood contributors
  SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
  <section v-if="options.visible" class="veo-decision-results" :aria-label="options.label">
    <h3 class="text-title-medium mb-2">{{ options.label }}</h3>
    <p v-if="options.description" class="text-body-medium mb-3">{{ localized(options.description) }}</p>
    <dl>
      <div v-for="row in options.results || []" :key="row.key" class="veo-decision-results__row">
        <dt>{{ localized(row.label) || row.key }}</dt>
        <dd>{{ displayValue(row) }}</dd>
      </div>
    </dl>
  </section>
</template>
<script lang="ts">
import type { IVeoFormsElementDefinition } from '../types';
export const CONTROL_DEFINITION: IVeoFormsElementDefinition = {
  code: 'veo-decision-results',
  name: {
    en: 'Calculated decision results',
    de: 'Berechnete Entscheidungsergebnisse',
    tr: 'Hesaplanan karar sonuçları'
  },
  description: {
    en: 'Read-only results returned by the decision engine.',
    de: 'Schreibgeschützte Ergebnisse der Entscheidungslogik.',
    tr: 'Karar motorundan dönen salt okunur sonuçlar.'
  },
  conditions: (props) => [
    props.objectSchema.type === 'object',
    props.objectSchema.readOnly === true,
    props.options.format === 'decision-results'
  ]
};
</script>
<script setup lang="ts">
import { VeoFormsControlProps } from '../util';
import { customerField } from '~/lib/customerField';
import { parseDuration, formatDurationLabel } from '../duration/duration';
const props = defineProps(VeoFormsControlProps);
const { t, locale } = useI18n();
const localized = (value: string | Record<string, string> | undefined) =>
  typeof value === 'string' ? value : customerField(value, locale.value);
const displayValue = (row: { key: string; format?: string }) => {
  const value = (props.modelValue as Record<string, { value?: unknown }> | undefined)?.[row.key]?.value;
  if (value === undefined || value === null) return localized(props.options.emptyLabel);
  if (row.format === 'duration')
    return (
      formatDurationLabel(parseDuration(value), (part, count) => t(`${part}Count`, { n: count }, count)) ||
      String(value)
    );
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
};
</script>
<i18n src="~/locales/base/components/dynamic-form-controls-input-duration.json"></i18n>
<style scoped>
.veo-decision-results {
  margin-block: 1rem;
}
.veo-decision-results__row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem 1.5rem;
  padding-block: 0.75rem;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
dt {
  flex: 1 1 12rem;
}
dd {
  margin: 0;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}
</style>
