import { describe, it, expect } from "vitest"
import { useAuth, authClient } from "~/composables/useAuth"

describe("useAuth", () => {
  it("returns the authClient singleton", () => {
    expect(useAuth()).toBe(authClient)
  })

  it("exposes signIn, signUp, signOut and useSession", () => {
    const client = useAuth()
    expect(typeof client.signIn).toBe("function")
    expect(typeof client.signUp).toBe("function")
    expect(typeof client.signOut).toBe("function")
    expect(typeof client.useSession).toBe("function")
  })
})
