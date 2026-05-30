'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteRestaurantDraft } from './actions'

type Props = {
  slug: string
}

const SUCCESS_MESSAGE = '비공개 식당을 삭제했습니다.'

export default function DeleteDraftButton({ slug }: Props) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          const ok = window.confirm(
            '비공개 식당을 삭제합니다. 되돌릴 수 없어요. 계속할까요?',
          )
          if (!ok) return
          setError(null)
          setMessage(null)
          startTransition(async () => {
            const res = await deleteRestaurantDraft(slug)
            if (res.ok) {
              setMessage(SUCCESS_MESSAGE)
              router.push('/admin/restaurants')
            } else {
              setError(res.error)
            }
          })
        }}
        className="rounded-md border border-red-200 px-4 py-2 text-xs font-medium text-red-600 hover:border-red-300 hover:bg-red-50 disabled:opacity-50"
      >
        {pending ? '삭제 중…' : '비공개 삭제'}
      </button>
      <span className="text-xs text-gray-500">비공개 식당만 삭제됩니다</span>
      {message && <span className="text-xs text-red-600">{message}</span>}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}
