import { revalidatePath } from 'next/cache'

/**
 * 식당 변경(공개/비공개/수정/삭제) 시 갱신해야 할 public 경로를 한 번에 무효화한다.
 *
 * 배경: 목록/검색/지도/홈/landing/sitemap 은 모두 getRestaurants() 계열을 쓰는
 * 정적(ISR) 페이지라, 상세 경로만 revalidate 하면 검색 결과 등에 삭제/비공개된
 * 식당이 계속 남는다. 이 함수로 관련 경로를 폭넓게 무효화한다.
 *
 * - 루트성 정적 페이지: /, /restaurants, /search, /map, /sitemap.xml
 * - 상세(dynamic): 전달된 slug 들의 구체 경로 + 템플릿
 * - landing(dynamic): area/program/creator/category 템플릿 전체
 *   (어느 식당이 빠졌는지 계산하지 않고 템플릿 단위로 안전하게 무효화)
 *
 * @param slugs old/new slug 등 함께 무효화할 상세 slug 목록(빈 값 무시).
 */
export function revalidateRestaurantPublicPaths(
  slugs: Array<string | null | undefined> = [],
): void {
  // 루트성 목록/검색/지도/홈/사이트맵
  revalidatePath('/')
  revalidatePath('/restaurants')
  revalidatePath('/search')
  revalidatePath('/map')
  revalidatePath('/sitemap.xml')

  // 상세: dynamic 템플릿 + 구체 slug(old/new)
  revalidatePath('/restaurants/[slug]', 'page')
  for (const slug of slugs) {
    if (slug) revalidatePath(`/restaurants/${slug}`)
  }

  // landing: area/program/creator/category 템플릿 전체 무효화
  revalidatePath('/area/[slug]', 'page')
  revalidatePath('/program/[slug]', 'page')
  revalidatePath('/creator/[slug]', 'page')
  revalidatePath('/category/[slug]', 'page')
}
