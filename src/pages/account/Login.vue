<template>
  <v-container class="mt-10" v-if="loaded">
    <v-row justify="center" align="center" class="mt-10">
      <v-col cols="12" sm="8" md="6">
        <v-card class="login-card">
          <v-card-title align="center" class="login-title">Log in</v-card-title>
          <v-divider class="my-2"></v-divider>
          <v-form
            class="login-form"
            ref="form"
            @submit.prevent="formLogin"
            v-model="valid"
          >
            <v-card-text>
              <v-text-field
                class="mb-4 email-input"
                label="Email *"
                autofocus
                v-model="email"
                :rules="rules.email"
                type="email"
                name="email"
                validate-on="blur"
              ></v-text-field>
              <v-text-field
                class="mb-4 password-input"
                label="Password *"
                :rules="rules.required"
                v-model="password"
                type="password"
                name="password"
              ></v-text-field>
            </v-card-text>
            <v-divider class="login-divider"></v-divider>
            <v-card-actions class="text-body-1 signup-link-section">
              <v-spacer></v-spacer>
              <v-btn-primary
                class="login-button mr-4"
                :disabled="!valid"
                type="submit"
                >Log in</v-btn-primary
              >
            </v-card-actions>
          </v-form>
        </v-card>
      </v-col>
    </v-row>

    <v-row justify="center" class="mt-6">
      <span class="mr-2">Don't have an account?</span>
      <router-link to="/sign-up" class="light-text signup-link"
        >Sign Up</router-link
      >
    </v-row>

    <OAuth />

    <v-row justify="center" class="my-10">
      <router-link to="/password_reset" class="light-text forgot-password-link"
        >Forgot your password?</router-link
      >
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/store/authentication'
import { onMounted, ref } from 'vue'
import { rules } from '@/utils/rules'
import OAuth from '@/components/account/OAuth.vue'
import { api } from '@/services/api'
import router from '@/router/router'
import { useUserStore } from '@/store/user'
import { useRoute } from 'vue-router'
import Notification from '@/utils/notifications'

const email = ref('')
const password = ref('')
const form = ref(null)
const valid = ref(false)
const loaded = ref(false)
const route = useRoute()

const { setTokens } = useAuthStore()
const { setUser } = useUserStore()

const login = async (accessToken: string, refreshToken: string) => {
  try {
    setTokens(accessToken, refreshToken)
    const user = await api.fetchUser()
    setUser(user)
    Notification.toast({
      message: 'You have logged in!',
      type: 'success',
    })
    await router.push({ name: 'Sites' })
  } catch (e) {
    console.log('Failed to fetch user info')
  }
}

const formLogin = async () => {
  if (!valid) return

  try {
    const tokens = await api.login(email.value, password.value)
    login(tokens.access, tokens.refresh)
  } catch (error) {
    console.error('Error logging in.', error)
  }
}

const tryOAuthLogin = async () => {
  const accessToken = (route.query.t as string) || ''
  const refreshToken = (route.query.rt as string) || ''
  if (accessToken && refreshToken) await login(accessToken, refreshToken)
}

onMounted(async () => {
  await tryOAuthLogin()
  loaded.value = true
})
</script>
