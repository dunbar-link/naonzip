'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  TRUST_SOURCE_KINDS,
  type TrustSourceKind,
  type RestaurantTrustSourceRow,
} from '@/types/supabase'
import {
  createTrustSource,
  updateTrustSource,
  deleteTrustSource,
  type TrustSourceInput,
} from '../../trust-source-actions'

const KIND_LABELS: Record<TrustSourceKind, string> = {
  tv: '방송(TV)',
  youtube: '유튜브',
  guide: '가이드(블루리본 등)',
  local: '로컬 추천',
  reservation: '예약 인기',
  blog: '블로그',
  operator: '운영자 확인',
  other: '기타',
}

type FormState = {
  source_kind: TrustSourceKind
  source_name: string
  source_url: string
  source_title: string
  trust_label: string
  verified_at: string
  source_note: string
  is_public: boolean
}

const BLANK: FormState = {
  source_kind: 'operator',
  source_name: '',
  source_url: '',
  source_title: '',
  trust_label: '',
  verified_at: '',
  source_note: '',
  is_public: true,
}

function rowToForm(r: RestaurantTrustSourceRow): FormState {
  return {
    source_kind: r.source_kind,
    source_name: r.source_name ?? '',
    source_url: r.source_url ?? '',
    source_title: r.source_title ?? '',
    trust_label: r.trust_label ?? '',
    verified_at: r.verified_at ?? '',
    source_note: r.source_note ?? '',
    is_public: r.is_public,
  }
}

function toInput(f: FormState): TrustSourceInput {
  return {
    source_kind: f.source_kind,
    source_name: f.source_name,
    source_url: f.source_url,
    source_title: f.source_title,
    trust_label: f.trust_label,
    verified_at: f.verified_at,
    source_note: f.source_note,
    is_public: f.is_public,
  }
}

/** 클라이언트 1차 검증(서버가 최종). 통과 시 null. */
function validate(f: FormState): string | null {
  if (!f.source_name.trim()) return '출처명을 입력하세요.'
  const u = f.source_url.trim()
  if (u) {
    try {
      const parsed = new URL(u)
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return '출처 URL은 http/https 형식이어야 해요.'
      }
    } catch {
      return '출처 URL은 http/https 형식이어야 해요.'
    }
  }
  return null
}

const inputClass =
  'w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs disabled:opacity-50'
const labelClass = 'block text-xs font-medium text-gray-700 mb-1'

type Props = {
  restaurantId: string
  slug: string
  initial: RestaurantTrustSourceRow[]
}

