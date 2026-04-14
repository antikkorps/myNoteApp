import { describe, it, expect } from "vitest"
import { useFindInNote } from "~/composables/useFindInNote"

describe("useFindInNote", () => {
  it("starts with findBar closed", () => {
    const { findBarOpen } = useFindInNote()
    expect(findBarOpen.value).toBe(false)
  })

  it("opens the find bar", () => {
    const { findBarOpen, openFindBar } = useFindInNote()
    openFindBar()
    expect(findBarOpen.value).toBe(true)
  })

  it("closes the find bar", () => {
    const { findBarOpen, openFindBar, closeFindBar } = useFindInNote()
    openFindBar()
    closeFindBar()
    expect(findBarOpen.value).toBe(false)
  })

  it("shares state across calls (useState)", () => {
    const first = useFindInNote()
    const second = useFindInNote()
    first.openFindBar()
    expect(second.findBarOpen.value).toBe(true)
  })
})
