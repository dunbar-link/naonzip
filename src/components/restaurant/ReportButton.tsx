'use client'

import { useEffect, useState } from 'react'

const REASONS = ['폐업', '위치 틀림', '가격 틀림', '식당 다름', '기타'] as const

type Reason = (typeof REASONS)[number]

type Props = {
  slug: string
}

export default function ReportButton({ slug }: Props) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<Reason>('폐업')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2200)
    return () => clearTimeout(t)
  }, [toast])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  function reset() {
    setReason('폐업')
    setMessage('')
    setError(null)
  }

  function close() {
    if (submitting) return
    setOpen(false)
    reset()
  }

  async function onSubmit() {
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          reason,
          message: message.trim() || null,
        }),
      })
      const data = (await res.json().catch(() => null)) as { ok?: boolean } | null
      if (!res.ok || !data?.ok) {
        setError('전송에 실패했어요. 잠시 후 다시 시도해 주세요.')
        return
      }
      setOpen(false)
      reset()
      setToast('제보 고마워요 😊')
    } catch {
      setError('네트워크 오류가 발생했어요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-block py-2 text-sm text-gray-500 underline underline-offset-2 hover:text-gray-700"
      >
        정보가 다르다면 알려주세요 →
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="정보 수정 제안"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={close}
            aria-hidden="true"
          />
          <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">정보 수정 제안</h2>
              <button
                type="button"
                onClick={close}
                disabled={submitting}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none w-6 h-6 flex items-center justify-center"
                aria-label="닫기"
              >
                ×
              </button>
            </div>

            <fieldset className="mb-4">
              <legend className="text-xs font-medium text-gray-600 mb-2">사유</legend>
              <div className="flex flex-wrap gap-2">
                {REASONS.map((r) => (
                  <label
                    key={r}
                    className={[
                      'cursor-pointer rounded-full border px-3 py-1.5 text-xs',
                      reason === r
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400',
                    ].join(' ')}
                  >
                    <input
                      type="radio"
                      name="report-reason"
                      value={r}
                      checked={reason === r}
                      onChange={() => setReason(r)}
                      className="sr-only"
                    />
                    {r}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="block mb-4">
              <span className="block text-xs font-medium text-gray-600 mb-2">
                내용 (선택)
              </span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={1000}
                rows={4}
                placeholder="알고 계신 정보를 적어 주세요. (선택)"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none resize-none"
              />
              <span className="block mt-1 text-[10px] text-gray-400 text-right">
                {message.length}/1000
              </span>
            </label>

            {error && (
              <p className="mb-3 text-xs text-red-600">{error}</p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={close}
                disabled={submitting}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={onSubmit}
                disabled={submitting}
                className="flex-1 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {submitting ? '보내는 중…' : '보내기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed left-1/2 bottom-20 z-50 -translate-x-1/2 rounded-full bg-gray-900 px-4 py-2 text-sm text-white shadow-lg"
        >
          {toast}
        </div>
      )}
    </>
  )
}
