/**
 * restaurant slug URL-safe 검증 상수/함수.
 *
 * 순수 모듈 — 'use client' 폼과 'use server' actions 양쪽에서 import 가능.
 * 외부 import / 서버 의존성 없음.
 */

/** URL-safe slug 패턴. 영문 소문자/숫자 그룹을 하이픈으로 연결(양끝·연속 하이픈 불가). */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** slug 가 URL-safe 형식인지 검사. */
export function isValidSlug(s: string): boolean {
  return SLUG_PATTERN.test(s)
}

/** slug 형식 위반 시 표시하는 메시지. */
export const SLUG_INVALID_MESSAGE = 'slug는 영문 소문자, 숫자, 하이픈만 사용할 수 있어요.'

/** slug 입력 폼에서 공유하는 안내 문구. */
export const SLUG_HINT = '예: busan-soju-bang'
