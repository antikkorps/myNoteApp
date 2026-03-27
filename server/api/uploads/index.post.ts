import { eq } from "drizzle-orm"
import { db, attachments, notes } from "../../utils/db"
import { requireAuth } from "../../utils/requireAuth"
import { uploadFile, generateStorageKey } from "../../utils/storage"

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"]
const ALLOWED_FILE_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/zip",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]

const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const formData = await readMultipartFormData(event)

  if (!formData) {
    throw createError({ statusCode: 400, statusMessage: "No file uploaded" })
  }

  const fileField = formData.find((f) => f.name === "file")
  const noteIdField = formData.find((f) => f.name === "noteId")
  const typeField = formData.find((f) => f.name === "type")

  if (!fileField?.data || !fileField.filename) {
    throw createError({ statusCode: 400, statusMessage: "File is required" })
  }

  if (!noteIdField?.data) {
    throw createError({ statusCode: 400, statusMessage: "noteId is required" })
  }

  const noteId = Number(noteIdField.data.toString())
  const fileType = (typeField?.data?.toString() || "file") as "image" | "file"
  const mimeType = fileField.type || "application/octet-stream"
  const fileSize = fileField.data.length

  // Verify note belongs to user
  const [note] = await db
    .select({ id: notes.id })
    .from(notes)
    .where(eq(notes.id, noteId))
    .limit(1)

  if (!note) {
    throw createError({ statusCode: 404, statusMessage: "Note not found" })
  }

  // Validate MIME type
  const allowedTypes = fileType === "image" ? ALLOWED_IMAGE_TYPES : ALLOWED_FILE_TYPES
  if (!allowedTypes.includes(mimeType)) {
    throw createError({ statusCode: 400, statusMessage: `File type ${mimeType} is not allowed` })
  }

  // Validate size
  const maxSize = fileType === "image" ? MAX_IMAGE_SIZE : MAX_FILE_SIZE
  if (fileSize > maxSize) {
    const maxMB = maxSize / (1024 * 1024)
    throw createError({ statusCode: 400, statusMessage: `File exceeds ${maxMB}MB limit` })
  }

  const storageKey = generateStorageKey(session.user.id, fileField.filename)
  await uploadFile(storageKey, fileField.data, mimeType)

  const [attachment] = await db
    .insert(attachments)
    .values({
      noteId,
      userId: session.user.id,
      filename: fileField.filename,
      storageKey,
      mimeType,
      size: fileSize,
      type: fileType,
    })
    .returning()

  return {
    ...attachment!,
    url: `/api/uploads/${attachment!.id}`,
  }
})
