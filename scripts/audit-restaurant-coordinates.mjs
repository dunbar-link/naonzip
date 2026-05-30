/**
 * 기존 restaurants 좌표 품질 점검 스크립트 (읽기 전용).
 *
 * - 목적: DB 의 restaurants 행에 들어있는 lat/lng 좌표가
 *   유효하고(null/NaN 아님, 0 아님) 부산 범위 안에 있는지 점검한다.
 * - 읽기 전용: select 만 수행하며 DB 를 절대 수정하지 않는다.
 *   (update / insert / delete / upsert / rpc 사용 금지)
 *
 * 실행: node scripts/audit-restaurant-coordinates.mjs
 *
 * 종료 코드:
 *   0 — 문제 0건
 *   1 — 문제 1건 이상
 *   2 — env 누락 / 조회 실패 / 예기치 못한 예외
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

// .env.local 파싱 (test-report-insert.mjs 와 동일한 B방식).
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

// src/lib/coords.ts 의 BUSAN_LAT_RANGE/BUSAN_LNG_RANGE 와 동일. 변경 시 함께 수정.
const LAT_MIN = 34.8
const LAT_MAX = 35.5
const LNG_MIN = 128.7
const LNG_MAX = 129.5

function isInBusanRange(lat, lng) {
  return lat >= LAT_MIN && lat <= LAT_MAX && lng >= LNG_MIN && lng <= LNG_MAX
}

async function main() {
  if (!url || !serviceKey) {
    // 키 값은 절대 출력하지 않는다. 누락된 키 이름만 알린다.
    console.error(
      'FAIL: env 누락 — .env.local 에 NEXT_PUBLIC_SUPABASE_URL 과 SUPABASE_SERVICE_ROLE_KEY 를 설정하세요.',
    )
    process.exitCode = 2
    return
  }

  const supabase = createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  const { data, error } = await supabase
    .from('restaurants')
    .select('id, slug, name, area, address, lat, lng, is_published')
    .order('slug')

  if (error) {
    console.error(`FAIL: restaurants 조회 실패 — ${error.code ?? '-'} ${error.message}`)
    process.exitCode = 2
    return
  }

  const rows = data ?? []
  const counts = {
    total: rows.length,
    ok: 0,
    problems: 0,
    null_or_invalid: 0,
    zero: 0,
    out_of_busan_range: 0,
  }
  const problemRows = []

  for (const r of rows) {
    const { lat, lng } = r
    let reason = null
    if (
      typeof lat !== 'number' ||
      typeof lng !== 'number' ||
      Number.isNaN(lat) ||
      Number.isNaN(lng)
    ) {
      reason = 'null_or_invalid'
    } else if (lat === 0 || lng === 0) {
      reason = 'zero'
    } else if (!isInBusanRange(lat, lng)) {
      reason = 'out_of_busan_range'
    }

    if (reason) {
      counts.problems += 1
      counts[reason] += 1
      problemRows.push({ ...r, reason })
    } else {
      counts.ok += 1
    }
  }

  // ── Summary ──────────────────────────────────────
  console.log('=== restaurants 좌표 점검 (읽기 전용) ===')
  console.log(`전체(total)            : ${counts.total}`)
  console.log(`정상(ok)               : ${counts.ok}`)
  console.log(`문제(problems)         : ${counts.problems}`)
  console.log(`  - null_or_invalid    : ${counts.null_or_invalid}`)
  console.log(`  - zero               : ${counts.zero}`)
  console.log(`  - out_of_busan_range : ${counts.out_of_busan_range}`)
  console.log('')

  // ── 문제 목록 ────────────────────────────────────
  if (problemRows.length === 0) {
    console.log('문제 없음 — 모든 좌표가 유효하고 부산 범위 안에 있습니다.')
    // 문제 0건 — exitCode 미설정(기본 0).
    return
  }

  console.log('--- 문제 행 목록 ---')
  for (const r of problemRows) {
    const pub = r.is_published ? 'published' : 'draft'
    console.log(
      `[${r.reason}] ${r.slug} | ${r.name} | area=${r.area} | lat=${r.lat} lng=${r.lng} | ${pub}`,
    )
  }

  process.exitCode = 1
}

main().catch((err) => {
  console.error('FAIL: 예기치 못한 예외 —', err?.message ?? String(err))
  process.exitCode = 2
})
