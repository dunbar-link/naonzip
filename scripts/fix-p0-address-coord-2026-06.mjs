/**
 * P0 정합성 보정 — FIX_READY 2곳의 address/lat/lng 만 UPDATE.
 *
 * 대상: 진주식당(place_id 21319289) / 문화양곱창(place_id 8988183).
 *   - place_id 동일 확인된 구주소/오좌표 보정. Kakao 현행 주소·좌표로 교체.
 * 안전:
 *   - UPDATE 필드는 address/lat/lng 3개뿐. name/slug/category/area/phone/
 *     kakao_map_url/kakao_place_id/source/trust/public/thumbnail 무변경.
 *   - apply 전 각 row 의 kakao_map_url place_id 가 기대값과 일치하는지 검증. 불일치 1건이라도 있으면 STOP.
 *   - 대상 2 slug 외 row 미접근. 비밀키 미출력. report 파일 생성 0(콘솔만).
 * 실행:
 *   node scripts/fix-p0-address-coord-2026-06.mjs          # dry-run(현재값 vs 변경값)
 *   node scripts/fix-p0-address-coord-2026-06.mjs --apply  # UPDATE
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

const TARGETS = [
  { slug: 'baekban-yeongdo-jinju-sikdang', name: '진주식당', expect_place_id: '21319289', address: '부산 영도구 절영로14번길 2', lat: 35.0932093, lng: 129.0399487 },
  { slug: 'sungsik-seomyeon-yanggopchang', name: '문화양곱창', expect_place_id: '8988183', address: '부산 부산진구 가야대로784번길 56-8', lat: 35.1550308, lng: 129.0567126 },
]

async function main() {
  loadEnv()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) { console.error('FAIL: Supabase env 누락'); process.exitCode = 2; return }
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

  const slugs = TARGETS.map((t) => t.slug)
  const { data: rows, error } = await sb.from('restaurants').select('slug,name,address,lat,lng,phone,kakao_map_url,is_published').in('slug', slugs)
  if (error) { console.error('FAIL 조회', error.message); process.exitCode = 2; return }
  const bySlug = new Map((rows ?? []).map((r) => [r.slug, r]))

  console.log(`=== P0 주소/좌표 보정 (${APPLY ? 'APPLY' : 'DRY-RUN'}) ===`)
  let stop = false
  const plan = []
  for (const t of TARGETS) {
    const r = bySlug.get(t.slug)
    if (!r) { console.error(`  [STOP] ${t.slug} row 없음`); stop = true; continue }
    const curPid = extractPlaceId(r.kakao_map_url)
    const pidOk = curPid === t.expect_place_id
    if (!pidOk) { console.error(`  [STOP] ${t.slug} place_id 불일치: DB=${curPid} 기대=${t.expect_place_id}`); stop = true }
    console.log(`\n  ${t.name} (${t.slug}) place_id=${curPid} ${pidOk ? 'OK' : '✗'}`)
    console.log(`    address: ${r.address}  →  ${t.address}`)
    console.log(`    lat    : ${r.lat}  →  ${t.lat}`)
    console.log(`    lng    : ${r.lng}  →  ${t.lng}`)
    console.log(`    (불변: name=${r.name} / phone=${r.phone} / map_url=${r.kakao_map_url} / pub=${r.is_published})`)
    plan.push({ t, r, pidOk })
  }

  if (stop) { console.error('\nSTOP: place_id 불일치/row 없음 → 보정 차단.'); process.exitCode = 2; return }
  if (!APPLY) { console.log(`\n[dry-run] 변경 예정: ${TARGETS.length} slug × (address,lat,lng) = ${TARGETS.length * 3} 필드. --apply 로 반영.`); return }

  let updated = 0
  for (const { t } of plan) {
    const { data: upd, error: uErr } = await sb.from('restaurants')
      .update({ address: t.address, lat: t.lat, lng: t.lng })
      .eq('slug', t.slug).eq('kakao_map_url', `https://place.map.kakao.com/${t.expect_place_id}`)
      .select('slug')
    if (uErr) { console.error(`  FAIL UPDATE ${t.slug}: ${uErr.message}`); process.exitCode = 2; continue }
    if ((upd?.length ?? 0) !== 1) { console.error(`  FAIL ${t.slug}: 영향 행 ${upd?.length ?? 0}!=1 (map_url 조건 불일치 가능)`); process.exitCode = 2; continue }
    updated += 1
    console.log(`  UPDATE OK: ${t.slug}`)
  }
  console.log(`\nUPDATE 완료: ${updated}/${TARGETS.length}`)
}
main().catch((e) => { console.error('FAIL 예외', e?.message ?? String(e)); process.exitCode = 2 })
