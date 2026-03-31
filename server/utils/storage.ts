import { join, dirname, resolve } from "path"
import { mkdir, writeFile, readFile, unlink, access } from "fs/promises"

function getUploadDir(): string {
  return resolve(process.env.UPLOAD_DIR || "./storage/uploads")
}

function getFilePath(storageKey: string): string {
  const filePath = resolve(getUploadDir(), storageKey)
  if (!filePath.startsWith(getUploadDir())) {
    throw new Error("Invalid storage key")
  }
  return filePath
}

export async function uploadFile(storageKey: string, data: Buffer, _contentType: string): Promise<string> {
  const filePath = getFilePath(storageKey)
  await mkdir(dirname(filePath), { recursive: true })
  await writeFile(filePath, data)
  return storageKey
}

export async function readStoredFile(storageKey: string): Promise<Buffer> {
  const filePath = getFilePath(storageKey)
  return readFile(filePath)
}

export async function deleteFile(storageKey: string): Promise<void> {
  const filePath = getFilePath(storageKey)
  try {
    await access(filePath)
    await unlink(filePath)
  } catch {
    // File doesn't exist, nothing to delete
  }
}

export function generateStorageKey(userId: string, filename: string): string {
  const ext = filename.includes(".") ? filename.split(".").pop() : "bin"
  const uuid = crypto.randomUUID()
  return `${userId}/${uuid}.${ext}`
}
