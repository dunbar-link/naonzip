/**
 * 신뢰 출처의 최소 공개 증거 규칙.
 *
 * 공개 노출에는 확인일이 필요하다. 원천 URL은 기본으로 요구하되, 방송·유튜브는
 * 프로그램/영상 출처와 회차 정보가 남아 있으면 링크 미등록 상태를 명시해 공개할 수
 * 있다. 비공개 초안은 운영자가 검토를 계속할 수 있도록 이 값들이 비어 있어도 허용한다.
 */
export function isHttpUrl(value: string | null | undefined): boolean {
  if (!value) return false
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function isIsoDate(value: string | null | undefined): boolean {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value))
}

export function validatePublicTrustEvidence(input: {
  isPublic: boolean
  sourceKind: string
  sourceUrl: string | null | undefined
  sourceTitle: string | null | undefined
  verifiedAt: string | null | undefined
}): string | null {
  if (!input.isPublic) return null
  if (!isIsoDate(input.verifiedAt)) {
    return '공개 출처는 확인일(YYYY-MM-DD)이 필요해요. 아직 확인 전이면 공개를 해제하세요.'
  }
  if (isHttpUrl(input.sourceUrl)) return null
  const linklessBroadcast = (input.sourceKind === 'tv' || input.sourceKind === 'youtube')
    && Boolean(input.sourceTitle?.trim())
  if (linklessBroadcast) return null
  return '공개 출처는 http/https 원천 URL이 필요해요. 방송·유튜브 출처만 회차/영상 제목과 확인일이 있으면 링크 미등록으로 공개할 수 있어요.'
}
