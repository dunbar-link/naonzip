/**
 * P0 합천국밥집 단독 수정 — address / lat / lng / phone 만 교정 (DB UPDATE).
 *
 * 출처: reports/data-quality/p0-address-coordinate-preflight-2026-06 의 FIX_READY_ADDRESS_AND_COORDINATE 1건.
 * 허용 변경(이 4개만):
 *   - address : '부산 남구 용호로 235' → '부산 남구 용호로 237' (번지 235→237)
 *   - lat/lng : preflight 확정 Kakao 좌표
 *   - phone   : null → '051-622-4898' (Kakao 전화 보강)
 * 절대 미수정: place_id(kakao_map_url) / 상호 / slug / category / appearance / trust.
 * 안전:
 *   - 대상 slug 1건 외 UPDATE 금지. 영향 행 1 확인.
 *   - dry-run: 변경 후 주소(용호로 237) 재지오코딩 좌표 ↔ preflight 좌표 대조.
 *     이격 > 200m 이면 BLOCKED(미수정) — 양가네 교훈.
 *   - 기본 dry-run. 실제 UPDATE 는 --apply 일 때만.
 * 실행:
 *   node scripts/fix-p0-hapcheon-gukbap.mjs          # dry-run
 *   node scripts/fix-p0-hapcheon-gukbap.mjs --apply  # UPDATE
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

function loadEnv() {
  const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!m) continue
    let v = m[2]
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
    if (!process.env[m[1]]) process.env[m[1]] = v
  }
}
const argv = process.argv.slice(2)
const APPLY = argv.includes('--apply')

// preflight 확정값
const T = {
  slug: 'pungja-namgu-hapcheon-gukbap', name: '합천국밥집',
  expect_old_address: '부산 남구 용호로 235',
  address: '부산 남구 용호로 237',
  lat: 35.1111169, lng: 129.1113179,
  phone: '051-622-4898',
}

function distM(aLat, aLng, bLat, bLng) { const dLat = (aLat - bLat) * 111000, dLng = (aLng - bLng) * 88800; return Math.sqrt(dLat * dLat + dLng * dLng) }
const cleanAddr = (a) => { const m = String(a ?? '').match(/^(.*?(?:대?로|길)\s*\d+(?:-\d+)?)/); return m ? m[1].trim() : String(a ?? '').trim() }
async function kakaoAddr(key, q) {
  const r = await fetch('https://dapi.kakao.com/v2/local/search/address.json?query=' + encodeURIComponent(q), { headers: { Authorization: 'KakaoAK ' + key } })
  if (!r.ok) return null
  const j = await r.json(); const d = (j.documents || [])[0]
  return d && d.x && d.y ? { lat: +d.y, lng: +d.x } : null
}

async function main() {
  loadEnv()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY, kakaoKey = process.env.KAKAO_REST_API_KEY
  if (!url || !key) { console.error('FAIL: Supabase env 누락'); process.exitCode = 2; return }
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

  console.log(`=== P0 합천국밥집 수정 (${APPLY ? 'APPLY' : 'DRY-RUN'}) — address/lat/lng/phone ===`)
  const { data: row, error } = await sb.from('restaurants').select('id,slug,name,category,address,phone,lat,lng,kakao_map_url,is_published').eq('slug', T.slug).single()
  if (error || !row) { console.error(`  BLOCKED: row 조회 실패 ${error?.message ?? ''}`); process.exitCode = 2; return }

  let geo = null
  if (kakaoKey) { try { geo = await kakaoAddr(kakaoKey, cleanAddr(T.address)) } catch {} }
  const distGeo = geo ? distM(T.lat, T.lng, geo.lat, geo.lng) : null

  console.log(`\n  [${row.name}] ${row.slug} (공개 ${row.is_published})`)
  console.log(`    place_id(kakao_map_url) : ${row.kakao_map_url}  (불변)`)
  console.log(`    상호/slug/category      : ${row.name} / ${row.slug} / ${row.category}  (불변)`)
  console.log(`    주소  : "${row.address}"  →  "${T.address}"`)
  console.log(`    좌표  : ${row.lat}, ${row.lng}  →  ${T.lat}, ${T.lng}`)
  console.log(`    전화  : ${row.phone ?? '(없음)'}  →  ${T.phone}`)
  console.log(`    변경후주소 재지오코딩   : ${geo ? `${geo.lat.toFixed(7)}, ${geo.lng.toFixed(7)} (preflight와 ${Math.round(distGeo)}m)` : '실패(검증 생략)'}`)

  // 안전 가드: 현재 주소가 예상(235)과 다르면 중단
  if (String(row.address).trim() !== T.expect_old_address) {
    console.error(`    BLOCKED: 현재 주소가 예상("${T.expect_old_address}")과 불일치 → 미수정`); process.exitCode = 2; return
  }
  if (distGeo != null && distGeo > 200) { console.error(`    BLOCKED: preflight↔주소지오코딩 ${Math.round(distGeo)}m > 200m → 미수정`); process.exitCode = 2; return }

  if (!APPLY) { console.log(`\n    → 계획: address/lat/lng/phone 만 UPDATE (place_id/상호/slug/category 불변)`); console.log('요약: planned 1 / applied 0'); return }

  const { data: upd, error: uErr } = await sb.from('restaurants')
    .update({ address: T.address, lat: T.lat, lng: T.lng, phone: T.phone })
    .eq('slug', T.slug).select('slug,address,lat,lng,phone,name,category,kakao_map_url')
  if (uErr) { console.error(`    FAIL UPDATE: ${uErr.message}`); process.exitCode = 2; return }
  if ((upd?.length ?? 0) !== 1) { console.error(`    FAIL: 영향 행 ${upd?.length ?? 0} != 1`); process.exitCode = 2; return }
  const u = upd[0]
  console.log(`\n    APPLIED:`)
  console.log(`      address=${u.address} / lat=${u.lat} / lng=${u.lng} / phone=${u.phone}`)
  console.log(`      불변 재확인: name=${u.name} / category=${u.category} / kakao_map_url=${u.kakao_map_url}`)
  console.log('요약: planned 0 / applied 1')
}
main().catch((e) => { console.error('FAIL 예외', e?.message ?? String(e)); process.exitCode = 2 })
