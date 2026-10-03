<!--
  verinice.veo web - Copyright (C) 2026 DataGood contributors
  SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
  <section v-if="options.visible" class="veo-incident-timeline" :aria-label="options.label">
    <h3 class="text-title-medium mb-2">{{ options.label }}</h3>
    <p class="text-body-medium mb-3">{{ t('notice') }}</p>
    <p v-if="timeline.state !== 'ready'" role="status">{{ t(timeline.state) }}</p>
    <ul v-if="timeline.errors.length" class="mb-3">
      <li v-for="error in timeline.errors" :key="error">{{ errorLabel(error) }}</li>
    </ul>
    <dl v-else-if="timeline.state === 'ready'">
      <div v-for="row in timeline.rows" :key="row.stage" class="veo-incident-timeline__row">
        <dt>{{ t(row.stage) }}</dt>
        <dd>
          <time v-if="row.due" :datetime="row.due">{{ formatTime(row.due) }}</time>
          <span v-else>{{ t('missingAnchor') }}</span>
          <span class="veo-incident-timeline__status">{{ t(row.status) }}</span>
        </dd>
      </div>
    </dl>
    <p class="text-body-small mt-3">{{ t('calendarNote') }}</p>
  </section>
</template>
<script lang="ts">
import type { IVeoFormsElementDefinition } from '../types';
export const CONTROL_DEFINITION: IVeoFormsElementDefinition = {
  code: 'veo-incident-timeline',
  name: {
    tr: 'NIS2 bildirim takvimi önizlemesi',
    en: 'NIS2 reporting timeline preview',
    de: 'NIS2-Meldezeitplanvorschau'
  },
  description: {
    tr: 'Beyan edilen kapsama ve olay zamanlarına göre salt okunur önizleme.',
    en: 'Read-only preview using declared scope and incident times.',
    de: 'Schreibgeschützte Vorschau anhand des angegebenen Geltungsbereichs und der Vorfallzeiten.'
  },
  conditions: (props) => [
    props.objectSchema.type === 'object' ||
      (props.objectSchema.type === undefined && props.objectSchema.properties !== undefined),
    props.options.format === 'incident-timeline'
  ]
};
</script>
<script setup lang="ts">
import { VeoFormsControlProps } from '../util';
import { calculateNis2Timeline, type TimelineInput } from '~/lib/nis2Timeline';
const props = defineProps(VeoFormsControlProps);
const { t, locale } = useI18n();
const now = ref(Date.now());
let timer: ReturnType<typeof setInterval> | undefined;
onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now();
  }, 60000);
});
onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});
const timeline = computed(() => calculateNis2Timeline((props.modelValue || {}) as TimelineInput, now.value));
const formatTime = (value: string) =>
  new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(
    new Date(value)
  ) + ' UTC';
const errorLabel = (error: string) => {
  const [reason, field] = error.split(':');
  return t(reason === 'invalid' ? 'invalidTime' : reason, { field: t(field) });
};
</script>
<i18n src="~/locales/base/components/dynamic-form-controls-incident-timeline.json"></i18n>
<style scoped>
.veo-incident-timeline {
  margin-block: 1rem;
}
.veo-incident-timeline__row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  padding-block: 0.75rem;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
dt {
  flex: 1 1 10rem;
}
dd {
  flex: 1 1 14rem;
  margin: 0;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}
.veo-incident-timeline__status {
  display: block;
  margin-top: 0.25rem;
}
</style>
