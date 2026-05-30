'use client'

import { useState, useTransition } from 'react'
import { REPORT_STATUSES, type ReportStatus } from '@/types/supabase'
import { updateReportStatus } from './actions'

type Props = {
  id: string
  current: ReportStatus
}

export default function StatusSelect({ id, current }: Props) {
  const [value, setValue] = useState<ReportStatus>(current)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  return (
    <div className="flex items-center gap-2">
      <select
        value={value}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value as ReportStatus
          const prev = value
          setValue(next)
          setError(null)
          startTransition(async () => {
            const res = await updateReportStatus(id, next)
            if (!res.ok) {
              setValue(prev)
              setError(res.error)
            }
          })
        }}
        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs disabled:opacity-50"
      >
        {REPORT_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {pending && <span className="text-[10px] text-gray-400">저장 중…</span>}
      {error && <span className="text-[10px] text-red-600">{error}</span>}
    </div>
  )
}
