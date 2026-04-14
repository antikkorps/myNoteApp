// @vitest-environment node
import { describe, it, expect, vi } from "vitest"

const routerParams: Record<string, string | undefined> = {}

vi.stubGlobal("getRouterParam", (_event: any, name: string) => routerParams[name])
vi.stubGlobal("createError", (opts: any) => {
  const err = new Error(opts.statusMessage) as any
  err.statusCode = opts.statusCode
  err.statusMessage = opts.statusMessage
  return err
})
vi.stubGlobal("readBody", async (event: any) => event.__body)

const { validateId, validateBody, createNoteSchema } = await import("../../server/utils/validation")

describe("validateId", () => {
  it("returns the parsed id for valid integer", () => {
    routerParams.id = "42"
    expect(validateId({} as any)).toBe(42)
  })

  it("throws 400 for non-numeric", () => {
    routerParams.id = "abc"
    expect(() => validateId({} as any)).toThrow(/Invalid id/)
  })

  it("throws 400 for zero", () => {
    routerParams.id = "0"
    expect(() => validateId({} as any)).toThrow(/Invalid id/)
  })

  it("throws 400 for negative", () => {
    routerParams.id = "-5"
    expect(() => validateId({} as any)).toThrow(/Invalid id/)
  })

  it("throws 400 for floats", () => {
    routerParams.id = "1.5"
    expect(() => validateId({} as any)).toThrow(/Invalid id/)
  })

  it("supports custom param name", () => {
    routerParams.noteId = "7"
    expect(validateId({} as any, "noteId")).toBe(7)
  })
})

describe("validateBody", () => {
  it("returns parsed body when valid", async () => {
    const body = { title: "Hello", content: "World" }
    const result = await validateBody({ __body: body } as any, createNoteSchema)
    expect(result).toEqual(body)
  })

  it("rejects oversize title", async () => {
    const body = { title: "x".repeat(501) }
    await expect(validateBody({ __body: body } as any, createNoteSchema)).rejects.toThrow(/Validation error/)
  })

  it("rejects negative folderId", async () => {
    const body = { folderId: -1 }
    await expect(validateBody({ __body: body } as any, createNoteSchema)).rejects.toThrow(/Validation error/)
  })

  it("accepts null folderId", async () => {
    const result = await validateBody({ __body: { folderId: null } } as any, createNoteSchema)
    expect(result.folderId).toBeNull()
  })
})
