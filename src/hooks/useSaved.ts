'use client'

import { useCallback, useSyncExternalStore } from 'react'
import { getSavedIds, toggleSaved as toggleSavedUtil } from '@/lib/saved'

// 탭 간 동기화를 위한 custom event
const SAVE_CHANGE_EVENT = 'naonzip-save-change'

function dispatchSaveChange() {
  window.dispatchEvent(new Event(SAVE_CHANGE_EVENT))
}

// localStorage 기반 저장 상태를 외부 스토어로 구독한다(useSyncExternalStore).
// hydration 안전: getServerSnapshot 은 기본값을 반환하고, 마운트 후 실제 값으로 동기화된다.
function subscribeSaveChange(onChange: () => void) {
  window.addEventListener(SAVE_CHANGE_EVENT, onChange)
  return () => window.removeEventListener(SAVE_CHANGE_EVENT, onChange)
}

// getSnapshot 은 값이 바뀌지 않으면 같은 참조를 돌려줘야 한다(배열은 내용 동일 시 캐시 재사용).
const EMPTY_IDS: string[] = []
let cachedIdsKey = ''
let cachedIds: string[] = EMPTY_IDS
function getSavedIdsSnapshot(): string[] {
  const ids = getSavedIds()
  const key = ids.join(',')
  if (key !== cachedIdsKey) {
    cachedIdsKey = key
    cachedIds = ids
  }
  return cachedIds
}

export function useSaved(id: string) {
  const saved = useSyncExternalStore(
    subscribeSaveChange,
    () => getSavedIds().includes(id),
    () => false,
  )

  const toggle = useCallback(() => {
    toggleSavedUtil(id)
    dispatchSaveChange()
  }, [id])

  return { saved, toggle }
}

export function useSavedIds() {
  return useSyncExternalStore(
    subscribeSaveChange,
    getSavedIdsSnapshot,
    () => EMPTY_IDS,
  )
}
