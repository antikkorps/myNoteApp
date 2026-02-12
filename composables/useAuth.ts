import { createAuthClient } from "better-auth/vue"

export const authClient = createAuthClient()

export function useAuth() {
  return authClient
}
