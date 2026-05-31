'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  RESTAURANT_SOURCE_TYPES,
  type RestaurantSourceType,
} from '@/types/supabase'
import { addCandidateAppearanceToRestaurant } from '../../actions'

/** page.tsx 가 넘기는 이름 정확 일치 식당 매치. */
export type ExistingMatch = {
  id: string
  slug: string
  name: string
  sourceTitle: string
  isPublished: boolean
}

/** candidate 값에서 만든 appearance prefill. */
export type AppearancePrefill = {
  source_type: RestaurantSourceType | ''
  source_title: string
  program_name: string
  creator_name: string
  episode_title: string
  broadcast_date: string
  video_url: string
  note: string
}

type FormState = {
  source_type: RestaurantSourceType | ''
  source_title: string
  program_name: string
  creator_name: string
  episode_title: string
  broadcast_date: string
  video_url: string
  note: string
}

const inputClass =
  'w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs disabled:opacity-50'
const labelClass = 'block text-xs font-medium text-gray-700 mb-1'

type Props = {
  candidateId: string
  matches: ExistingMatch[]
  prefill: AppearancePrefill
}

export default function AddAppearancePanel({ candidateId, matches, prefill }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<ExistingMatch | null>(null)
  const [form, setForm] = useState<FormState>({ ...prefill })
  const [error, setError] = useState<string | null>(null)
  const [doneSlug, setDoneSlug] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setError(null)
  }

  function onPick(match: ExistingMatch) {
    setSelected(match)
    setForm({ ...prefill })
    setError(null)
    setDoneSlug(null)
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!selected) return
    if (!form.source_type) {
      setError('소스 유형을 선택하세요.')
      return
    }
    if (!form.source_title.trim()) {
      setError('출처명을 입력하세요.')
      return
    }

    startTransition(async () => {
      const res = await addCandidateAppearanceToRestaurant(candidateId, {
        restaurantId: selected.id,
        source_type: form.source_type,
        source_title: form.source_title,
        program_name: form.program_name,
        creator_name: form.creator_name,
        episode_title: form.episode_title,
        broadcast_date: form.broadcast_date,
        video_url: form.video_url,
        note: form.note,
      })
      if (res.ok) {
        setDoneSlug(res.slug)
        // 서버 컴포넌트 재실행 → candidate 가 converted 로 마킹돼 패널이 사라지고
        // "완료" 가드가 바로 보이도록 갱신.
        router.refresh()
      } else {
        setError(res.error)
      }
    })
  }

  // 추가 성공 후: 성공 메시지 + 식당 보기 링크.
  if (doneSlug) {
    return (
      <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4">
        <p className="text-sm font-medium text-green-800">
          기존 식당에 방송 출연을 추가했어요.
        </p>
        <p className="mt-2 text-xs text-green-700">
          <Link
            href={`/restaurants/${doneSlug}`}
            target="_blank"
            rel="noreferrer"
            className="font-mono underline underline-offset-2 hover:text-green-900"
          >
            /restaurants/{doneSlug}
          </Link>
        </p>
        <p className="mt-3 text-xs text-gray-500">
          이 후보는 변환 완료로 표시됩니다(페이지를 새로고침하면 반영돼요).
        </p>
      </div>
    )
  }

  return (
    <section className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
      <h2 className="text-xs font-bold text-amber-900">이미 등록된 식당이 있어요</h2>
      <p className="mt-1 text-[11px] text-amber-700">
        같은 식당이면 새로 만들지 말고 기존 식당에 방송 기록을 추가해 주세요. (새 식당 중복
        생성 방지)
      </p>

      <ul className="mt-3 flex flex-col gap-2">
        {matches.map((m) => (
          <li
            key={m.id}
            className="rounded-md border border-amber-200 bg-white px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{m.name}</p>
                <p className="text-[11px] text-gray-500 truncate">
                  대표 출처: {m.sourceTitle}
                  {!m.isPublished && ' · 비공개'}
                </p>
                <Link
                  href={`/restaurants/${m.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-blue-600 underline underline-offset-2 break-all"
                >
                  /restaurants/{m.slug}
                </Link>
              </div>
              <button
                type="button"
                disabled={pending}
                onClick={() => onPick(m)}
                className="ml-auto flex-shrink-0 rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50"
              >
                이 식당에 방송 출연 추가
              </button>
            </div>

            {selected?.id === m.id && (
              <form onSubmit={onSubmit} className="mt-3 border-t border-amber-100 pt-3">
                <p className="mb-3 text-[11px] text-gray-500">
                  후보 정보로 자동 채웠어요. 확인 후 추가해 주세요. (모든 값은 수정할 수 있어요)
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>소스 유형 *</label>
                    <select
                      value={form.source_type}
                      disabled={pending}
                      onChange={(e) =>
                        set('source_type', e.target.value as RestaurantSourceType | '')
                      }
                      className={inputClass}
                    >
                      <option value="">선택하세요</option>
                      {RESTAURANT_SOURCE_TYPES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>출처명 (source_title) *</label>
                    <input
                      type="text"
                      value={form.source_title}
                      disabled={pending}
                      onChange={(e) => set('source_title', e.target.value)}
                      className={inputClass}
                      placeholder="예: 전현무계획3"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>프로그램명 (program_name)</label>
                    <input
                      type="text"
                      value={form.program_name}
                      disabled={pending}
                      onChange={(e) => set('program_name', e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>크리에이터명 (creator_name)</label>
                    <input
                      type="text"
                      value={form.creator_name}
                      disabled={pending}
                      onChange={(e) => set('creator_name', e.target.value)}
                      className={inputClass}
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
                    <label className={labelClass}>방영일</label>
                    <input
                      type="date"
                      value={form.broadcast_date}
                      disabled={pending}
                      onChange={(e) => set('broadcast_date', e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelClass}>영상 URL (video_url)</label>
                    <input
                      type="url"
                      value={form.video_url}
                      disabled={pending}
                      onChange={(e) => set('video_url', e.target.value)}
                      className={inputClass}
                      placeholder="https://"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelClass}>메모 (note)</label>
                    <input
                      type="text"
                      value={form.note}
                      disabled={pending}
                      onChange={(e) => set('note', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={pending}
                    className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                  >
                    {pending ? '추가 중…' : '방송 출연 추가하기'}
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => setSelected(null)}
                    className="text-xs text-gray-500 hover:text-gray-900"
                  >
                    취소
                  </button>
                  {error && <span className="text-xs text-red-600">{error}</span>}
                </div>
              </form>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
