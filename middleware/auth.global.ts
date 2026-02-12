export default defineNuxtRouteMiddleware(async (to) => {
  const publicPages = ["/login", "/signup"]

  if (publicPages.includes(to.path)) {
    return
  }

  const session = await $fetch("/api/auth/get-session", {
    headers: useRequestHeaders(["cookie"]),
  }).catch(() => null)

  if (!session) {
    return navigateTo("/login")
  }
})
