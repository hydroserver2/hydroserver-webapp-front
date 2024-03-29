<template>
  <v-card class="elevation-5" :loading="observations[datastream.id]?.loading">
    <template v-slot:loader="{ isActive }">
      <v-progress-linear color="primary" :active="isActive" indeterminate />
    </template>
    <v-card-title class="d-flex pt-4">
      <h5 class="flex-grow-1 pl-4 text-center text-h5">
        Datastream for {{ thingName }}
      </h5>
      <v-icon @click="$emit('close')">mdi-close</v-icon>
    </v-card-title>
    <v-card-text>
      <div ref="focusChart"></div>
      <div ref="contextChart"></div>
    </v-card-text>

    <v-card-actions class="my-3 d-flex justify-center">
      <v-btn
        v-for="selection in timeSelections"
        rounded
        :variant="selectedTime === selection.value ? 'outlined' : 'plain'"
        @click="drawObservationsSince(selection.value)"
        >{{ selection.label }}</v-btn
      >
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { focus, context } from '@/utils/FocusContextPlot'
import { useObservationStore } from '@/store/observations'
import { DataArray } from '@/types'
import {
  calculateEffectiveStartTime,
  preProcessData,
} from '@/utils/observationsUtils'
import { api } from '@/services/api'
import { storeToRefs } from 'pinia'

const { fetchObservationsInRange } = useObservationStore()
const { observations } = storeToRefs(useObservationStore())

const props = defineProps({
  thingName: {
    type: String,
    required: true,
  },
  datastream: {
    type: Object as () => any,
    required: true,
  },
})

const timeSelections = [
  { label: 'Last 72 Hours', value: 72 },
  { label: 'Last Week', value: 168 },
  { label: 'Last Month', value: 720 },
  { label: 'Last Year', value: 8760 },
  { label: 'All Time', value: -1 },
]
const selectedTime = ref(72)
const emit = defineEmits(['close'])

let focusChart = ref<any>(null)
let contextChart = ref<any>(null)
let yAxisLabel = ''

const fetchUnit = api.getUnit(props.datastream.unitId).catch((error) => {
  console.error('Failed to fetch Unit:', error)
  return null
})

const fetchObservedProperty = api
  .fetchObservedProperty(props.datastream.observedPropertyId)
  .catch((error) => {
    console.error('Failed to fetch ObservedProperty:', error)
    return null
  })

async function drawPlot(dataArray: DataArray) {
  let data = preProcessData(dataArray, props.datastream)

  if (focusChart.value) {
    const focusSVG = focus(data, yAxisLabel)
    focusChart.value.innerHTML = ''
    focusChart.value.appendChild(focusSVG)
  }
  if (contextChart.value) {
    const contextSVG = context(data)
    contextChart.value.innerHTML = ''
    contextChart.value.appendChild(contextSVG)
  }
}

async function getStartTime(hours: number) {
  selectedTime.value = hours
  if (
    props.datastream.phenomenonEndTime &&
    props.datastream.phenomenonBeginTime
  ) {
    return calculateEffectiveStartTime(
      props.datastream.phenomenonBeginTime,
      props.datastream.phenomenonEndTime,
      hours
    )
  }
}

async function drawObservationsSince(hours: number) {
  if (!props.datastream) return
  const startTime = await getStartTime(hours)

  const obsSince = await fetchObservationsInRange(
    props.datastream,
    startTime!,
    props.datastream.phenomenonEndTime
  )

  if (obsSince) drawPlot(obsSince)
}

onMounted(async () => {
  if (!props.datastream.phenomenonEndTime) return
  const [unit, OP] = await Promise.all([fetchUnit, fetchObservedProperty])
  yAxisLabel = props.datastream ? `${OP?.name} (${unit?.symbol}) ` : ''
  await drawObservationsSince(72)
})
</script>
