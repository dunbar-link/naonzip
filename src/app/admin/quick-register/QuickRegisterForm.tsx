'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  RESTAURANT_SOURCE_TYPES,
  type RestaurantSourceType,
} from '@/types/supabase'
import { AREA_TYPES } from '@/types/restaurant'
import { COORD_HINT, isInBusanRange } from '@/lib/coords'
import { isValidSlug, SLUG_HINT, SLUG_INVALID_MESSAGE } from '@/lib/slug'
import {
  parseRestaurantPaste,
  RESTAURANT_PASTE_PLACEHOLDER,
} from '@/lib/admin-restaurant-paste'
import { setRestaurantPublished } from '../restaurants/actions'
import {
  quickRegisterRestaurant,
  findPossibleDuplicates,
  type DuplicateMatch,
} from './actions'

type FormState = {
  slug: string
  name: string
  area: string
  address: string
  lat: string
  lng: string
  category: string
  main_menu: string
  price_text: string
  source_type: RestaurantSourceType | ''
  source_title: string
  phone: string
  thumbnail: string
  creator_name: string
  program_name: string
  episode_title: string
  broadcast_date: string
  description: string
  video_url: string
  kakao_map_url: string
  naver_map_url: string
  tmap_url: string
}

const EMPTY: FormState = {
  slug: '',
  name: '',
  area: '',
  address: '',
  lat: '',
  lng: '',
  category: '',
  main_menu: '',
  price_text: '',
  source_type: '',
  source_title: '',
  phone: '',
  thumbnail: '',
  creator_name: '',
  program_name: '',
  episode_title: '',
  broadcast_date: '',
  description: '',
  video_url: '',
  kakao_map_url: '',
  naver_map_url: '',
  tmap_url: '',
}

const inputClass =
  'w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs disabled:opacity-50'
const labelClass = 'block text-xs font-medium text-gray-700 mb-1'

