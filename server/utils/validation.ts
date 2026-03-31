import { z } from "zod"
import type { H3Event } from "h3"

// Max sizes
const MAX_TITLE_LENGTH = 500
const MAX_CONTENT_LENGTH = 5 * 1024 * 1024 // 5MB of text
const MAX_TAGS_LENGTH = 2000
const MAX_FOLDER_NAME_LENGTH = 200

// --- Notes ---

export const createNoteSchema = z.object({
  title: z.string().max(MAX_TITLE_LENGTH).optional(),
  content: z.string().max(MAX_CONTENT_LENGTH).optional(),
  tags: z.string().max(MAX_TAGS_LENGTH).optional(),
  folderId: z.number().int().positive().nullable().optional(),
  preferences: z.record(z.unknown()).nullable().optional(),
})

export const updateNoteSchema = z.object({
  title: z.string().max(MAX_TITLE_LENGTH).optional(),
  content: z.string().max(MAX_CONTENT_LENGTH).optional(),
  tags: z.string().max(MAX_TAGS_LENGTH).optional(),
  folderId: z.number().int().positive().nullable().optional(),
  preferences: z.record(z.unknown()).nullable().optional(),
})

// --- Folders ---

export const createFolderSchema = z.object({
  name: z.string().min(1).max(MAX_FOLDER_NAME_LENGTH).optional(),
  parentId: z.number().int().positive().nullable().optional(),
})

export const updateFolderSchema = z.object({
  name: z.string().min(1).max(MAX_FOLDER_NAME_LENGTH).optional(),
  parentId: z.number().int().positive().nullable().optional(),
})

// --- Helpers ---

export async function validateBody<T>(event: H3Event, schema: z.ZodType<T>): Promise<T> {
  const body = await readBody(event)
  const result = schema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: `Validation error: ${result.error.issues.map((i) => i.message).join(", ")}`,
    })
  }
  return result.data
}

export function validateId(event: H3Event, param = "id"): number {
  const raw = getRouterParam(event, param)
  const id = Number(raw)
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: `Invalid ${param}` })
  }
  return id
}
