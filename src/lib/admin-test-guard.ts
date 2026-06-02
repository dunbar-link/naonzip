/**
 * 테스트/더미 식당 식별 가드 (순수 모듈 — 서버 action / 클라이언트 폼 공용).
 *
 * slug / name / description 에 테스트성 패턴이 보이면 "공개 차단" 대상으로 본다.
 * 비공개 등록 자체는 막지 않는다(개발/테스트용 허용). 공개(publish) 단계에서만 가드.
 */
const TEST_PATTERN = /test|dummy|sample|테스트|샘플|__/i

export function looksLikeTestRestaurant(input: {
  slug?: string | null
  name?: string | null
  description?: string | null
}): boolean {
  const fields = [input.slug, input.name, input.description]
  return fields.some((v) => typeof v === 'string' && TEST_PATTERN.test(v))
}

/** 공개 차단 시 표시하는 메시지. */
export const TEST_PUBLISH_BLOCK_MESSAGE =
  '테스트로 보이는 식당은 공개할 수 없어요. slug/name을 확인해 주세요.'
