'use client'

import { useState, useTransition } from 'react'
import { setRestaurantPublished } from './actions'

type Props = {
  slug: string
  isPublished: boolean
}

export default function PublishToggle({ slug, isPublished }: Props) {
  const [published, setPublished] = useState<boolean>(isPublished)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const next = !published

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          const prev = published
          // 낙관적 UI: 먼저 반영하고, 실패하면 되돌린다.
          setPublished(next)
          setError(null)
          startTransition(async () => {
            const res = await setRestaurantPublished(slug, next)
            if (!res.ok) {
              setPublished(prev)
              setError(res.error)
            }
          })
        }}
        className={[
          'rounded-md border px-3 py-1 text-xs font-medium disabled:opacity-50',
          published
            ? 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
            : 'border-gray-900 bg-gray-900 text-white hover:bg-gray-800',
        ].join(' ')}
      >
        {published ? '비공개로 전환' : '공개하기'}
      </button>
      {pending && <span className="text-[10px] text-gray-400">저장 중…</span>}
      {error && <span className="text-[10px] text-red-600">{error}</span>}
    </div>
  )
}