export default function QuickRegisterForm() {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [pasteText, setPasteText] = useState('')
  const [pasteIgnored, setPasteIgnored] = useState<string[]>([])
  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>([])
  const [checked, setChecked] = useState(false)
  const [checking, startChecking] = useTransition()

  const [error, setError] = useState<string | null>(null)
  const [successSlug, setSuccessSlug] = useState<string | null>(null)
  const [registering, startRegister] = useTransition()

  const [publishing, startPublish] = useTransition()
  const [publishedDone, setPublishedDone] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setError(null)
  }

  function runDuplicateCheck(next: { name?: string; slug?: string; address?: string }) {
    const name = (next.name ?? '').trim()
    const slug = (next.slug ?? '').trim()
    const address = (next.address ?? '').trim()
    if (!name && !slug && !address) return
    startChecking(async () => {
      const res = await findPossibleDuplicates({ name, slug, address })
      if (res.ok) {
        setDuplicates(res.matches)
        setChecked(true)
      }
    })
  }

  function onPasteChange(text: string) {
    setPasteText(text)
    setError(null)
    const { fields, ignored } = parseRestaurantPaste(text)
    setPasteIgnored(ignored)
    if (Object.keys(fields).length > 0) {
      // setForm 업데이터는 순수하게 유지(부수효과 금지). 중복 확인은 업데이터 밖에서 호출.
      setForm((f) => ({ ...f, ...fields }))
      runDuplicateCheck({
        name: fields.name ?? form.name,
        slug: fields.slug ?? form.slug,
        address: fields.address ?? form.address,
      })
    }
  }

  function validate(): string | null {
    const required: [string, string][] = [
      [form.slug, 'slug 를 입력하세요.'],
      [form.name, '식당명을 입력하세요.'],
      [form.area, '지역을 선택하세요.'],
      [form.address, '주소를 입력하세요.'],
      [form.category, '카테고리를 입력하세요.'],
      [form.main_menu, '대표 메뉴를 입력하세요.'],
      [form.price_text, '가격대를 입력하세요.'],
      [form.source_type, '소스 유형을 선택하세요.'],
      [form.source_title, '출처명을 입력하세요.'],
    ]
    for (const [value, message] of required) {
      if (!value.trim()) return message
    }
    if (form.slug.trim() && !isValidSlug(form.slug.trim())) return SLUG_INVALID_MESSAGE
    if (!Number.isFinite(Number(form.lat))) return '위도(lat)는 숫자여야 해요.'
    if (!Number.isFinite(Number(form.lng))) return '경도(lng)는 숫자여야 해요.'
    if (Number(form.lat) === 0 || Number(form.lng) === 0) return '좌표값을 다시 확인해 주세요.'
    return null
  }

  function onRegister(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const v = validate()
    if (v) {
      setError(v)
      return
    }
    startRegister(async () => {
      const res = await quickRegisterRestaurant({
        slug: form.slug,
        name: form.name,
        area: form.area,
        address: form.address,
        lat: form.lat,
        lng: form.lng,
        category: form.category,
        main_menu: form.main_menu,
        price_text: form.price_text,
        source_type: form.source_type,
        source_title: form.source_title,
        phone: form.phone,
        thumbnail: form.thumbnail,
        creator_name: form.creator_name,
        program_name: form.program_name,
        episode_title: form.episode_title,
        broadcast_date: form.broadcast_date,
        description: form.description,
        video_url: form.video_url,
        kakao_map_url: form.kakao_map_url,
        naver_map_url: form.naver_map_url,
        tmap_url: form.tmap_url,
      })
      if (res.ok) setSuccessSlug(res.slug)
      else setError(res.error)
    })
  }

  function onPublish() {
    if (!successSlug) return
    setPublishError(null)
    startPublish(async () => {
      const res = await setRestaurantPublished(successSlug, true)
      if (res.ok) setPublishedDone(true)
      else setPublishError(res.error)
    })
  }

  // 다음 식당 등록: 페이지 이동 없이 입력/성공/중복/공개 상태를 초기화한다.
  function resetForNext() {
    setForm(EMPTY)
    setPasteText('')
    setPasteIgnored([])
    setDuplicates([])
    setChecked(false)
    setError(null)
    setSuccessSlug(null)
    setPublishedDone(false)
    setPublishError(null)
  }

  // 등록 성공 → 같은 화면에서 공개까지.
  if (successSlug) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <p className="text-sm font-medium text-green-800">
          {publishedDone
            ? '등록과 공개를 완료했습니다.'
            : '비공개로 등록되었어요. (아직 비공개 — is_published=false)'}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={resetForNext}
            className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700"
          >
            다음 식당 등록
          </button>
          {!publishedDone && (
            <button
              type="button"
              disabled={publishing}
              onClick={onPublish}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {publishing ? '공개 처리 중…' : '바로 공개하기'}
            </button>
          )}
          <Link
            href={`/admin/restaurants/${successSlug}/preview`}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-gray-400"
          >
            관리자 미리보기로 보기
          </Link>
          {publishedDone && (
            <a
              href={`/restaurants/${successSlug}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-blue-600 hover:border-blue-400"
            >
              공개 페이지 보기 ↗
            </a>
          )}
        </div>
        {publishError && <p className="mt-2 text-xs text-red-600">{publishError}</p>}
        <p className="mt-3 text-xs text-gray-500">
          {publishedDone
            ? '공개 상태로 전환되었어요. 새 정보를 붙여넣어 계속 등록할 수 있어요.'
            : '아직 공개 전이라 공개 페이지는 404일 수 있어요. 새 정보를 붙여넣어 계속 등록할 수 있어요.'}
        </p>
      </div>
    )
  }

  const latNum = Number(form.lat)
  const lngNum = Number(form.lng)
  const coordsOutOfRange =
    form.lat.trim() !== '' &&
    form.lng.trim() !== '' &&
    Number.isFinite(latNum) &&
    Number.isFinite(lngNum) &&
    !isInBusanRange(latNum, lngNum)
  const slugInvalid = form.slug.trim() !== '' && !isValidSlug(form.slug.trim())

  return (
    <form onSubmit={onRegister} className="rounded-lg border border-gray-200 bg-white px-4 py-4">
      {/* 빠른 붙여넣기 */}
      <div className="mb-4">
        <label className={labelClass}>빠른 붙여넣기</label>
        <textarea
          value={pasteText}
          disabled={registering}
          onChange={(e) => onPasteChange(e.target.value)}
          rows={8}
          className={inputClass}
          placeholder={RESTAURANT_PASTE_PLACEHOLDER}
        />
        <p className="mt-1 text-[11px] text-gray-400">
          방송 맛집 정보를 한 번 붙여넣으면 아래 칸이 자동으로 채워지고 중복 후보를 확인해요.
        </p>
        {pasteIgnored.length > 0 && (
          <ul className="mt-1 space-y-0.5 text-[10px] text-amber-600">
            {pasteIgnored.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        )}
      </div>

      {/* 중복 후보 */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={checking}
            onClick={() => runDuplicateCheck(form)}
            className="rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:border-gray-400 disabled:opacity-50"
          >
            {checking ? '확인 중…' : '중복 확인'}
          </button>
          <span className="text-[11px] text-gray-400">
            이름/slug/주소로 기존 식당을 조회해요.
          </span>
        </div>
        {duplicates.length > 0 ? (
          <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs font-medium text-amber-800">
              이미 등록된 식당일 수 있습니다. 새로 등록하지 말고 기존 식당에 방송 출연을
              추가하세요.
              <span className="block font-normal text-amber-700">
                (출연 추가는 후보 검토 → 등록 준비(convert) 흐름을 사용하세요)
              </span>
            </p>
            <ul className="mt-2 space-y-1">
              {duplicates.map((m) => (
                <li key={m.id} className="flex flex-wrap items-center gap-x-2 text-[11px] text-gray-700">
                  <span className="font-medium">{m.name}</span>
                  <span className="text-gray-400">/ {m.area}</span>
                  <span className="text-gray-400 truncate max-w-[18rem]">/ {m.address}</span>
                  <span className={m.is_published ? 'text-green-600' : 'text-amber-600'}>
                    / {m.is_published ? '공개됨' : '비공개'}
                  </span>
                  <Link
                    href={`/admin/restaurants/${m.slug}/preview`}
                    className="text-blue-600 underline underline-offset-2"
                  >
                    상세보기
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          checked && (
            <p className="mt-2 text-[11px] text-gray-500">중복 가능 식당 없음.</p>
          )
        )}
      </div>

      {/* 입력 필드 */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>slug *</label>
          <input
            type="text"
            value={form.slug}
            disabled={registering}
            onChange={(e) => set('slug', e.target.value)}
            className={inputClass}
            placeholder="예: busan-gukbap"
          />
          <p className="mt-1 text-xs text-gray-500">{SLUG_HINT}</p>
          {slugInvalid && (
            <p className="mt-1 text-[10px] text-amber-600">{SLUG_INVALID_MESSAGE}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>식당명 *</label>
          <input type="text" value={form.name} disabled={registering} onChange={(e) => set('name', e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>지역 *</label>
          <select value={form.area} disabled={registering} onChange={(e) => set('area', e.target.value)} className={inputClass}>
            <option value="">선택하세요</option>
            {AREA_TYPES.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>카테고리 *</label>
          <input type="text" value={form.category} disabled={registering} onChange={(e) => set('category', e.target.value)} className={inputClass} placeholder="예: 돼지국밥" />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>주소 *</label>
          <input type="text" value={form.address} disabled={registering} onChange={(e) => set('address', e.target.value)} className={inputClass} placeholder="예: 부산 부산진구 ..." />
        </div>

        <div>
          <label className={labelClass}>위도 lat *</label>
          <input type="number" step="any" value={form.lat} disabled={registering} onChange={(e) => set('lat', e.target.value)} className={inputClass} placeholder="예: 35.1579" />
        </div>

        <div>
          <label className={labelClass}>경도 lng *</label>
          <input type="number" step="any" value={form.lng} disabled={registering} onChange={(e) => set('lng', e.target.value)} className={inputClass} placeholder="예: 129.0594" />
        </div>

        <div className="sm:col-span-2">
          <p className="text-xs text-gray-500">{COORD_HINT}</p>
          {coordsOutOfRange && (
            <p className="mt-1 text-[10px] text-amber-600">
              좌표가 부산 범위를 벗어난 것 같아요. 값을 다시 확인해 주세요.
            </p>
          )}
        </div>

        <div>
          <label className={labelClass}>대표 메뉴 *</label>
          <input type="text" value={form.main_menu} disabled={registering} onChange={(e) => set('main_menu', e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>가격대 *</label>
          <input type="text" value={form.price_text} disabled={registering} onChange={(e) => set('price_text', e.target.value)} className={inputClass} placeholder="예: 1만원대" />
        </div>

        <div>
          <label className={labelClass}>소스 유형 *</label>
          <select value={form.source_type} disabled={registering} onChange={(e) => set('source_type', e.target.value as RestaurantSourceType | '')} className={inputClass}>
            <option value="">선택하세요</option>
            {RESTAURANT_SOURCE_TYPES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>출처명 (source_title) *</label>
          <input type="text" value={form.source_title} disabled={registering} onChange={(e) => set('source_title', e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>크리에이터명 (creator_name)</label>
          <input type="text" value={form.creator_name} disabled={registering} onChange={(e) => set('creator_name', e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>프로그램명 (program_name)</label>
          <input type="text" value={form.program_name} disabled={registering} onChange={(e) => set('program_name', e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>에피소드</label>
          <input type="text" value={form.episode_title} disabled={registering} onChange={(e) => set('episode_title', e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>방영일</label>
          <input type="date" value={form.broadcast_date} disabled={registering} onChange={(e) => set('broadcast_date', e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>전화</label>
          <input type="text" value={form.phone} disabled={registering} onChange={(e) => set('phone', e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>썸네일 (thumbnail)</label>
          <input type="text" value={form.thumbnail} disabled={registering} onChange={(e) => set('thumbnail', e.target.value)} className={inputClass} placeholder="이미지 URL 또는 경로" />
        </div>

        <div>
          <label className={labelClass}>영상 URL (video_url)</label>
          <input type="url" value={form.video_url} disabled={registering} onChange={(e) => set('video_url', e.target.value)} className={inputClass} placeholder="https://" />
        </div>

        <div>
          <label className={labelClass}>카카오맵 URL</label>
          <input type="url" value={form.kakao_map_url} disabled={registering} onChange={(e) => set('kakao_map_url', e.target.value)} className={inputClass} placeholder="https://" />
        </div>

        <div>
          <label className={labelClass}>네이버맵 URL</label>
          <input type="url" value={form.naver_map_url} disabled={registering} onChange={(e) => set('naver_map_url', e.target.value)} className={inputClass} placeholder="https://" />
        </div>

        <div>
          <label className={labelClass}>티맵 URL</label>
          <input type="url" value={form.tmap_url} disabled={registering} onChange={(e) => set('tmap_url', e.target.value)} className={inputClass} placeholder="https://" />
          <p className="mt-1 text-[10px] text-gray-400">
            네이버맵·티맵 URL은 비워둬도 공개 페이지에서 좌표로 자동 생성돼요.
          </p>
        </div>
      </div>

      <div className="mt-3">
        <label className={labelClass}>설명 (description)</label>
        <textarea value={form.description} disabled={registering} onChange={(e) => set('description', e.target.value)} rows={3} className={inputClass} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={registering}
          className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {registering ? '등록 중…' : '비공개로 등록'}
        </button>
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
      <p className="mt-2 text-[11px] text-gray-400">
        등록은 항상 비공개(is_published=false)로 저장돼요. 공개는 등록 후 “바로 공개하기”로
        직접 진행합니다.
      </p>
    </form>
  )
}
