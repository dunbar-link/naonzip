'use client'

import { useState } from 'react'

/**
 * 식당 대표이미지 표시 + 저작권 안전 fallback.
 * - thumbnail URL 이 있으면 <img> 로 표시(외부 도메인 image 설정 회피 위해 next/image 대신 img).
 * - 로딩 실패(onError) 또는 thumbnail 없음 → 카테고리 그라데이션 + 이모지 fallback.
 * - 외부 이미지를 하드코딩/다운로드하지 않는다. DB 에 들어온 URL 만 렌더한다.
 */
const CATEGORY_EMOJI: Record<string, string> = {
  돼지국밥: '🍲',
  고기: '🥩',
  곱창: '🍢',
  해산물: '🦀',
  회: '🐟',
  밀면: '🍜',
  '분식/길거리': '🥢',
  한식: '🍱',
  중식: '🥟',
  일식: '🍣',
  아시안: '🍜',
  '버거/양식': '🍔',
  '베이커리/디저트': '🥐',
}

function emojiFor(category: string): string {
  if (CATEGORY_EMOJI[category]) return CATEGORY_EMOJI[category]
  // 부분 매칭(예: "고기/곱창", "회/해산물" 등 합성 카테고리 대응).
  if (/곱창|막창/.test(category)) return '🍢'
  if (/고기|갈비|불고기/.test(category)) return '🥩'
  if (/회|해산물|수산|장어|곰장어/.test(category)) return '🐟'
  if (/국밥|국수|면|밀면|냉면/.test(category)) return '🍜'
  if (/빵|베이커리|디저트|과자/.test(category)) return '🥐'
  if (/분식|떡볶이|길거리/.test(category)) return '🥢'
  return '🍽️'
}

type Props = {
  thumbnail?: string | null
  category: string
  alt: string
  /** 컨테이너 크기/모양 클래스 (예: 'h-28 w-full', 'w-24', 'h-52 w-full'). */
  className?: string
  /** fallback 이모지 크기 클래스. */
  emojiClassName?: string
}

export default function RestaurantImage({
  thumbnail,
  category,
  alt,
  className = '',
  emojiClassName = 'text-4xl',
}: Props) {
  const [errored, setErrored] = useState(false)
  const showImage = Boolean(thumbnail) && !errored

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 to-amber-100 ${className}`}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnail as string}
          alt={alt}
          loading="lazy"
          onError={() => setErrored(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <span className={emojiClassName} aria-hidden>
          {emojiFor(category)}
        </span>
      )}
    </div>
  )
}
