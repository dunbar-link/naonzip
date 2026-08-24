/**
 * P0 정합성 보정 — 불백고수락 센텀본점 1곳의 address/lat/lng/phone 만 UPDATE.
 *
 * 배경: 센텀 11년 운영 후 2026-08 반여동 선수촌로 6-15 로 이전(移轉). 나온집 DB 가 구주소로 stale.
 *   근거 3중: ① Kakao place_id 987828015 동일(동명 오매칭 아님) ② 업소 공식 계정 이전 공지
 *   ③ 전화 끝 4자리 7574 일치(0507 안심번호 ↔ 051 실번호). 2026-08-16·08-17 연속 동일 확인.
 *   사용자 영향: 지도·길찾기가 약 2.3km 어긋난 위치로 안내됨.
 *
 * 안전:
 *   - UPDATE 필드는 address/lat/lng/phone 4개뿐. slug/name/area/category/kakao_map_url/
 *     kakao_place_id/source/trust/is_published/thumbnail 무변경.
 *   - apply 전 row 의 kakao_map_url place_id 가 기대값과 일치하는지 검증. 불일치면 STOP.
 *   - UPDATE 는 slug + kakao_map_url 동시 조건, 영향 행 1 이 아니면 실패 처리.
 *   - 대상 1 slug 외 row 미접근. 비밀키 미출력. report 파일 생성 0(콘솔만).
 * 실행:
 *   node scripts/fix-p0-bulbaek-gosurak-2026-08.mjs          # dry-run(현재값 vs 변경값)
 *   node scripts/fix-p0-bulbaek-gosurak-2026-08.mjs --apply  # UPDATE (Founder 승인 후에만)
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
function loadEnv() {
  const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/); if (!m) continue
    let v = m[2]; if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
    if (!process.env[m[1]]) process.env[m[1]] = v
  }
}
const APPLY = process.argv.slice(2).includes('--apply')
const extractPlaceId = (u) => { const m = String(u ?? '').match(/place\.map\.kakao\.com\/(\d+)/); return m ? m[1] : null }

const TARGET = {
  slug: 'saengdal-centum-bulbaek-gosurak',
  name: '불백고수락 센텀본점',
  expect_place_id: '987828015',
  address: '부산 해운대구 선수촌로 6-15',
  lat: 35.195155589311504,
  lng: 129.11900849475325,
  phone: '051-781-7574',
}

async function main() {
  loadEnv()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) { console.error('FAIL: Supabase env 누락'); process.exitCode = 2; return }
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

  const { data: r, error } = await sb.from('restaurants')
    .select('slug,name,area,address,lat,lng,phone,kakao_map_url,is_published')
    .eq('slug', TARGET.slug).maybeSingle()
  if (error) { console.error('FAIL 조회', error.message); process.exitCode = 2; return }
  if (!r) { console.error(`FAIL: ${TARGET.slug} row 없음`); process.exitCode = 2; return }

  const curPid = extractPlaceId(r.kakao_map_url)
  const pidOk = curPid === TARGET.expect_place_id

  console.log(`=== P0 주소/좌표/전화 보정 (${APPLY ? 'APPLY' : 'DRY-RUN'}) ===`)
  console.log(`\n  ${TARGET.name} (${TARGET.slug}) place_id=${curPid} ${pidOk ? 'OK' : '✗'}`)
  console.log(`    address: ${r.address}  →  ${TARGET.address}`)
  console.log(`    lat    : ${r.lat}  →  ${TARGET.lat}`)
  console.log(`    lng    : ${r.lng}  →  ${TARGET.lng}`)
  console.log(`    phone  : ${r.phone}  →  ${TARGET.phone}`)
  console.log(`    (불변: name=${r.name} / area=${r.area} / map_url=${r.kakao_map_url} / pub=${r.is_published})`)

  if (!pidOk) {
    console.error(`\nSTOP: place_id 불일치 DB=${curPid} 기대=${TARGET.expect_place_id} → 보정 차단.`)
    process.exitCode = 2; return
  }
  if (!APPLY) { console.log('\n[dry-run] 변경 예정: 1 slug × (address,lat,lng,phone) = 4 필드. --apply 로 반영.'); return }

  const { data: upd, error: uErr } = await sb.from('restaurants')
    .update({ address: TARGET.address, lat: TARGET.lat, lng: TARGET.lng, phone: TARGET.phone })
    .eq('slug', TARGET.slug).eq('kakao_map_url', `https://place.map.kakao.com/${TARGET.expect_place_id}`)
    .select('slug')
  if (uErr) { console.error(`  FAIL UPDATE: ${uErr.message}`); process.exitCode = 2; return }
  if ((upd?.length ?? 0) !== 1) { console.error(`  FAIL: 영향 행 ${upd?.length ?? 0}!=1 (map_url 조건 불일치 가능)`); process.exitCode = 2; return }
  console.log('\nUPDATE OK: 1/1 — 반영 후 npm run quality:audit:no-report 로 P0 0건 확인 권장.')
}
main().catch((e) => { console.error('FAIL 예외', e?.message ?? String(e)); process.exitCode = 2 })
