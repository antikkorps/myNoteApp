export default defineNuxtRouteMiddleware(async () => {
  const { useSession } = useAuth()
  const session = useSession()

  // Wait for session to load if pending
  if (session.value.isPending) {
    await new Promise<void>((resolve) => {
      const stop = watch(
        () => session.value.isPending,
        (pending) => {
          if (!pending) {
            stop()
            resolve()
          }
        },
        { immediate: true },
      )
    })
  }

  if (session.value.data?.user?.role !== "admin") {
    return navigateTo("/")
  }
})
