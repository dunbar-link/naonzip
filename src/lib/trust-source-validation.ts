/**
 * 신뢰 출처의 최소 공개 증거 규칙.
 *
 * 공개 노출은 출처명만으로 충분하지 않다. 사용자가 확인할 수 있는 http(s) 원천과
 * 확인일이 함께 있어야 한다. 비공개 초안은 운영자가 검토를 계속할 수 있도록
 * 이 두 값이 비어 있어도 허용한다.
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
  sourceUrl: string | null | undefined
  verifiedAt: string | null | undefined
}): string | null {
  if (!input.isPublic) return null
  if (!isHttpUrl(input.sourceUrl)) {
    return '공개 출처는 확인 가능한 http/https 원천 URL이 필요해요. 아직 확인 전이면 공개를 해제하세요.'
  }
  if (!isIsoDate(input.verifiedAt)) {
    return '공개 출처는 확인일(YYYY-MM-DD)이 필요해요. 아직 확인 전이면 공개를 해제하세요.'
  }
  return null
}
