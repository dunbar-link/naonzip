const STORAGE_KEY = 'naonzip-saved-restaurant-ids'

export function getSavedIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function setSavedIds(ids: string[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

export function toggleSaved(id: string): boolean {
  const ids = getSavedIds()
  const index = ids.indexOf(id)
  if (index === -1) {
    setSavedIds([...ids, id])
    return true
  } else {
    setSavedIds(ids.filter((v) => v !== id))
    return false
  }
}
