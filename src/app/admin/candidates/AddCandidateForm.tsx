'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
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

// 신뢰도: 자유 입력 대신 5단계 select. addCandidate 가 0~1 clamp/기본 0.5 로 처리하므로 payload 호환.
const CONFIDENCE_OPTIONS = ['0.1', '0.3', '0.5', '0.7', '0.9'] as const

// 라벨 정규화: 공백 제거 + 소문자. "소스 URL" / "소스URL" / "source_url" 등을 동일 취급.
function normalizeLabel(s: string): string {
  return s.replace(/\s+/g, '').toLowerCase()
}

// 정규화된 라벨 → FormState 키. 여러 alias 가 같은 필드를 가리킨다.
//   - 운영자가 띄어쓰기/영문 snake_case/대소문자를 신경 쓰지 않아도 되게 한다.
const LABEL_ALIASES: Record<string, keyof FormState> = {
  // restaurant_name
  식당명: 'restaurant_name',
  후보명: 'restaurant_name',
  상호: 'restaurant_name',
  name: 'restaurant_name',
  restaurant_name: 'restaurant_name',
  // source_type
  소스유형: 'source_type',
  출처유형: 'source_type',
  source_type: 'source_type',
  // source_name
  소스명: 'source_name',
  소스: 'source_name',
  출처명: 'source_name',
  출처: 'source_name',
  source: 'source_name',
  source_name: 'source_name',
  // source_url
  소스url: 'source_url',
  출처url: 'source_url',
  source_url: 'source_url',
  url: 'source_url',
  // area_guess (추정 지역)
  추정지역: 'area_guess',
  지역: 'area_guess',
  area: 'area_guess',
  estimated_area: 'area_guess',
  // episode_title
  에피소드: 'episode_title',
  episode: 'episode_title',
  episode_title: 'episode_title',
  // confidence_score
  신뢰도: 'confidence_score',
  confidence: 'confidence_score',
  // operator_note
  운영자메모: 'operator_note',
  메모: 'operator_note',
  note: 'operator_note',
  operator_note: 'operator_note',
}

// 붙여넣은 신뢰도 값을 select 가 가진 5단계 중 가장 가까운 값으로 스냅. 비정상이면 null.
function snapConfidence(raw: string): string | null {
  const n = Number(raw)
  if (!Number.isFinite(n)) return null
  let best: string = CONFIDENCE_OPTIONS[0]
  for (const opt of CONFIDENCE_OPTIONS) {
    if (Math.abs(Number(opt) - n) < Math.abs(Number(best) - n)) best = opt
  }
  return best
}

/**
 * "라벨: 값" 줄 목록을 파싱해 채울 필드만 부분 객체로 반환.
 *   - 줄 단위, 첫 ":" 기준 split (URL 값의 https:// 콜론 보존)
 *   - 라벨은 공백 제거 + 소문자로 비교(띄어쓰기/대소문자 무시)
 *   - 알 수 없는 라벨 / 빈 값 무시
 *   - source_type 은 youtube/tv/sns/other 일 때만 반영
 *   - 신뢰도는 5단계로 스냅, 스냅 실패 시 건너뜀
 *   - source_url 이 비면 본문 첫 http(s) URL 을 자동 감지해 채움(멀티라인/라벨 누락 대응)
 */
function parsePaste(text: string): Partial<FormState> {
  const result: Partial<FormState> = {}
  for (const line of text.split(/\r?\n/)) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const label = normalizeLabel(line.slice(0, idx))
    const value = line.slice(idx + 1).trim()
    const field = LABEL_ALIASES[label]
    if (!field || value === '') continue
    if (field === 'confidence_score') {
      const snapped = snapConfidence(value)
      if (snapped) result.confidence_score = snapped
    } else if (field === 'source_type') {
      const v = value.toLowerCase()
      if ((CANDIDATE_SOURCE_TYPES as readonly string[]).includes(v)) {
        result.source_type = v as CandidateSourceType
      }
    } else {
      result[field] = value
    }
  }
  // URL 자동 감지 fallback: source_url 이 비었으면 본문 첫 http(s) URL 사용.
  if (!result.source_url) {
    const m = text.match(/https?:\/\/[^\s]+/i)
    if (m) result.source_url = m[0]
  }
  return result
}

const inputClass =
  'w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs disabled:opacity-50'
const labelClass = 'block text-xs font-medium text-gray-700 mb-1'

export default function AddCandidateForm() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(EMPTY)
  const [pasteText, setPasteText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [pending, startTransition] = useTransition()

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setError(null)
    setSuccess(false)
  }

  // 빠른 붙여넣기: 인식한 라벨만 기존 필드로 병합. 빈 textarea 면 아무것도 바꾸지 않는다.
  function onPasteChange(text: string) {
    setPasteText(text)
    setError(null)
    setSuccess(false)
    const parsed = parsePaste(text)
    if (Object.keys(parsed).length > 0) {
      setForm((f) => ({ ...f, ...parsed }))
    }
  }

  // verified=false: 일반 후보 추가(PENDING). true: VERIFIED 로 생성 후 등록 준비 화면 이동.
  function submit(verified: boolean) {
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
        verified,
      })
      if (!res.ok) {
        setError(res.error)
        return
      }
      if (verified) {
        // 검토완료로 추가 → 바로 등록 준비 화면으로(공개는 미리보기에서 운영자가 직접).
        router.push(`/admin/candidates/${res.id}/convert`)
        return
      }
      setForm(EMPTY)
      setPasteText('')
      setSuccess(true)
    })
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    submit(false)
  }

  return (
    <details className="mb-4 rounded-lg border border-gray-200 bg-white">
      <summary className="cursor-pointer px-4 py-3 text-xs font-medium text-gray-900 hover:text-gray-700">
        후보 수동 추가
      </summary>
      <form onSubmit={onSubmit} className="border-t border-gray-100 px-4 py-4">
        <div className="mb-3">
          <label className={labelClass}>빠른 붙여넣기 (선택)</label>
          <textarea
            value={pasteText}
            disabled={pending}
            onChange={(e) => onPasteChange(e.target.value)}
            rows={4}
            className={inputClass}
            placeholder={
              '식당명: 중앙곰탕\n소스유형: tv\n소스명: 전현무계획3\n소스 URL: https://...\n추정 지역: 중앙동\n에피소드: 부산편 양수백 맛집\n신뢰도: 0.9\n운영자 메모: 양수백 대표'
            }
          />
          <p className="mt-1 text-[11px] text-gray-400">
            줄마다 “라벨: 값” 형식으로 붙여넣으면 아래 필드가 자동으로 채워져요. 비워둬도 기존
            입력 방식 그대로 쓸 수 있어요.
          </p>
        </div>

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
            <label className={labelClass}>신뢰도</label>
            <select
              value={form.confidence_score}
              disabled={pending}
              onChange={(e) => set('confidence_score', e.target.value)}
              className={inputClass}
            >
              {CONFIDENCE_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
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

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {pending ? '추가 중…' : '후보 추가'}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => submit(true)}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {pending ? '처리 중…' : '검토완료로 추가하고 등록 준비'}
          </button>
          {success && <span className="text-xs text-green-600">추가되었습니다.</span>}
          {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
      </form>
    </details>
  )
}
