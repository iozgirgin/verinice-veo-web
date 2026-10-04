<!--
   - verinice.veo web
   - Copyright (C) 2021  Jessica Lühnen, Annemarie Bufe, Jonas Heitmann
   -
   - This program is free software: you can redistribute it and/or modify
   - it under the terms of the GNU Affero General Public License as published by
   - the Free Software Foundation, either version 3 of the License, or
   - (at your option) any later version.
   -
   - This program is distributed in the hope that it will be useful,
   - but WITHOUT ANY WARRANTY; without even the implied warranty of
   - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   - GNU Affero General Public License for more details.
   -
   - You should have received a copy of the GNU Affero General Public License
   - along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
<template>
  <BaseWidget :title="t('myLatestRevisions')">
    <p class="text-body-2 mb-4">{{ t('domainScope') }}</p>
    <p v-if="revisions && !visibleRevisions.length" class="text-body-2" data-veo-test="domain-revisions-empty">
      {{ t('noRecentRecords') }}
    </p>
    <v-table v-else dense>
      <tbody>
        <tr v-for="(revision, key) in visibleRevisions" :key="key" class="text-no-wrap overflow-x-hidden fill-width">
          <td>
            <nuxt-link v-if="target(revision)" :to="target(revision)!.url" class="text-body-2 text-color">
              {{ revision.content.designator }}
              <b>{{ revision.content.abbreviation }} {{ revision.content.name }}</b>
            </nuxt-link>
            <span v-else class="text-body-2">{{ revision.content.designator }} {{ revision.content.name }}</span>
            <div v-if="target(revision)" class="text-caption">{{ domainName(target(revision)!.domainId) }}</div>
          </td>
          <td class="text-right text-body-2">
            {{ new Date(revision.time).toLocaleString(locale) }}
          </td>
        </tr>
      </tbody>
    </v-table>
  </BaseWidget>
</template>

<script setup lang="ts">
import { revisionTarget } from '~/lib/revisionNavigation';
import type { IVeoLegacyObjectHistoryEntry } from '~/types/history';

const { t, locale } = useI18n();

const { data: revisions } = useLatestRevisions();
const route = useRoute();
const { data: domains } = useDomains();
const visibleRevisions = computed(() =>
  (revisions.value || []).filter(
    (revision) =>
      revision.content?.owner?.id === route.params.unit &&
      Object.hasOwn(revision.content?.domains || {}, route.params.domain as string)
  )
);
const target = (revision: IVeoLegacyObjectHistoryEntry) =>
  revisionTarget(
    revision,
    route.params.unit as string,
    route.params.domain as string,
    (domains.value || []).map((domain) => domain.id)
  );
const domainName = (id: string) => domains.value?.find((domain) => domain.id === id)?.name;
</script>

<i18n src="~/locales/base/components/widget-my-latest-revisions.json"></i18n>

<style lang="scss" scoped>
a {
  text-decoration: none;
}
tbody {
  tr:hover {
    background-color: transparent !important;
  }

  td {
    max-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.v-data-table {
  background: transparent;
}
</style>
