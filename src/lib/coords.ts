/**
 * 부산 좌표 sanity check 상수/함수.
 *
 * 순수 모듈 — 'use client' 폼과 'use server' actions 양쪽에서 import 가능.
 * 외부 import / 서버 의존성 없음.
 */

/** 부산 위도(lat) 허용 범위. 경계값 포함. */
export const BUSAN_LAT_RANGE = { min: 34.8, max: 35.5 } as const

/** 부산 경도(lng) 허용 범위. 경계값 포함. */
export const BUSAN_LNG_RANGE = { min: 128.7, max: 129.5 } as const

/**
 * lat/lng 가 부산 범위 안에 있는지 검사. 경계값 포함(>=, <=).
 * finite / 0 검사는 호출부에서 별도로 수행한다.
 */
export function isInBusanRange(lat: number, lng: number): boolean {
  return (
    lat >= BUSAN_LAT_RANGE.min &&
    lat <= BUSAN_LAT_RANGE.max &&
    lng >= BUSAN_LNG_RANGE.min &&
    lng <= BUSAN_LNG_RANGE.max
  )
}

/** 좌표 입력 폼에서 공유하는 안내 문구. */
export const COORD_HINT = '카카오맵에서 위도/경도를 확인해 붙여넣어 주세요.'
