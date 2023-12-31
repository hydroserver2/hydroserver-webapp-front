<template>
  <v-row>
    <v-tooltip bottom :openDelay="500" v-if="isOwner">
      <template v-slot:activator="{ props }">
        <v-icon
          :icon="
            datastream.isDataVisible
              ? 'mdi-file-eye-outline'
              : 'mdi-file-remove'
          "
          :color="datastream.isDataVisible ? 'grey' : 'grey-lighten-1'"
          small
          v-bind="props"
          @click="toggleDataVisibility(datastream)"
        />
      </template>
      <span v-if="datastream.isDataVisible"
        >Hide the data for this datastream from guests of your site while
        keeping the metadata public. Owners will still see it
      </span>
      <span v-else>Make the data for this datastream publicly visible</span>
    </v-tooltip>

    <v-tooltip bottom :openDelay="500" v-if="isOwner">
      <template v-slot:activator="{ props }">
        <v-icon
          :icon="datastream.isVisible ? 'mdi-eye' : 'mdi-eye-off'"
          :color="datastream.isVisible ? 'grey' : 'grey-lighten-1'"
          small
          v-bind="props"
          @click="toggleVisibility(datastream)"
        />
      </template>
      <span v-if="datastream.isVisible"
        >Hide this datastream from guests of your site. Owners will still see
        it</span
      >
      <span v-else>Make this datastream publicly visible</span>
    </v-tooltip>

    <v-tooltip
      v-if="!isOwner && !datastream.isDataVisible"
      bottom
      :openDelay="100"
    >
      <template v-slot:activator="{ props }">
        <v-icon v-bind="props" icon="mdi-lock" />
      </template>
      <span>The data for this datastream is private </span>
    </v-tooltip>

    <v-menu v-else>
      <template v-slot:activator="{ props }">
        <v-icon v-bind="props" icon="mdi-dots-vertical" />
      </template>
      <v-list>
        <div v-if="isOwner">
          <v-list-item
            prepend-icon="mdi-link-variant"
            title="Link Data Source"
            @click="
              handleLinkDataSource(
                datastream.id,
                datastream.data_source_id,
                datastream.column
              )
            "
          />
          <v-list-item
            prepend-icon="mdi-pencil"
            title="Edit Datastream Metadata"
            :to="{
              name: 'DatastreamForm',
              params: { id: thingId, datastreamId: datastream.id },
            }"
          />
          <v-list-item
            prepend-icon="mdi-delete"
            title="Delete Datastream"
            @click="openDeleteModal(datastream)"
          />
        </div>
        <v-list-item
          v-if="datastream.isDataVisible"
          prepend-icon="mdi-chart-line"
          title="View Time Series Plot"
          @click="emit('openPlot')"
        />
        <v-list-item
          v-if="datastream.isDataVisible"
          prepend-icon="mdi-download"
          title="Download Data"
          @click="downloadDatastreamCSV(datastream.id)"
        />
      </v-list>
    </v-menu>
  </v-row>

  <v-dialog v-if="selectedDatastream" v-model="isDeleteModalOpen" width="40rem">
    <v-card>
      <v-card-title>
        <span class="text-h5">Confirm Deletion</span>
      </v-card-title>
      <v-card-text>
        Are you sure you want to permanently delete this datastream and all the
        observations associated with it?
        <br />
        <br />
        <strong>ID:</strong> {{ selectedDatastream.id }} <br />
      </v-card-text>
      <v-card-text>
        Please type <strong> Delete </strong> to confirm deletion:
        <v-form>
          <v-text-field
            v-model="deleteDatastreamInput"
            solo
            @keydown.enter.prevent="onDeleteDatastream"
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="isDeleteModalOpen = false">Cancel</v-btn>
        <v-btn color="delete" @click="onDeleteDatastream">Confirm</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="linkDataSourceDialogOpen" persistent>
    <SiteLinkDataSourceForm
      @close-dialog="linkDataSourceDialogOpen = false"
      :thingId="thingId"
      :datastreamId="linkFormDatastreamId"
      :dataSourceId="linkFormDataSourceId"
      :column="linkFormColumn"
    />
  </v-dialog>
</template>

<script setup lang="ts">
import { Datastream } from '@/types'
import { Ref, ref, watch } from 'vue'
import SiteLinkDataSourceForm from '@/components/Site/SiteLinkDataSourceForm.vue'
import { api } from '@/services/api'
import Notification from '@/utils/notifications'

const props = defineProps({
  datastream: {
    type: Object as () => any,
    required: true,
  },
  thingId: {
    type: String,
    required: true,
  },
  isOwner: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['openPlot', 'deleted'])

const selectedDatastream: Ref<Datastream | null> = ref(null)
const isDeleteModalOpen = ref(false)
const deleteDatastreamInput = ref('')

function closeDeleteModal() {
  selectedDatastream.value = null
  deleteDatastreamInput.value = ''
}

watch(isDeleteModalOpen, (newValue) => {
  if (newValue === false) {
    closeDeleteModal()
  }
})

async function toggleDataVisibility(datastream: Datastream) {
  datastream.isDataVisible = !datastream.isDataVisible
  if (datastream.isDataVisible) datastream.isVisible = true
  onUpdate(datastream)
}

async function toggleVisibility(datastream: Datastream) {
  datastream.isVisible = !datastream.isVisible
  if (!datastream.isVisible) datastream.isDataVisible = false
  onUpdate(datastream)
}

const onUpdate = async (datastream: Datastream) => {
  try {
    await api.updateDatastream(datastream)
  } catch (error) {
    console.error('Error updating datastream', error)
  }
}

function openDeleteModal(datastream: Datastream) {
  selectedDatastream.value = datastream
  isDeleteModalOpen.value = true
}

const downloadDatastreamCSV = async (id: string) => {
  try {
    const data = await api.downloadDatastreamCSV(id)
    const blob = new Blob([data], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = `datastream_${id}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Error downloading datastream CSV', error)
  }
}

async function onDeleteDatastream() {
  if (deleteDatastreamInput.value.toLocaleLowerCase() !== 'delete') {
    Notification.toast({
      message: 'inputs do not match',
      type: 'error',
    })
    return
  }

  isDeleteModalOpen.value = false
  deleteDatastreamInput.value = ''

  if (selectedDatastream.value) {
    try {
      await api.deleteDatastream(selectedDatastream.value.id)
      emit('deleted')
    } catch (error) {
      console.error(`Error deleting datastream`, error)
    }
  }
}

const linkFormDatastreamId = ref()
const linkFormDataSourceId = ref()
const linkFormColumn = ref()
const linkDataSourceDialogOpen = ref(false)

function handleLinkDataSource(
  datastreamId: string,
  dataSourceId: string,
  column: string | number
) {
  linkFormDatastreamId.value = datastreamId
  linkFormDataSourceId.value = dataSourceId
  linkFormColumn.value = column
  linkDataSourceDialogOpen.value = true
}
</script>
