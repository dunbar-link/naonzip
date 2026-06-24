/**
 * P0 좌표 수정 batch 1 — FIX_READY 5곳의 restaurants.lat/lng 만 교정 (DB UPDATE).
 *
 * 출처: reports/data-quality/p0-address-coordinate-preflight-2026-06 의 FIX_READY_COORDINATE_ONLY 확정분.
 * 안전:
 *   - lat/lng 외 컬럼(place_id/주소/전화/상호/slug/category/appearance/trust)은 절대 미수정.
 *   - 대상 5 slug 외 UPDATE 금지. 영향 행 1 확인.
 *   - dry-run: DB 현재좌표 + preflight 좌표 + Kakao 주소 재지오코딩 좌표 3중 대조.
 *     preflight ↔ 주소지오코딩 이격 > 200m 이면 해당 식당 BLOCKED(미수정) — 양가네 교훈(keyword 좌표 맹신 금지).
 *   - 기본 dry-run. 실제 UPDATE 는 --apply 일 때만.
 * 실행:
 *   node scripts/fix-p0-coordinates-batch1.mjs          # dry-run
 *   node scripts/fix-p0-coordinates-batch1.mjs --apply  # lat/lng UPDATE
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

// preflight FIX_READY_COORDINATE_ONLY 확정 좌표 (CSV kakao_lat/lng)
const TARGETS = [
  { slug: 'saengdal-suyeong-sushibashiku', name: '스시바시쿠', lat: 35.1569712, lng: 129.1208122 },
  { slug: 'samdae-seomyeon-gijang-son-kalguksu', name: '기장손칼국수', lat: 35.1555085, lng: 129.0583003 },
  { slug: 'wonjo-gaya-milmyeon', name: '원조가야밀면', lat: 35.1036816, lng: 128.9701903 },
  { slug: 'saengdal-geumjeong-songs-bakery', name: '송스 베이커리', lat: 35.2399911, lng: 129.0897874 },
  { slug: 'saengdal-saha-cheramie', name: '쉐라미과자점', lat: 35.0996782, lng: 128.9910533 },
]

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

  console.log(`=== P0 좌표 수정 batch 1 (${APPLY ? 'APPLY' : 'DRY-RUN'}) — 5곳 lat/lng 만 ===`)
  let planned = 0, applied = 0, blocked = 0
  for (const t of TARGETS) {
    const { data: row, error } = await sb.from('restaurants').select('id,slug,name,address,phone,lat,lng,kakao_map_url,is_published').eq('slug', t.slug).single()
    if (error || !row) { console.error(`  BLOCKED ${t.name}: row 조회 실패 ${error?.message ?? ''}`); blocked++; continue }

    let geo = null
    if (kakaoKey) { try { geo = await kakaoAddr(kakaoKey, cleanAddr(row.address)) } catch {} }
    const distPre = distM(row.lat, row.lng, t.lat, t.lng)
    const distGeo = geo ? distM(t.lat, t.lng, geo.lat, geo.lng) : null

    console.log(`\n  [${t.name}] ${t.slug} (공개 ${row.is_published})`)
    console.log(`    현재 lat/lng : ${row.lat}, ${row.lng}`)
    console.log(`    preflight    : ${t.lat}, ${t.lng}  (현재와 ${Math.round(distPre)}m 이동)`)
    console.log(`    주소지오코딩 : ${geo ? `${geo.lat.toFixed(7)}, ${geo.lng.toFixed(7)} (preflight와 ${Math.round(distGeo)}m)` : '실패(검증 생략)'}`)
    console.log(`    불변 확인    : address="${row.address}" / kakao_map_url=${row.kakao_map_url} / phone=${row.phone ?? '-'}`)

    if (distGeo != null && distGeo > 200) { console.error(`    BLOCKED: preflight↔주소지오코딩 ${Math.round(distGeo)}m > 200m → 미수정(좌표 신뢰 불가)`); blocked++; continue }

    if (!APPLY) { console.log(`    → 계획: lat/lng 만 ${t.lat}, ${t.lng} 로 UPDATE (그 외 컬럼 불변)`); planned++; continue }

    const { data: upd, error: uErr } = await sb.from('restaurants').update({ lat: t.lat, lng: t.lng }).eq('slug', t.slug).select('slug,lat,lng,address,phone,kakao_map_url')
    if (uErr) { console.error(`    FAIL UPDATE: ${uErr.message}`); blocked++; continue }
    if ((upd?.length ?? 0) !== 1) { console.error(`    FAIL: 영향 행 ${upd?.length ?? 0} != 1`); blocked++; continue }
    console.log(`    APPLIED: lat/lng → ${upd[0].lat}, ${upd[0].lng} (address/phone/kakao_map_url 불변 재확인)`)
    applied++
  }
  console.log(`\n요약: planned ${planned} / applied ${applied} / blocked ${blocked} (대상 ${TARGETS.length})`)
  if (blocked > 0) process.exitCode = 1
}
main().catch((e) => { console.error('FAIL 예외', e?.message ?? String(e)); process.exitCode = 2 })
