export interface NotePreferences {
  serif?: boolean
  smallText?: boolean
  fullWidth?: boolean
}

export interface Note {
  id: number
  title: string
  content: string
  tags: string | null
  userId: string
  folderId: number | null
  preferences: string | null
  createdAt: string
  updatedAt: string
}

export interface Folder {
  id: number
  name: string
  parentId: number | null
  userId: string
  createdAt: string
  updatedAt: string
}
