import { defineStore } from 'pinia'
import { User, OAuthProvider } from '@/types'
import { Subject } from 'rxjs'
import { useResetStore } from '@/store/resetStore'
import { api } from '@/utils/api/apiMethods'
import { ENDPOINTS } from '@/constants'
import Notification from './notifications'
import router from '@/router/router'

const APP_URL = import.meta.env.VITE_APP_URL
let OAuthLoginController = new AbortController()

export const useAuthStore = defineStore({
  id: 'authentication',
  state: () => ({
    accessToken: '',
    refreshToken: '',
    user: new User(),
    sendingVerificationEmail: false,
    loggedIn$: new Subject<void>(),
  }),
  getters: {
    isLoggedIn: (state) => !!state.accessToken,
    isVerified: (state) => state.user.isVerified,
  },
  actions: {
    resetState() {
      useResetStore().all()
      localStorage.clear()
    },
    async login(email: string, password: string) {
      try {
        this.resetState()
        const tokens = await api.post(ENDPOINTS.ACCOUNT.JWT_PAIR, {
          email: email,
          password: password,
        })

        this.accessToken = tokens.access
        this.refreshToken = tokens.refresh
        const user = await api.fetch(ENDPOINTS.USER)
        if (!user) return

        this.user = user
        await router.push({ name: 'Sites' })
      } catch (error) {
        console.error('Error logging in', error)
      }
    },
    async logout() {
      try {
        await router.push({ name: 'Login' })
        this.resetState()
      } catch (error) {
        console.error('Error logging out', error)
      }
    },
    async createUser(user: User) {
      try {
        const data = await api.post(ENDPOINTS.USER, user)
        useResetStore().things()
        this.user = data.user
        this.accessToken = data.access
        this.refreshToken = data.refresh
        await router.push({ name: 'VerifyEmail' })
      } catch (error) {
        console.error('Error creating user', error)
      }
    },
    async sendVerificationEmail() {
      try {
        if (this.sendingVerificationEmail) return
        this.sendingVerificationEmail = true
        await api.post(ENDPOINTS.ACCOUNT.SEND_VERIFICATION_EMAIL)
        this.sendingVerificationEmail = false
      } catch (error) {
        console.error('Error sending verification email', error)
      }
    },
    async activateAccount(uid: string, token: string) {
      try {
        const data = await api.post(ENDPOINTS.ACCOUNT.ACTIVATE, {
          uid: uid,
          token: token,
        })
        if (!data.user.isVerified) return
        this.user = data.user
        this.accessToken = data.access
        this.refreshToken = data.refresh
        await router.push({ name: 'Sites' })
      } catch (error) {
        console.error('Error activating account', error)
      }
    },
    async updateUser(user: User) {
      try {
        const data = await api.patch(ENDPOINTS.USER, user, this.user)
        // TODO: investigate this
        // things.organizations could be affected for many things so just invalidate cache
        // useResetStore().things()
        this.user = data as User
        if (!user.isVerified) {
          await router.push({ name: 'VerifyEmail' })
        }
      } catch (error) {
        console.error('Error updating user', error)
      }
    },
    async deleteAccount() {
      try {
        await api.delete(ENDPOINTS.USER)
        await this.logout()
      } catch (error) {
        console.error('Error deleting account', error)
      }
    },
    async requestPasswordReset(email: String) {
      try {
        return await api.post(ENDPOINTS.USER.SEND_RESET_EMAIL, {
          email: email,
        })
      } catch (error) {
        console.error('Error requesting password reset', error)
      }
    },
    async resetPassword(uid: string, token: string, password: string) {
      try {
        await api.post(ENDPOINTS.USER.RESET_PASSWORD, {
          uid: uid,
          token: token,
          password: password,
        })
        await router.push({ name: 'Login' })
      } catch (error) {
        console.error('Error resetting password', error)
      }
    },
    async OAuthLogin(provider: OAuthProvider, callback?: () => any) {
      const handleMessage = async (event: MessageEvent) => {
        if (
          event.origin !== APP_URL ||
          !event.data.hasOwnProperty('accessToken')
        ) {
          return
        }

        if (event.data.accessToken) {
          this.accessToken = event.data.accessToken
          this.refreshToken = event.data.refreshToken

          try {
            const user = await api.fetch(ENDPOINTS.USER)
            if (!user) return
            this.user = user

            Notification.toast({
              message: 'You have logged in!',
              type: 'success',
            })
            this.loggedIn$.next()
            callback?.()
            router.push({ name: 'Sites' })
          } catch (e) {
            console.log('Failed to Log In')
          }
        } else {
          Notification.toast({
            message: 'Failed to Log In',
            type: 'error',
          })
        }
      }

      // TODO: window.opener is not populated in redirect response
      window.open(
        ENDPOINTS.ACCOUNT.OAUTH_LOGIN(provider),
        '_blank',
        'noopener=false'
      )

      console.info(`User: listening to login window...`)

      // We need to re-instantiate the listener so that it uses current values in `handleMessage`
      OAuthLoginController.abort()
      OAuthLoginController = new AbortController()
      window.addEventListener('message', handleMessage, {
        signal: OAuthLoginController.signal, // Used to remove the listener
      })
    },
  },
})
