<template>
  <v-data-table class="elevation-3 my-6 rounded-lg">
    <template v-slot:top>
      <v-toolbar color="secondary">
        <h5 class="text-h5 ml-4">User Information</h5>
      </v-toolbar>
    </template>
    <tbody>
      <tr v-for="property in userInformation" :key="property?.label">
        <td><i :class="property?.icon"></i></td>
        <td>
          <strong>{{ property?.label }}</strong>
        </td>
        <td>{{ property?.value }}</td>
      </tr>
    </tbody>
    <template v-slot:bottom></template>
  </v-data-table>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { api } from '@/services/api'
import { useRoute, LocationQueryValue } from 'vue-router'

const { user } = storeToRefs(useUserStore())
const { setUser } = useUserStore()
const loaded = ref(false)
const route = useRoute()
const hydroShareOauthEnabled = import.meta.env.VITE_APP_HYDROSHARE_OAUTH_ENABLED || 'false'


const tryUserRefresh = async () => {
  const refresh = (route.query.refresh as LocationQueryValue) || false
  if (refresh) {
    let user = await api.fetchUser()
    if (user !== undefined) {
      setUser(user)
    }
  }
}

onMounted(async () => {
  await tryUserRefresh()
  loaded.value = true
})

const userInformation = computed(() => {
  if (!user.value) return []

  return [
    {
      icon: 'fas fa-user',
      label: 'Name',
      value: `${user.value.firstName} ${user.value.middleName || ''} ${
        user.value.lastName
      }`,
    },

    { icon: 'fas fa-envelope', label: 'Email', value: user.value.email },
    {
      icon: 'fas fa-map-marker-alt',
      label: 'Address',
      value: user.value.address,
    },
    { icon: 'fas fa-phone', label: 'Phone', value: user.value.phone },
    { icon: 'fas fa-id-badge', label: 'Type', value: user.value.type },
    { icon: 'fas fa-link', label: 'Link', value: user.value.link },
    user.value.organization
      ? {
          icon: 'fas fa-building',
          label: 'Organization Name',
          value: user.value.organization.name,
        }
      : null,
    user.value.organization
      ? {
          icon: 'fas fa-code',
          label: 'Organization Code',
          value: user.value.organization.code,
        }
      : null,
    user.value.organization
      ? {
          icon: 'fas fa-external-link-alt',
          label: 'Organization Link',
          value: user.value.organization.link,
        }
      : null,
    user.value.organization
      ? {
          icon: 'fas fa-industry',
          label: 'Organization Type',
          value: user.value.organization.type,
        }
      : null,
    user.value.organization
      ? {
          icon: 'fas fa-file-alt',
          label: 'Organization Description',
          value: user.value.organization.description,
        }
      : null,
    hydroShareOauthEnabled === 'true'
      ? {
          icon: 'fas fa-database',
          label: 'HydroShare Account',
          value: user.value.hydroShareConnected === true ? 'Connected' : 'Not Connected'
        }
      : null
  ].filter(Boolean)
})
</script>
