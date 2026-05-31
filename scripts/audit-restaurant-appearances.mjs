/**
 * restaurant_appearances 점검 스크립트 (읽기 전용).
 *
 * - 목적: dual-write 준비(Step 0) 상태를 점검한다.
 *   restaurants 대비 appearances 적재 현황, appearance 없는 식당,
 *   한 식당에 2개 이상 출연, 부모 없는 dangling appearance 를 집계한다.
 * - 읽기 전용: select 만 수행하며 DB 를 절대 수정하지 않는다.
 *   (update / insert / delete / upsert / rpc 사용 금지)
 *
 * 실행: node scripts/audit-restaurant-appearances.mjs
 *
 * 종료 코드:
 *   0 — 문제 0건 (dangling appearance 없음)
 *   1 — dangling appearance 1건 이상
 *   2 — env 누락 / 테이블 없음(Step 0 SQL 미실행) / 조회 실패 / 예기치 못한 예외
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

// .env.local 파싱 (audit-restaurant-coordinates.mjs 와 동일한 방식).
// 기존 process.env 값은 보존하고, 없는 키만 주입한다. 값은 출력 금지.
const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
for (const line of raw.split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (!m) continue
  let value = m[2]
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1)
  }
  if (!process.env[m[1]]) process.env[m[1]] = value
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// 테이블이 아직 없을 때(Step 0 SQL 미실행) 반환되는 코드.
//   - 42P01  : Postgres undefined_table (직접 SQL)
//   - PGRST205: PostgREST schema cache 에 테이블 없음 (Supabase REST)
const MISSING_TABLE_CODES = new Set(['42P01', 'PGRST205'])

async function main() {
  if (!url || !serviceKey) {
    console.error(
      'FAIL: env 누락 — .env.local 에 NEXT_PUBLIC_SUPABASE_URL 과 SUPABASE_SERVICE_ROLE_KEY 를 설정하세요.',
    )
    process.exitCode = 2
    return
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  // 1) restaurants id 목록.
  const { data: restos, error: rErr } = await supabase
    .from('restaurants')
    .select('id')

  if (rErr) {
    console.error(`FAIL: restaurants 조회 실패 — ${rErr.code ?? '-'} ${rErr.message}`)
    process.exitCode = 2
    return
  }

  // 2) appearances 목록 (restaurant_id 만).
  const { data: apps, error: aErr } = await supabase
    .from('restaurant_appearances')
    .select('id, restaurant_id')

  if (aErr) {
    if (MISSING_TABLE_CODES.has(aErr.code)) {
      console.error(
        'SKIP: restaurant_appearances 테이블이 아직 없습니다 (Step 0 SQL 미실행).',
      )
      console.error(
        '      supabase/schema.sql 의 restaurant_appearances 블록을 Supabase SQL Editor 에서 실행한 뒤 다시 돌려주세요.',
      )
      process.exitCode = 2
      return
    }
    console.error(`FAIL: restaurant_appearances 조회 실패 — ${aErr.code ?? '-'} ${aErr.message}`)
    process.exitCode = 2
    return
  }

  const restoIds = new Set((restos ?? []).map((r) => r.id))
  const appRows = apps ?? []

  // 식당별 appearance 수 + dangling 집계.
  const countByRestaurant = new Map()
  let dangling = 0
  for (const a of appRows) {
    if (!restoIds.has(a.restaurant_id)) {
      dangling += 1
      continue
    }
    countByRestaurant.set(a.restaurant_id, (countByRestaurant.get(a.restaurant_id) ?? 0) + 1)
  }

  const totalRestaurants = restoIds.size
  const totalAppearances = appRows.length
  const withAppearance = countByRestaurant.size
  const withoutAppearance = totalRestaurants - withAppearance
  let multiAppearance = 0
  for (const c of countByRestaurant.values()) {
    if (c >= 2) multiAppearance += 1
  }

  // ── Summary ──────────────────────────────────────
  console.log('=== restaurant_appearances 점검 (읽기 전용) ===')
  console.log(`restaurants 총 수              : ${totalRestaurants}`)
  console.log(`appearances 총 수             : ${totalAppearances}`)
  console.log(`appearance 없는 restaurants   : ${withoutAppearance}`)
  console.log(`appearance 2개 이상 식당      : ${multiAppearance}`)
  console.log(`dangling appearance(부모 없음): ${dangling}`)
  console.log('')

  if (withoutAppearance > 0) {
    console.log(
      `참고: appearance 없는 식당 ${withoutAppearance}건 — backfill 미실행이거나 source_title 빈 row일 수 있어요(정상 가능).`,
    )
  }

  if (dangling > 0) {
    console.log(`경고: 부모 restaurant 가 없는 appearance ${dangling}건 — 데이터 정합성 확인 필요.`)
    process.exitCode = 1
    return
  }

  console.log('문제 없음 — dangling appearance 0건.')
}

main().catch((err) => {
  console.error('FAIL: 예기치 못한 예외 —', err?.message ?? String(err))
  process.exitCode = 2
})
