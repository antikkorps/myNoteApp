import { requireAdmin } from "../../../utils/requireAdmin"
import { getSetting, setSetting } from "../../../utils/appSettings"

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody<{ maxBytes: number }>(event)

  if (!body.maxBytes || typeof body.maxBytes !== "number" || body.maxBytes < 0) {
    throw createError({ statusCode: 400, statusMessage: "maxBytes must be a positive number" })
  }

  await setSetting("storage.defaultQuotaBytes", String(body.maxBytes))

  return { key: "storage.defaultQuotaBytes", maxBytes: body.maxBytes }
})
