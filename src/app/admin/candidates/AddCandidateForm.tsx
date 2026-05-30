'use client'

import { useState, useTransition } from 'react'
import { CANDIDATE_SOURCE_TYPES, type CandidateSourceType } from '@/types/supabase'
import { addCandidate } from './actions'

type FormState = {
  source_type: CandidateSourceType
  source_name: string
  episode_title: string
  restaurant_name: string
  area_guess: string
  source_url: string
  confidence_score: string
  operator_note: string
}

const EMPTY: FormState = {
  source_type: 'tv',
  source_name: '',
  episode_title: '',
  restaurant_name: '',
  area_guess: '',
  source_url: '',
  confidence_score: '0.5',
  operator_note: '',
}

const SOURCE_OPTIONS: { value: CandidateSourceType; label: string }[] = [
  { value: 'tv', label: 'tv' },
  { value: 'youtube', label: 'youtube' },
  { value: 'sns', label: 'sns' },
  { value: 'other', label: 'other' },
]

const inputClass =
  'w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs disabled:opacity-50'
const labelClass = 'block text-xs font-medium text-gray-700 mb-1'

export default function AddCandidateForm() {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [pending, startTransition] = useTransition()

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setError(null)
    setSuccess(false)
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!form.source_name.trim()) {
      setError('소스명을 입력하세요.')
      return
    }
    if (!form.restaurant_name.trim()) {
      setError('식당명을 입력하세요.')
      return
    }

    startTransition(async () => {
      const res = await addCandidate({
        source_type: form.source_type,
        source_name: form.source_name,
        episode_title: form.episode_title,
        restaurant_name: form.restaurant_name,
        area_guess: form.area_guess,
        source_url: form.source_url,
        confidence_score: form.confidence_score,
        operator_note: form.operator_note,
      })
      if (res.ok) {
        setForm(EMPTY)
        setSuccess(true)
      } else {
        setError(res.error)
      }
    })
  }

  return (
    <details className="mb-4 rounded-lg border border-gray-200 bg-white">
      <summary className="cursor-pointer px-4 py-3 text-xs font-medium text-gray-900 hover:text-gray-700">
        후보 수동 추가
      </summary>
      <form onSubmit={onSubmit} className="border-t border-gray-100 px-4 py-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>소스 유형 *</label>
            <select
              value={form.source_type}
              disabled={pending}
              onChange={(e) => set('source_type', e.target.value as CandidateSourceType)}
              className={inputClass}
            >
              {SOURCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>소스명 *</label>
            <input
              type="text"
              value={form.source_name}
              disabled={pending}
              onChange={(e) => set('source_name', e.target.value)}
              className={inputClass}
              placeholder="예: 생활의 달인"
            />
          </div>

          <div>
            <label className={labelClass}>식당명 *</label>
            <input
              type="text"
              value={form.restaurant_name}
              disabled={pending}
              onChange={(e) => set('restaurant_name', e.target.value)}
              className={inputClass}
              placeholder="예: 부산 어쩌고 국밥"
            />
          </div>

          <div>
            <label className={labelClass}>추정 지역</label>
            <input
              type="text"
              value={form.area_guess}
              disabled={pending}
              onChange={(e) => set('area_guess', e.target.value)}
              className={inputClass}
              placeholder="예: 부산 서면"
            />
          </div>

          <div>
            <label className={labelClass}>에피소드</label>
            <input
              type="text"
              value={form.episode_title}
              disabled={pending}
              onChange={(e) => set('episode_title', e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>소스 URL</label>
            <input
              type="url"
              value={form.source_url}
              disabled={pending}
              onChange={(e) => set('source_url', e.target.value)}
              className={inputClass}
              placeholder="https://"
            />
          </div>

          <div>
            <label className={labelClass}>신뢰도 (0~1)</label>
            <input
              type="number"
              step="0.001"
              min="0"
              max="1"
              value={form.confidence_score}
              disabled={pending}
              onChange={(e) => set('confidence_score', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="mt-3">
          <label className={labelClass}>운영자 메모</label>
          <textarea
            value={form.operator_note}
            disabled={pending}
            onChange={(e) => set('operator_note', e.target.value)}
            rows={2}
            className={inputClass}
          />
        </div>

        <div className="mt-3 flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {pending ? '추가 중…' : '후보 추가'}
          </button>
          {success && <span className="text-xs text-green-600">추가되었습니다.</span>}
          {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
      </form>
    </details>
  )
}
