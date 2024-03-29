<template>
  <v-navigation-drawer v-model="drawer" width="400">
    <v-card-title class="d-flex justify-space-between align-start">
      Browse Data Collection Sites
      <v-icon v-if="drawer" @click="drawer = !drawer">mdi-menu-open</v-icon>
    </v-card-title>

    <v-divider />

    <div class="d-flex justify-end my-4 mx-2">
      <v-btn-cancel elevation="3" @click="onClearFilters"
        >Clear Filters</v-btn-cancel
      >
    </div>

    <v-col cols="12" class="align-self-center">
      <v-autocomplete
        v-model="selectedOrganizations"
        :items="organizations"
        label="Organizations"
        multiple
        hide-details
        color="primary"
        density="compact"
      >
        <template v-slot:selection="{ item, index }">
          <v-chip
            color="primary"
            rounded
            closable
            @click:close="removeOrganization(item)"
          >
            <span>{{ item.title }}</span>
          </v-chip>
        </template>
      </v-autocomplete>
    </v-col>

    <v-expansion-panels class="pa-4">
      <v-expansion-panel title="Site Types" color="green">
        <v-expansion-panel-text>
          <v-checkbox
            v-for="type in siteTypes"
            v-model="selectedSiteTypes"
            :label="type"
            :value="type"
            hide-details
            density="compact"
          />
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-navigation-drawer>

  <div class="pa-2" v-if="!drawer">
    <v-icon @click="drawer = !drawer">mdi-menu</v-icon>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Ref } from 'vue'
import { Thing } from '@/types'
import { siteTypes } from '@/vocabularies'
import { useDisplay } from 'vuetify/lib/framework.mjs'

const { smAndDown } = useDisplay()
const selectedSiteTypes: Ref<string[]> = ref([])
const selectedOrganizations: Ref<string[]> = ref([])
const drawer = ref(!!smAndDown)

const emit = defineEmits(['filter'])
const props = defineProps({
  things: {
    type: Array as () => Thing[],
    required: true,
  },
})

const organizations = computed(() =>
  Array.from(
    new Set(
      props.things
        .flatMap((t) => t.owners.map((owner) => owner.organizationName))
        .filter((name): name is string => Boolean(name))
    )
  ).sort((a, b) => a.localeCompare(b))
)

const removeOrganization = (item: any) => {
  selectedOrganizations.value = selectedOrganizations.value.filter(
    (o) => o !== item.title
  )
}

const isOrgValid = (thing: Thing) =>
  selectedOrganizations.value.length === 0 ||
  thing.owners.some(
    (o) =>
      o.isPrimaryOwner &&
      o.organizationName &&
      selectedOrganizations.value.includes(o.organizationName)
  )

const isTypeValid = (thing: Thing) =>
  selectedSiteTypes.value.length === 0 ||
  selectedSiteTypes.value.includes(thing.siteType)

const emitFilteredThings = () => {
  const filteredThings = props.things.filter(
    (thing) => isOrgValid(thing) && isTypeValid(thing)
  )
  emit('filter', filteredThings)
}

const onClearFilters = () => {
  selectedSiteTypes.value = []
  selectedOrganizations.value = []
}

watch([selectedSiteTypes, selectedOrganizations], emitFilteredThings)
</script>
