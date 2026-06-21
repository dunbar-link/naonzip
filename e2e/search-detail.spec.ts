import { test, expect } from '@playwright/test'

// 검증 대상: 현재 공개된 실제 식당(라이브 데이터로 확인). 추측 아님.
//   - 이름이 distinctive 해서 name 필드(가중치 10)로 검색 시 상단 노출
//   - slug 안정적, 상세페이지 정상 렌더(h1 = 식당명)
const RESTAURANT_NAME = '원조가야밀면'
const SEARCH_KEYWORD = '원조가야밀면'
const EXPECTED_SLUG = 'wonjo-gaya-milmyeon'

// 나온집의 가장 중요한 공개 흐름: 검색 → 결과 확인 → 상세페이지 진입.
test('공개 식당을 검색하고 상세페이지로 이동한다', async ({ page }) => {
  const pageErrors: string[] = []
  page.on('pageerror', (err) => pageErrors.push(err.message))

  // 1. 검색 페이지 진입 (주 문서 응답 2xx 확인)
  const res = await page.goto('/search')
  expect(res, 'search page response').not.toBeNull()
  expect(res!.ok(), `search page status ${res!.status()}`).toBeTruthy()

  // 2. 검색 입력 — semantic locator(고유 placeholder). CSS nth-child/자동 class 미사용.
  const searchBox = page.getByPlaceholder('식당명, 메뉴, 방송·출처...')
  await expect(searchBox).toBeVisible()
  // 실제 타이핑(pressSequentially)으로 입력 — controlled input 의 React onChange 를 확실히 발화시킨다.
  await searchBox.click()
  await searchBox.pressSequentially(SEARCH_KEYWORD, { delay: 40 })

  // 타이핑 → state → URL 동기화(router.replace)가 끝날 때까지 대기 →
  // 리렌더 중 클릭이 무시되는 레이스를 방지(flaky 근본 원인).
  await expect(page).toHaveURL(/\/search\?q=/)

  // 3. 검색 결과에 식당명 노출(semantic 텍스트) + 해당 상세 링크(slug) 존재
  await expect(page.getByText(RESTAURANT_NAME).first()).toBeVisible()
  const resultCard = page.locator(`a[href="/restaurants/${EXPECTED_SLUG}"]`).first()
  await expect(resultCard).toBeVisible()

  // 4·5. 카드 클릭 → 상세페이지 이동(네비게이션 완료까지 대기, URL 에 slug 포함)
  await Promise.all([
    page.waitForURL(new RegExp(`/restaurants/${EXPECTED_SLUG}(?:[/?#]|$)`)),
    resultCard.click(),
  ])

  // 6. 상세 대표 heading(h1) = 식당명
  await expect(
    page.getByRole('heading', { level: 1, name: RESTAURANT_NAME }),
  ).toBeVisible()

  // 7. 안정적인 상세 정보 섹션 2개 (모든 상세페이지에 항상 존재)
  await expect(page.getByRole('heading', { name: '위치' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '어디서 봤나요' })).toBeVisible()

  // 8. 런타임 JS 오류 없음 (외부 analytics 의 일시 실패는 따로 판단하지 않음)
  expect(pageErrors, `pageerror: ${pageErrors.join(' | ')}`).toEqual([])
})
