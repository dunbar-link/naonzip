/**
 * 공개 식당 품질 감사 (읽기 전용) — trust_source 0개 분류 + Kakao place_id 주소/좌표/전화 대조.
 *
 * - DB: restaurants(is_published=true) + restaurant_trust_sources(is_public) + restaurant_appearances 를 SELECT 만.
 * - Kakao: place_id(kakao_map_url) 기준 keyword 검색으로 공식 주소/좌표/전화 대조(GET 만).
 * - 분류만 한다. DB/Storage/이미지 변경 없음, 데이터 수정 없음(수정 후보로만 분류).
 * - 리포트: reports/data-quality/public-restaurant-quality-audit-2026-06.{csv,md}
 *
 * 실행: npm run quality:audit            (= node scripts/audit-public-restaurant-quality.mjs)
 *       npm run quality:audit:no-report  (= --no-report: 콘솔 summary만, reports/data-quality 파일 생성 0)
 * 안전: read-only 고정. DB 는 SELECT 만(insert/update/delete/upsert/rpc 없음), Storage 없음,
 *       Kakao 는 keyword GET 만, 파일은 reports/data-quality 결과만 생성. env 값 미출력.
 * 종료코드: 0 정상 / 2 env·조회 오류.
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
// --no-report: DB 조회/판정/콘솔 summary 는 그대로, reports/data-quality 파일 생성만 스킵(검증용).
const NO_REPORT = process.argv.slice(2).includes('--no-report')
function loadEnv() {
  let raw; try { raw = readFileSync(join(here, '..', '.env.local'), 'utf8') } catch { return }
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/); if (!m) continue
    let v = m[2]; if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
    if (!process.env[m[1]]) process.env[m[1]] = v
  }
}
const norm = (v) => String(v ?? '').trim().toLowerCase().replace(/\s+/g, '')
// 주소 정규화: '부산광역시'→'부산', '1동' 등 행정동 흔들림 흡수 후 norm
const addrNorm = (a) => norm(String(a ?? '').replace(/부산광역시/g, '부산'))
const blank = (v) => v === null || v === undefined || `${v}`.trim() === ''
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const csvCell = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s }
// 간이 거리(m): 부산 위도 35° 기준 위도 1°≈111000m, 경도 1°≈88800m
function distM(aLat, aLng, bLat, bLng) { const dLat = (aLat - bLat) * 111000; const dLng = (aLng - bLng) * 88800; return Math.sqrt(dLat * dLat + dLng * dLng) }
function extractPlaceId(u) { const m = String(u ?? '').match(/place\.map\.kakao\.com\/(\d+)/); return m ? m[1] : null }
const extractGu = (a) => { const m = String(a ?? '').match(/([가-힣]+[구군])/); return m ? m[1] : null }
// 도로명/지번 base: '○○로/길 번지' 앞부분만 비교 (층/호/건물명 차이 무시)
function addrBase(a) { const m = String(a ?? '').match(/([가-힣]+(?:대?로|길)\s*\d+(?:-\d+)?)/); return m ? norm(m[1]) : norm(a) }
const inBusan = (la, ln) => la >= 34.8 && la <= 35.5 && ln >= 128.7 && ln <= 129.5

async function kakaoKeyword(key, q) {
  const r = await fetch('https://dapi.kakao.com/v2/local/search/keyword.json?size=15&query=' + encodeURIComponent(q), { headers: { Authorization: 'KakaoAK ' + key } })
  if (!r.ok) return { http: r.status, docs: [] }
  const j = await r.json(); return { http: 0, docs: j.documents || [] }
}
// place_id 정확 매칭 우선, 없으면 이름+부산 유사 매칭
async function lookup(key, name, gu, dbPlaceId) {
  const queries = [`${name} ${gu ?? '부산'}`, `${name} 부산`, name].filter((v, i, a) => v && a.indexOf(v) === i)
  let lastHttp = 0
  for (const q of queries) {
    const { http, docs } = await kakaoKeyword(key, q); await sleep(130)
    if (http) { lastHttp = http; continue }
    if (dbPlaceId) { const d = docs.find((x) => String(x.id) === String(dbPlaceId)); if (d) return { matched: 'id', d } }
    const d = docs.find((x) => { const la = +x.y, ln = +x.x; const nameOk = norm(x.place_name).includes(norm(name)) || norm(name).includes(norm(x.place_name)); return inBusan(la, ln) && nameOk })
    if (d) return { matched: 'name', d }
  }
  return { matched: null, http: lastHttp }
}

function distOf(r, lk) {
  if (!lk || !lk.d || typeof r.lat !== 'number' || typeof r.lng !== 'number') return Infinity
  return distM(r.lat, r.lng, +lk.d.y, +lk.d.x)
}
function classifyAddress(r, lk) {
  if (!lk || lk.matched === null) return 'PLACE_LOOKUP_FAILED'
  const d = lk.d
  const dist = distOf(r, lk)
  const dbA = addrNorm(r.address), kRoad = addrNorm(d.road_address_name), kJi = addrNorm(d.address_name)
  const exact = dbA && (dbA === kRoad || dbA === kJi)
  const dbBase = addrBase(r.address)
  const baseSame = dbBase && (dbBase === addrBase(d.road_address_name) || dbBase === addrBase(d.address_name))
  // place_id 불일치 + 위치도 멂(>400m) → 다른 업장/이전 의심
  if (lk.matched === 'name' && dist > 400) return 'BUSINESS_REVIEW'
  if (exact) return 'EXACT_CURRENT'
  if (dist <= 120 || baseSame) return 'SAME_PLACE_ADDRESS_VARIANT'
  if (dist > 400) return 'ADDRESS_MISMATCH'
  return 'SAME_PLACE_ADDRESS_VARIANT'
}
function classifyCoord(r, lk) {
  if (!lk || lk.matched === null || !lk.d) return 'PLACE_LOOKUP_FAILED'
  if (typeof r.lat !== 'number' || typeof r.lng !== 'number') return 'COORDINATE_MISMATCH'
  const dist = distM(r.lat, r.lng, +lk.d.y, +lk.d.x)
  if (dist <= 120) return 'EXACT_CURRENT'
  if (dist <= 400) return 'SAME_PLACE_ADDRESS_VARIANT'
  return 'COORDINATE_MISMATCH'
}
function classifyPhone(r, lk) {
  const dbHas = !blank(r.phone)
  const kPhone = lk && lk.d ? String(lk.d.phone ?? '').trim() : ''
  if (dbHas) return '' // 전화 있음 → 누락 분류 대상 아님
  if (!lk || lk.matched === null) return 'PHONE_LOOKUP_FAILED'
  if (kPhone) return 'PHONE_BACKFILL_READY'
  return 'PHONE_NOT_AVAILABLE'
}
function classifyTrust(r, trustCount, hasApp) {
  if (trustCount > 0) return ''
  if (r.source_type === 'guide') return 'GUIDE_SOURCE_MISSING'
  if (r.source_type === 'tv' || r.source_type === 'youtube' || r.source_type === 'sns') return hasApp ? 'BROADCAST_SOURCE_MISSING' : 'LEGACY_MANUAL'
  return 'SOURCE_NOT_REQUIRED_REVIEW'
}
function recommend(addrS, coordS, phoneS, trustS) {
  if (addrS === 'ADDRESS_MISMATCH') return ['ADDRESS_FIX_REVIEW', 'P0']
  if (coordS === 'COORDINATE_MISMATCH') return ['COORDINATE_FIX_REVIEW', 'P0']
  if (addrS === 'BUSINESS_REVIEW') return ['BUSINESS_STATUS_REVIEW', 'P0']
  if (trustS === 'GUIDE_SOURCE_MISSING' || trustS === 'LEGACY_MANUAL') return ['SOURCE_BACKFILL', 'P1']
  if (phoneS === 'PHONE_BACKFILL_READY') return ['PHONE_BACKFILL', 'P2']
  if (trustS === 'BROADCAST_SOURCE_MISSING') return ['SOURCE_BACKFILL', 'P2']
  if (addrS === 'PLACE_LOOKUP_FAILED') return ['BUSINESS_STATUS_REVIEW', 'P2']
  return ['NO_ACTION', 'P3']
}

async function main() {
  loadEnv()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY, kakaoKey = process.env.KAKAO_REST_API_KEY
  console.log(`env: SUPABASE_URL ${url ? '✓' : '✗'}, SERVICE_ROLE_KEY ${key ? '✓' : '✗'}, KAKAO_REST_API_KEY ${kakaoKey ? '✓' : '✗'}`)
  if (!url || !key) { console.error('FAIL: Supabase env 누락'); process.exitCode = 2; return }
  if (!kakaoKey) { console.error('FAIL: KAKAO_REST_API_KEY 없음'); process.exitCode = 2; return }
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

  const { data: pub, error: e1 } = await sb.from('restaurants').select('id,slug,name,area,category,address,phone,lat,lng,kakao_map_url,source_type').eq('is_published', true).order('slug')
  if (e1) { console.error('FAIL restaurants', e1.message); process.exitCode = 2; return }
  const { data: ts, error: e2 } = await sb.from('restaurant_trust_sources').select('restaurant_id,is_public')
  if (e2) { console.error('FAIL trust_sources', e2.message); process.exitCode = 2; return }
  const { data: apps, error: e3 } = await sb.from('restaurant_appearances').select('restaurant_id')
  if (e3) { console.error('FAIL appearances', e3.message); process.exitCode = 2; return }

  const trustCount = new Map()
  for (const t of ts ?? []) if (t.is_public) trustCount.set(t.restaurant_id, (trustCount.get(t.restaurant_id) ?? 0) + 1)
  const hasApp = new Set((apps ?? []).map((a) => a.restaurant_id))

  console.log(`공개 식당 ${pub.length}곳 Kakao 대조 시작...`)
  const rows = []
  let done = 0
  for (const r of pub) {
    const dbPlaceId = extractPlaceId(r.kakao_map_url)
    const gu = extractGu(r.address)
    let lk = { matched: null }
    try { lk = await lookup(kakaoKey, r.name, gu, dbPlaceId) } catch (e) { lk = { matched: null, err: e?.message } }
    const d = lk.d
    const tc = trustCount.get(r.id) ?? 0
    const addrS = classifyAddress(r, lk)
    const coordS = classifyCoord(r, lk)
    const phoneS = classifyPhone(r, lk)
    const trustS = classifyTrust(r, tc, hasApp.has(r.id))
    const [action, priority] = recommend(addrS, coordS, phoneS, trustS)
    const note = []
    if (lk.matched === 'name') note.push('Kakao 검색 id≠db_place_id(이름매칭)')
    if (lk.matched === null) note.push(lk.http ? `Kakao http ${lk.http}` : 'Kakao 매칭 실패')
    if (d && r.lat && r.lng) note.push(`dist=${Math.round(distM(r.lat, r.lng, +d.y, +d.x))}m`)
    rows.push({
      slug: r.slug, name: r.name, is_public: true, area: r.area, category: r.category,
      db_place_id: dbPlaceId ?? '', db_address: r.address ?? '', db_phone: r.phone ?? '', db_lat: r.lat ?? '', db_lng: r.lng ?? '',
      kakao_place_id: d ? d.id : '', kakao_name: d ? d.place_name : '', kakao_road_address: d ? (d.road_address_name ?? '') : '',
      kakao_address: d ? (d.address_name ?? '') : '', kakao_phone: d ? (d.phone ?? '') : '', kakao_lat: d ? d.y : '', kakao_lng: d ? d.x : '',
      address_status: addrS, coordinate_status: coordS, phone_status: phoneS, trust_source_count: tc,
      trust_source_status: trustS, recommended_action: action, priority, notes: note.join(' / '),
    })
    done += 1
    if (done % 25 === 0) console.log(`  ...${done}/${pub.length}`)
  }

  // 집계
  const tally = (key) => { const m = {}; for (const r of rows) { const k = r[key] || '(none)'; m[k] = (m[k] ?? 0) + 1 } return m }
  const addrT = tally('address_status'), coordT = tally('coordinate_status'), phoneT = tally('phone_status'), trustT = tally('trust_source_status'), priT = tally('priority'), actT = tally('recommended_action')

  console.log('\n=== 공개 식당 품질 감사 요약 ===')
  console.log(`공개 식당: ${rows.length}`)
  console.log(`address_status: ${JSON.stringify(addrT)}`)
  console.log(`coordinate_status: ${JSON.stringify(coordT)}`)
  console.log(`phone_status: ${JSON.stringify(phoneT)}`)
  console.log(`trust_source_status: ${JSON.stringify(trustT)}`)
  console.log(`priority: ${JSON.stringify(priT)}`)
  console.log(`recommended_action: ${JSON.stringify(actT)}`)

  if (NO_REPORT) {
    console.log('\n(--no-report) reports/data-quality 파일 생성/수정 스킵 — 콘솔 summary 만.')
    return
  }

  const outDir = join(here, '..', 'reports', 'data-quality')
  mkdirSync(outDir, { recursive: true })
  const cols = ['slug', 'name', 'is_public', 'area', 'category', 'db_place_id', 'db_address', 'db_phone', 'db_lat', 'db_lng', 'kakao_place_id', 'kakao_name', 'kakao_road_address', 'kakao_address', 'kakao_phone', 'kakao_lat', 'kakao_lng', 'address_status', 'coordinate_status', 'phone_status', 'trust_source_count', 'trust_source_status', 'recommended_action', 'priority', 'notes']
  const csv = [cols.join(',')].concat(rows.map((r) => cols.map((c) => csvCell(r[c])).join(','))).join('\n') + '\n'
  writeFileSync(join(outDir, 'public-restaurant-quality-audit-2026-06.csv'), csv)

  const section = (title, m) => ['## ' + title, '```text', ...Object.entries(m).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}: ${v}`), '```', ''].join('\n')
  const list = (title, pred, fmt) => { const xs = rows.filter(pred); return ['## ' + title + ` (${xs.length})`, ...(xs.length ? xs.map((r) => '- ' + fmt(r)) : ['- 없음']), ''].join('\n') }
  const md = [
    '# 나온집 공개 식당 품질 감사 — 2026-06 (read-only)', '',
    '- 생성일: 2026-06-23 (KST)', `- 공개 식당: ${rows.length}곳 (Kakao place_id 대조 + trust_source 분류)`,
    '- read-only: DB SELECT + Kakao keyword GET 만. 데이터 수정 없음(수정 후보 분류만).',
    '- CSV: reports/data-quality/public-restaurant-quality-audit-2026-06.csv', '',
    section('주소 정합성(address_status)', addrT),
    section('좌표 정합성(coordinate_status)', coordT),
    section('전화 보강(phone_status, 누락분만)', phoneT),
    section('trust_source 0개 원인(trust_source_status)', trustT),
    section('우선순위(priority)', priT),
    section('권장 조치(recommended_action)', actT),
    list('P0 — 주소/좌표/업장 재검토', (r) => r.priority === 'P0', (r) => `${r.slug} (${r.name}) | ${r.address_status}/${r.coordinate_status} | db=${r.db_address} | kakao=${r.kakao_road_address || r.kakao_address} | ${r.notes}`),
    list('P1 — source 보강 우선', (r) => r.priority === 'P1', (r) => `${r.slug} (${r.name}) | ${r.trust_source_status} | ${r.area}/${r.category}`),
    list('phone 보강 가능(PHONE_BACKFILL_READY)', (r) => r.phone_status === 'PHONE_BACKFILL_READY', (r) => `${r.slug} (${r.name}) | kakao_phone=${r.kakao_phone}`),
    list('주소/좌표 수정 검토', (r) => r.address_status === 'ADDRESS_MISMATCH' || r.coordinate_status === 'COORDINATE_MISMATCH', (r) => `${r.slug} (${r.name}) | db=${r.db_address}(${r.db_lat},${r.db_lng}) | kakao=${r.kakao_road_address}(${r.kakao_lat},${r.kakao_lng})`),
    list('즉시 수정 금지 REVIEW(업장/조회실패)', (r) => r.address_status === 'BUSINESS_REVIEW' || r.address_status === 'PLACE_LOOKUP_FAILED', (r) => `${r.slug} (${r.name}) | ${r.address_status} | ${r.notes}`),
    '## 위험 작업 미실행', 'DB write 0 / Storage 0 / 이미지 0 / 데이터 수정 0 (분류만). Kakao keyword GET read-only.', '',
  ].join('\n')
  writeFileSync(join(outDir, 'public-restaurant-quality-audit-2026-06.md'), md)
  console.log('\nreports/data-quality/public-restaurant-quality-audit-2026-06.{csv,md} 생성 완료.')
}
main().catch((e) => { console.error('FAIL 예외', e?.message ?? String(e)); process.exitCode = 2 })
