/**
 * 검색 정확도 유닛 테스트 (read-only) — 브라우저/DOM 없이 searchRestaurants 를 직접 검증한다.
 *
 * - 실데이터: Supabase REST(anon, is_published=true) 로 공개 식당 + 공개 trust 출처를 받아
 *   앱과 동일한 검색 필드(Restaurant)로 매핑 → src/lib/search.ts 의 searchRestaurants 직접 호출.
 * - Node 24 의 기본 TS 지원으로 .ts 를 그대로 import (search.ts 는 import type 만 → 런타임 의존 0).
 * - 판정: 신규/기존 검색어 결과 ≥1(+기대 키워드 포함), zzznonexistent=0. 하나라도 어긋나면 FAIL.
 * - 안전: read-only HTTP GET, 변경 0, 외부 패키지 0(Node 내장만).
 * 실행: node --env-file=.env.local scripts/check-search-unit.mjs  (종료코드 0 PASS / 1 FAIL / 2 BLOCKED)
 */
import https from 'node:https'
import process from 'node:process'
import { searchRestaurants } from '../src/lib/search.ts'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('BLOCKED: NEXT_PUBLIC_SUPABASE_URL / ANON_KEY 없음 — `node --env-file=.env.local` 로 실행하세요.')
  process.exit(2)
}

function getJson(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { apikey: SUPABASE_KEY, authorization: `Bearer ${SUPABASE_KEY}` } }, (r) => {
      let b = ''
      r.setEncoding('utf8')
      r.on('data', (c) => (b += c))
      r.on('end', () => {
        try { resolve({ status: r.statusCode, data: JSON.parse(b) }) }
        catch { resolve({ status: r.statusCode, data: null }) }
      })
    }).on('error', (e) => resolve({ error: String(e) }))
  })
}

// 실데이터 로드: 공개 식당 + 공개 trust 출처(nested). 검색이 쓰는 필드만 Restaurant 형태로 매핑.
const sel = encodeURIComponent('*,restaurant_trust_sources(source_name,trust_label,is_public)')
const res = await getJson(`${SUPABASE_URL}/rest/v1/restaurants?select=${sel}&is_published=eq.true`)
if (res.error || res.status !== 200 || !Array.isArray(res.data)) {
  console.error(`BLOCKED: restaurants fetch 실패 (status=${res.status ?? res.error})`)
  process.exit(2)
}

const restaurants = res.data.map((row) => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  area: row.area,
  address: row.address,
  category: row.category,
  mainMenu: row.main_menu,
  creatorName: row.creator_name ?? undefined,
  programName: row.program_name ?? undefined,
  episodeTitle: row.episode_title ?? undefined,
  sourceTitle: row.source_title,
  description: row.description ?? undefined,
  trustSources: (row.restaurant_trust_sources ?? []).map((t) => ({
    sourceName: t.source_name,
    trustLabel: t.trust_label ?? undefined,
    isPublic: t.is_public,
  })),
}))

console.log(`=== 검색 정확도 유닛 테스트 (실데이터 ${restaurants.length}곳) ===`)

let pass = 0
let fail = 0
function check(label, ok, detail) {
  if (ok) pass++
  else fail++
  console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${label}${detail ? ' — ' + detail : ''}`)
}

// 결과 ≥1, keyword 지정 시 결과 식당명에 keyword 포함(검색 정확도).
function hit(q, keyword) {
  const r = searchRestaurants(q, restaurants)
  const names = r.map((x) => x.name)
  const kwOk = !keyword || names.some((n) => n.includes(keyword))
  check(`"${q}" → ${r.length}곳${keyword ? ` (기대 키워드:${keyword})` : ''}`, r.length >= 1 && kwOk,
    r.length ? `대표: ${names.slice(0, 3).join(', ')}` : '결과 0')
}
function zero(q) {
  const r = searchRestaurants(q, restaurants)
  check(`"${q}" → 0곳(기대 0)`, r.length === 0, r.length ? `예상외 ${r.length}곳` : '정상')
}

console.log('-- 신규(접미어/동의어 확장) --')
hit('밀면맛집', '밀면')
hit('밀면집', '밀면')
hit('국밥집', '국밥')
hit('국밥맛집', '국밥')
hit('돼지국밥맛집', '국밥')
hit('돼지', '국밥')
hit('고기맛집')
hit('회맛집')
hit('회집')
zero('zzznonexistent')

console.log('-- 기존(회귀) --')
hit('밀면', '밀면')
hit('국밥', '국밥')
hit('회')
hit('광안리')
hit('성시경')
hit('전현무')
hit('쯔양')

console.log(`\n=== 검색 유닛: ${fail === 0 ? 'PASS' : 'FAIL'} (${pass}/${pass + fail}) ===`)
process.exit(fail === 0 ? 0 : 1)
