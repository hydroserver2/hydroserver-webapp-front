<template>
  <v-data-table
    class="elevation-3"
    :headers="headers"
    :items="visibleDatastreams"
    v-model:sort-by="sortBy"
  >
    <template v-slot:item.info="{ item }">
      <v-col>
        <v-row style="font-size: 1.2em">
          <strong class="mr-2">Observed Property:</strong>
          <strong>{{ item.raw.OPName }}</strong>
        </v-row>
        <v-row>
          <strong class="mr-2">Identifier:</strong> {{ item.raw.id }}
        </v-row>
        <v-row>
          <strong class="mr-2">Processing Level:</strong>
          {{
            processingLevels.find((p) => p.id === item.raw.processingLevelId)
              ?.code
          }}
        </v-row>
        <v-row>
          <strong class="mr-2">Sampled Medium:</strong>
          {{ item.raw.sampledMedium }}
        </v-row>
        <v-row>
          <strong class="mr-2">Sensor:</strong>
          {{ sensors.find((s) => s.id === item.raw.sensorId)?.name }}
        </v-row>
      </v-col>
    </template>

    <template v-slot:item.observations="{ item }">
      <div v-if="loaded[item.raw.id]">
        <div v-if="!isOwner && !item.raw.isDataVisible">
          Data is private for this datastream
        </div>
        <div v-else-if="observations[item.raw.id]">
          <v-dialog v-model="item.raw.chartOpen" width="80rem">
            <FocusContextPlot
              :thing-name="thing?.name || 'Site'"
              :datastream="item.raw"
              @close="item.raw.chartOpen = false"
            />
          </v-dialog>
          <Sparkline
            @click="item.raw.chartOpen = true"
            :is-stale="isStale(item.raw.phenomenonEndTime)"
            :observations="observations[item.raw.id]"
          />
        </div>
        <div v-else>No data for this datastream</div>
      </div>
      <v-progress-linear v-else color="secondary" indeterminate />
    </template>

    <template v-slot:item.last_observation="{ item }">
      <div
        v-if="mostRecentObs[item.raw.id] && (isOwner || item.raw.isDataVisible)"
      >
        <v-row>
          {{ formatDate(mostRecentObs[item.raw.id][0]) }}
        </v-row>
        <v-row>
          {{ mostRecentObs[item.raw.id][1] }}&nbsp;
          {{ units.find((u) => u.id === item.raw.unitId)?.name }}
        </v-row>
      </div>
    </template>

    <template v-slot:item.actions="{ item }">
      <DatastreamTableActions
        v-if="isOwner !== undefined"
        :datastream="item.raw"
        :is-owner="isOwner"
        :thing-id="thingId"
        @openPlot="item.raw.chartOpen = true"
        @deleted="onDeleteDatastream(item.raw.id)"
      />
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import FocusContextPlot from '@/components/Datastream/FocusContextPlot.vue'

import Sparkline from '@/components/Sparkline.vue'
import { computed, onMounted, ref, watch } from 'vue'
import { useMetadata } from '@/composables/useMetadata'
import { useObservationsLast72Hours } from '@/store/observations72Hours'
import { storeToRefs } from 'pinia'
import { useThingStore } from '@/store/thing'
import DatastreamTableActions from '@/components/Datastream/DatastreamTableActions.vue'
import { api } from '@/services/api'
import { Datastream } from '@/types'

const props = defineProps({
  thingId: {
    type: String,
    required: true,
  },
  isOwner: {
    type: Boolean,
    required: true,
  },
})

const { fetchObservationsBulk } = useObservationsLast72Hours()
const { loaded, observations, mostRecentObs } = storeToRefs(
  useObservationsLast72Hours()
)
const { thing } = storeToRefs(useThingStore())
const datastreams = ref<Datastream[]>([])

const { sensors, units, observedProperties, processingLevels } = useMetadata(
  props.thingId
)

const visibleDatastreams = computed(() => {
  return datastreams.value
    .filter((d) => d.isVisible || props.isOwner)
    .map((d) => ({
      ...d,
      chartOpen: false,
      OPName: observedProperties.value.find(
        (op) => op.id === d.observedPropertyId
      )?.name,
    }))
})

const sortBy = [{ key: 'OPName' }]
const headers = [
  {
    title: 'DataStream Info',
    key: 'info',
    value: 'OPName',
    sortable: false,
  },
  {
    title: 'Observations (Last 72 Hours)',
    key: 'observations',
    sortable: false,
  },
  { title: 'Last Observation', key: 'last_observation', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false },
]

function formatDate(dateString: string) {
  return (
    new Date(dateString).toUTCString().split(' ').slice(1, 5).join(' ') + ' UTC'
  )
}

function isStale(timestamp: string) {
  let endTime = new Date(timestamp)
  let seventyTwoHoursAgo = new Date(Date.now() - 72 * 60 * 60 * 1000)
  return endTime < seventyTwoHoursAgo
}

function onDeleteDatastream(id: string) {
  datastreams.value = datastreams.value.filter((ds) => ds.id !== id)
}

onMounted(async () => {
  datastreams.value = await api.fetchDatastreamsForThing(props.thingId)
  await fetchObservationsBulk(visibleDatastreams.value)
})
</script>
