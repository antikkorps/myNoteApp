// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from "vitest"

type FolderRow = { id: number; parentId: number | null; userId: string }

const rows: FolderRow[] = []

vi.mock("drizzle-orm", () => ({
  and: (...args: any[]) => ({ __op: "and", args }),
  eq: (col: any, val: any) => ({ __op: "eq", col, val }),
}))

vi.mock("../../server/utils/db", () => {
  function buildSelect() {
    let filterId: number | null = null
    let filterUser: string | null = null
    const chain: any = {
      from() { return chain },
      where(cond: any) {
        const eqs = cond?.args ?? []
        for (const e of eqs) {
          if (typeof e?.val === "number") filterId = e.val
          if (typeof e?.val === "string") filterUser = e.val
        }
        return chain
      },
      limit(_n: number) {
        const found = rows.find((r) => r.id === filterId && r.userId === filterUser)
        return Promise.resolve(found ? [{ parentId: found.parentId }] : [])
      },
    }
    return chain
  }

  return {
    db: { select: () => buildSelect() },
    folders: {},
  }
})

const { wouldCreateCycle } = await import("../../server/utils/folderCycle")

beforeEach(() => {
  rows.length = 0
})

function setRows(r: FolderRow[]) {
  rows.length = 0
  rows.push(...r)
}

const U = "user-1"

describe("wouldCreateCycle", () => {
  it("detects self-parent (folderId === newParentId)", async () => {
    setRows([{ id: 1, parentId: null, userId: U }])
    expect(await wouldCreateCycle(1, 1, U)).toBe(true)
  })

  it("returns false when new parent has no ancestors", async () => {
    setRows([{ id: 2, parentId: null, userId: U }])
    expect(await wouldCreateCycle(1, 2, U)).toBe(false)
  })

  it("detects multi-level cycle: moving 1 under 3 where 3→2→1", async () => {
    setRows([
      { id: 1, parentId: null, userId: U },
      { id: 2, parentId: 1, userId: U },
      { id: 3, parentId: 2, userId: U },
    ])
    expect(await wouldCreateCycle(1, 3, U)).toBe(true)
  })

  it("returns false for valid deep nesting", async () => {
    setRows([
      { id: 10, parentId: null, userId: U },
      { id: 11, parentId: 10, userId: U },
      { id: 12, parentId: 11, userId: U },
    ])
    expect(await wouldCreateCycle(99, 12, U)).toBe(false)
  })

  it("breaks on pre-existing cycle in DB (corrupted state)", async () => {
    setRows([
      { id: 1, parentId: 2, userId: U },
      { id: 2, parentId: 1, userId: U },
    ])
    expect(await wouldCreateCycle(99, 1, U)).toBe(true)
  })

  it("treats folders of other users as non-existent", async () => {
    setRows([{ id: 1, parentId: null, userId: "other" }])
    expect(await wouldCreateCycle(99, 1, U)).toBe(false)
  })
})