export default function TrustSourcePanel({ restaurantId, slug, initial }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [addForm, setAddForm] = useState<FormState>(BLANK)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<FormState>(BLANK)

  function onAdd() {
    setError(null)
    const v = validate(addForm)
    if (v) return setError(v)
    startTransition(async () => {
      const res = await createTrustSource(restaurantId, slug, toInput(addForm))
      if (res.ok) {
        setAddForm(BLANK)
        router.refresh()
      } else setError(res.error)
    })
  }

  function onSaveEdit() {
    if (!editingId) return
    setError(null)
    const v = validate(editForm)
    if (v) return setError(v)
    startTransition(async () => {
      const res = await updateTrustSource(editingId, slug, toInput(editForm))
      if (res.ok) {
        setEditingId(null)
        router.refresh()
      } else setError(res.error)
    })
  }

  function onDelete(id: string) {
    setError(null)
    if (!window.confirm('이 신뢰 출처를 삭제할까요? (비공개만 원하면 수정에서 공개 해제하세요)')) {
      return
    }
    startTransition(async () => {
      const res = await deleteTrustSource(id, slug)
      if (res.ok) {
        if (editingId === id) setEditingId(null)
        router.refresh()
      } else setError(res.error)
    })
  }

  function startEdit(r: RestaurantTrustSourceRow) {
    setError(null)
    setEditingId(r.id)
    setEditForm(rowToForm(r))
  }

  function renderFields(f: FormState, setF: (next: FormState) => void) {
    const upd = <K extends keyof FormState>(k: K, val: FormState[K]) =>
      setF({ ...f, [k]: val })
    return (
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div>
          <label className={labelClass}>출처 종류 (source_kind)</label>
          <select
            className={inputClass}
            value={f.source_kind}
            disabled={pending}
            onChange={(e) => upd('source_kind', e.target.value as TrustSourceKind)}
          >
            {TRUST_SOURCE_KINDS.map((k) => (
              <option key={k} value={k}>
                {KIND_LABELS[k]} ({k})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>출처명 (source_name) *</label>
          <input
            className={inputClass}
            value={f.source_name}
            disabled={pending}
            onChange={(e) => upd('source_name', e.target.value)}
            placeholder="예: 블루리본, 운영자 확인"
          />
        </div>
        <div>
          <label className={labelClass}>출처 URL (선택)</label>
          <input
            className={inputClass}
            type="url"
            value={f.source_url}
            disabled={pending}
            onChange={(e) => upd('source_url', e.target.value)}
            placeholder="https:// (비워둬도 됨)"
          />
        </div>
        <div>
          <label className={labelClass}>출처 제목 (source_title, 선택)</label>
          <input
            className={inputClass}
            value={f.source_title}
            disabled={pending}
            onChange={(e) => upd('source_title', e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>표시 라벨 (trust_label, 선택)</label>
          <input
            className={inputClass}
            value={f.trust_label}
            disabled={pending}
            onChange={(e) => upd('trust_label', e.target.value)}
            placeholder="예: 가이드 수록 · 운영자 확인 · 로컬 추천"
          />
        </div>
        <div>
          <label className={labelClass}>확인일 (verified_at, 선택)</label>
          <input
            className={inputClass}
            type="date"
            value={f.verified_at}
            disabled={pending}
            onChange={(e) => upd('verified_at', e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>메모 (source_note, 선택)</label>
          <textarea
            className={inputClass}
            rows={2}
            value={f.source_note}
            disabled={pending}
            onChange={(e) => upd('source_note', e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="inline-flex items-center gap-2 text-xs text-gray-700">
            <input
              type="checkbox"
              checked={f.is_public}
              disabled={pending}
              onChange={(e) => upd('is_public', e.target.checked)}
            />
            공개(is_public) — 해제하면 상세페이지 출처 칩에 노출되지 않아요
          </label>
        </div>
      </div>
    )
  }

  return (
    <section className="mt-6 rounded-lg border border-gray-200 bg-white px-4 py-4">
      <h2 className="text-sm font-bold text-gray-900">신뢰 출처</h2>
      <p className="mt-1 text-[11px] leading-relaxed text-gray-500">
        운영자가 직접 확인한 출처만 입력하세요. 외부 콘텐츠를 무단 복제하지 말고, 출처명과
        링크만 기록합니다.
      </p>
      <p className="mt-1 rounded-md bg-amber-50 px-2 py-1.5 text-[11px] leading-relaxed text-amber-700">
        “검증 완료 · 최고 · 믿을 수 있는” 같은 과장 표현은 피하고, “가이드 수록 · 운영자 확인 ·
        로컬 추천”처럼 사실 관계만 입력하세요.
      </p>

      {/* 기존 목록 */}
      <div className="mt-4">
        <h3 className="text-xs font-semibold text-gray-600 mb-2">
          등록된 출처 {initial.length}건
        </h3>
        {initial.length === 0 ? (
          <p className="text-xs text-gray-400">아직 등록된 신뢰 출처가 없어요.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {initial.map((r) =>
              editingId === r.id ? (
                <li key={r.id} className="rounded-md border border-gray-300 bg-gray-50 p-3">
                  {renderFields(editForm, setEditForm)}
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onSaveEdit}
                      disabled={pending}
                      className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                    >
                      {pending ? '저장 중…' : '저장'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null)
                        setError(null)
                      }}
                      disabled={pending}
                      className="text-xs text-gray-500 hover:text-gray-900"
                    >
                      취소
                    </button>
                  </div>
                </li>
              ) : (
                <li
                  key={r.id}
                  className="flex items-start justify-between gap-2 rounded-md border border-gray-200 p-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900">
                      {KIND_LABELS[r.source_kind] ?? r.source_kind} · {r.source_name}
                      {!r.is_public && (
                        <span className="ml-2 rounded-full bg-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                          비공개
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-[11px] text-gray-500">
                      {[r.trust_label, r.verified_at].filter(Boolean).join(' · ') || '—'}
                    </p>
                    {r.source_url && (
                      <a
                        href={r.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-0.5 inline-block max-w-full truncate text-[11px] text-blue-600 underline"
                      >
                        {r.source_url}
                      </a>
                    )}
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(r)}
                      disabled={pending}
                      className="text-xs text-gray-600 hover:text-gray-900 disabled:opacity-50"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(r.id)}
                      disabled={pending}
                      className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                    >
                      삭제
                    </button>
                  </div>
                </li>
              ),
            )}
          </ul>
        )}
      </div>

      {/* 새 출처 추가 */}
      <div className="mt-5 border-t border-gray-100 pt-4">
        <h3 className="text-xs font-semibold text-gray-600 mb-2">새 출처 추가</h3>
        {renderFields(addForm, setAddForm)}
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={onAdd}
            disabled={pending}
            className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {pending ? '추가 중…' : '추가'}
          </button>
          {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
      </div>
    </section>
  )
}
