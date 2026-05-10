'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSavedIds, toggleSaved as toggleSavedUtil } from '@/lib/saved'

// 탭 간 동기화를 위한 custom event
const SAVE_CHANGE_EVENT = 'naonzip-save-change'

function dispatchSaveChange() {
  window.dispatchEvent(new Event(SAVE_CHANGE_EVENT))
}

export function useSaved(id: string) {
  const [saved, setSaved] = useState(false)

  // hydration 안전: mount 후 localStorage 읽기
  useEffect(() => {
    setSaved(getSavedIds().includes(id))

    const onExternalChange = () => {
      setSaved(getSavedIds().includes(id))
    }
    window.addEventListener(SAVE_CHANGE_EVENT, onExternalChange)
    return () => window.removeEventListener(SAVE_CHANGE_EVENT, onExternalChange)
  }, [id])

  const toggle = useCallback(() => {
    const next = toggleSavedUtil(id)
    setSaved(next)
    dispatchSaveChange()
  }, [id])

  return { saved, toggle }
}

export function useSavedIds() {
  const [ids, setIds] = useState<string[]>([])

  useEffect(() => {
    setIds(getSavedIds())

    const onExternalChange = () => setIds(getSavedIds())
    window.addEventListener(SAVE_CHANGE_EVENT, onExternalChange)
    return () => window.removeEventListener(SAVE_CHANGE_EVENT, onExternalChange)
  }, [])

  return ids
}
