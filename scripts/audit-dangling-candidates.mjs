/**
 * dangling candidate 점검 스크립트 (읽기 전용).
 *
 * - 목적: candidate_queue.converted_restaurant_slug 는 채워져 있으나
 *   해당 slug 의 restaurants row 가 존재하지 않는 "dangling 후보" 를 찾는다.
 *   (draft 삭제 등으로 restaurants row 만 사라진 경우)
 * - 읽기 전용: select 만 수행하며 DB 를 절대 수정하지 않는다.
 *   (update / insert / delete / upsert / rpc 사용 금지)
 *
 * 실행: node scripts/audit-dangling-candidates.mjs
 *
 * 종료 코드:
 *   0 — dangling 0건
 *   1 — dangling 1건 이상
 *   2 — env 누락 / 조회 실패 / 예기치 못한 예외
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

  // 1) converted_restaurant_slug 가 채워진 모든 후보 조회.
  const { data: candidates, error: cErr } = await supabase
    .from('candidate_queue')
    .select(
      'id, restaurant_name, source_name, status, converted_restaurant_slug, converted_at, created_at',
    )
    .not('converted_restaurant_slug', 'is', null)
    .order('created_at', { ascending: false })

  if (cErr) {
    console.error(`FAIL: candidate_queue 조회 실패 — ${cErr.code ?? '-'} ${cErr.message}`)
    process.exitCode = 2
    return
  }

  const rows = candidates ?? []

  // 2) 참조된 slug 들이 restaurants 에 실제 존재하는지 확인.
  const slugs = [...new Set(rows.map((r) => r.converted_restaurant_slug))]
  const existing = new Set()
  if (slugs.length > 0) {
    const { data: restos, error: rErr } = await supabase
      .from('restaurants')
      .select('slug')
      .in('slug', slugs)

    if (rErr) {
      console.error(`FAIL: restaurants 조회 실패 — ${rErr.code ?? '-'} ${rErr.message}`)
      process.exitCode = 2
      return
    }
    for (const r of restos ?? []) existing.add(r.slug)
  }

  const dangling = rows.filter((r) => !existing.has(r.converted_restaurant_slug))

  // ── Summary ──────────────────────────────────────
  console.log('=== dangling candidate 점검 (읽기 전용) ===')
  console.log(`converted_restaurant_slug 있는 후보 : ${rows.length}`)
  console.log(`참조 slug 중 restaurants 존재        : ${existing.size}/${slugs.length}`)
  console.log(`dangling(연결 끊김) 후보             : ${dangling.length}`)
  console.log('')

  if (dangling.length === 0) {
    console.log('dangling 없음 — 모든 converted 후보가 유효한 restaurants 를 가리킵니다.')
    return
  }

  console.log('--- dangling 후보 목록 ---')
  for (const r of dangling) {
    console.log(
      `id=${r.id} | ${r.restaurant_name} | source=${r.source_name} | status=${r.status} | slug=${r.converted_restaurant_slug} | converted_at=${r.converted_at ?? '-'}`,
    )
  }

  process.exitCode = 1
}

main().catch((err) => {
  console.error('FAIL: 예기치 못한 예외 —', err?.message ?? String(err))
  process.exitCode = 2
})
