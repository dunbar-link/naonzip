'use client'

import { useState, useTransition } from 'react'
import {
  RESTAURANT_SOURCE_TYPES,
  type RestaurantSourceType,
} from '@/types/supabase'
import { AREA_TYPES } from '@/types/restaurant'
import { COORD_HINT, isInBusanRange } from '@/lib/coords'
import { isValidSlug, SLUG_HINT, SLUG_INVALID_MESSAGE } from '@/lib/slug'
import { convertCandidateToRestaurant } from '../../actions'

/** page.tsx 에서 계산해 넘기는 prefill 값. */
export type ConvertPrefill = {
  name: string
  source_title: string
  episode_title: string
  source_type: RestaurantSourceType | ''
  creator_name: string
  program_name: string
  video_url: string
  slug: string
}

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

const inputClass =
  'w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs disabled:opacity-50'
const labelClass = 'block text-xs font-medium text-gray-700 mb-1'

type Props = {
  candidateId: string
  prefill: ConvertPrefill
}

export default function ConvertForm({ candidateId, prefill }: Props) {
  const [form, setForm] = useState<FormState>({
    slug: prefill.slug,
    name: prefill.name,
    area: '',
    address: '',
    lat: '',
    lng: '',
    category: '',
    main_menu: '',
    price_text: '',
    source_type: prefill.source_type,
    source_title: prefill.source_title,
    phone: '',
    thumbnail: '',
    creator_name: prefill.creator_name,
    program_name: prefill.program_name,
    episode_title: prefill.episode_title,
    broadcast_date: '',
    description: '',
    video_url: prefill.video_url,
    kakao_map_url: '',
    naver_map_url: '',
    tmap_url: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [successSlug, setSuccessSlug] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setError(null)
    setSuccessSlug(null)
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccessSlug(null)

    // 클라이언트 1차 검증 (서버 검증이 최종).
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
      if (!value.trim()) {
        setError(message)
        return
      }
    }
    // slug 형식 검증(신규 생성이므로 항상). 빈값은 위 필수값 체크가 처리.
    if (form.slug.trim() && !isValidSlug(form.slug.trim())) {
      setError(SLUG_INVALID_MESSAGE)
      return
    }
    if (!Number.isFinite(Number(form.lat))) {
      setError('위도(lat)는 숫자여야 해요.')
      return
    }
    if (!Number.isFinite(Number(form.lng))) {
      setError('경도(lng)는 숫자여야 해요.')
      return
    }
    // 0,0 은 클라+서버 둘 다 차단. 범위 밖은 경고만(서버가 최종 차단).
    if (Number(form.lat) === 0 || Number(form.lng) === 0) {
      setError('좌표값을 다시 확인해 주세요.')
      return
    }

    startTransition(async () => {
      const res = await convertCandidateToRestaurant(candidateId, {
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
      if (res.ok) {
        setSuccessSlug(res.slug)
      } else {
        setError(res.error)
      }
    })
  }

  // 범위 밖 경고용 파생값(추가 state 없이 렌더 시 계산).
  // 둘 다 유한수인데 부산 범위를 벗어나면 경고만 표시(제출은 허용).
  const latNum = Number(form.lat)
  const lngNum = Number(form.lng)
  const coordsOutOfRange =
    form.lat.trim() !== '' &&
    form.lng.trim() !== '' &&
    Number.isFinite(latNum) &&
    Number.isFinite(lngNum) &&
    !isInBusanRange(latNum, lngNum)

  // slug 형식 위반 경고용 파생값(비어있지 않고 형식 위반일 때만).
  const slugInvalid = form.slug.trim() !== '' && !isValidSlug(form.slug.trim())

  // 등록 성공 후: redirect 없이 성공 메시지 + 공개 URL 링크.
  if (successSlug) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <p className="text-sm font-medium text-green-800">
          식당이 등록되었어요. (is_published=false — 아직 비공개)
        </p>
        <p className="mt-2 text-xs text-green-700">
          공개 페이지 URL (게시 전이라 비공개 상태일 수 있어요):{' '}
          <a
            href={`/restaurants/${successSlug}`}
            target="_blank"
            rel="noreferrer"
            className="font-mono underline underline-offset-2 hover:text-green-900"
          >
            /restaurants/{successSlug}
          </a>
        </p>
        <p className="mt-3 text-xs text-gray-500">
          후보는 그대로 유지됩니다(상태/삭제 변경 없음).
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-lg border border-gray-200 bg-white px-4 py-4"
    >
      <p className="mb-3 text-xs text-gray-500">
        자동 채움 값은 prefill 된 것이며 모두 수정할 수 있어요. 필수 항목(*)을 채운 뒤
        저장하면 비공개(is_published=false)로 등록됩니다.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>slug *</label>
          <input
            type="text"
            value={form.slug}
            disabled={pending}
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
          <input
            type="text"
            value={form.name}
            disabled={pending}
            onChange={(e) => set('name', e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>지역 *</label>
          <select
            value={form.area}
            disabled={pending}
            onChange={(e) => set('area', e.target.value)}
            className={inputClass}
          >
            <option value="">선택하세요</option>
            {AREA_TYPES.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>카테고리 *</label>
          <input
            type="text"
            value={form.category}
            disabled={pending}
            onChange={(e) => set('category', e.target.value)}
            className={inputClass}
            placeholder="예: 돼지국밥"
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>주소 *</label>
          <input
            type="text"
            value={form.address}
            disabled={pending}
            onChange={(e) => set('address', e.target.value)}
            className={inputClass}
            placeholder="예: 부산 부산진구 ..."
          />
        </div>

        <div>
          <label className={labelClass}>위도 lat *</label>
          <input
            type="number"
            step="any"
            value={form.lat}
            disabled={pending}
            onChange={(e) => set('lat', e.target.value)}
            className={inputClass}
            placeholder="예: 35.1579"
          />
        </div>

        <div>
          <label className={labelClass}>경도 lng *</label>
          <input
            type="number"
            step="any"
            value={form.lng}
            disabled={pending}
            onChange={(e) => set('lng', e.target.value)}
            className={inputClass}
            placeholder="예: 129.0594"
          />
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
          <input
            type="text"
            value={form.main_menu}
            disabled={pending}
            onChange={(e) => set('main_menu', e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>가격대 *</label>
          <input
            type="text"
            value={form.price_text}
            disabled={pending}
            onChange={(e) => set('price_text', e.target.value)}
            className={inputClass}
            placeholder="예: 1만원대"
          />
        </div>

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

        <div>
          <label className={labelClass}>전화</label>
          <input
            type="text"
            value={form.phone}
            disabled={pending}
            onChange={(e) => set('phone', e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>썸네일 (thumbnail)</label>
          <input
            type="text"
            value={form.thumbnail}
            disabled={pending}
            onChange={(e) => set('thumbnail', e.target.value)}
            className={inputClass}
            placeholder="이미지 URL 또는 경로"
          />
        </div>

        <div>
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

        <div>
          <label className={labelClass}>카카오맵 URL</label>
          <input
            type="url"
            value={form.kakao_map_url}
            disabled={pending}
            onChange={(e) => set('kakao_map_url', e.target.value)}
            className={inputClass}
            placeholder="https://"
          />
        </div>

        <div>
          <label className={labelClass}>네이버맵 URL</label>
          <input
            type="url"
            value={form.naver_map_url}
            disabled={pending}
            onChange={(e) => set('naver_map_url', e.target.value)}
            className={inputClass}
            placeholder="https://"
          />
        </div>

        <div>
          <label className={labelClass}>티맵 URL</label>
          <input
            type="url"
            value={form.tmap_url}
            disabled={pending}
            onChange={(e) => set('tmap_url', e.target.value)}
            className={inputClass}
            placeholder="https://"
          />
        </div>
      </div>

      <div className="mt-3">
        <label className={labelClass}>설명 (description)</label>
        <textarea
          value={form.description}
          disabled={pending}
          onChange={(e) => set('description', e.target.value)}
          rows={3}
          className={inputClass}
        />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {pending ? '등록 중…' : '식당으로 등록 (비공개)'}
        </button>
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    </form>
  )
}
