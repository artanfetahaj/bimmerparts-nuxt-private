import authService from '@/services/auth'

export default defineNuxtRouteMiddleware(() => {
  if (import.meta.client && !authService.isAuthenticated()) {
    return navigateTo('/account/login')
  }
})
