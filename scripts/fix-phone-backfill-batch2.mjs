/**
 * phone backfill batch 2 — 공개 식당 잔여 4곳의 restaurants.phone 만 보강 (DB UPDATE).
 *
 * 출처: quality:audit PHONE_BACKFILL_READY 잔여분. 안전 기준(batch 1 동일):
 *   - Kakao keyword 로 DB place_id 정확 매칭(match=id) 되고,
 *   - Kakao 전화 == 기대값(TARGETS.expected) 이며,
 *   - 현재 DB phone 이 비어있을 때만 UPDATE(phone 컬럼만).
 *   - 위 조건 하나라도 어긋나면 BLOCKED(미수정). 이미 phone 있으면 SKIP.
 *   - phone 외 컬럼 절대 미수정. .is('phone', null) 가드, 영향 행 1 확인.
 *   - 기본 dry-run. 실제 UPDATE 는 --apply 일 때만.
 * 실행:
 *   node scripts/fix-phone-backfill-batch2.mjs          # dry-run
 *   node scripts/fix-phone-backfill-batch2.mjs --apply  # phone UPDATE
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

const TARGETS = [
  { slug: 'saengdal-gwangalli-boulangerie-lassence', name: '블랑제리 라센', expected: '051-710-1417' },
  { slug: 'sungsik-gwangalli-geumson-1983', name: '금손1983', expected: '051-711-1983' },
  { slug: 'sungsik-gwangalli-haejin-anago', name: '해진아나고', expected: '010-8599-1090' },
  { slug: 'tzuyang-haeundae-sanggukine', name: '상국이네', expected: '051-742-9001' },
]

const norm = (v) => String(v ?? '').trim().toLowerCase().replace(/\s+/g, '')
const blank = (v) => v === null || v === undefined || `${v}`.trim() === ''
const normPhone = (p) => String(p ?? '').replace(/\D/g, '')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const extractPlaceId = (u) => { const m = String(u ?? '').match(/place\.map\.kakao\.com\/(\d+)/); return m ? m[1] : null }
const extractGu = (a) => { const m = String(a ?? '').match(/([가-힣]+[구군])/); return m ? m[1] : null }
const inBusan = (la, ln) => la >= 34.8 && la <= 35.5 && ln >= 128.7 && ln <= 129.5
async function kakaoKeyword(key, q) {
  const r = await fetch('https://dapi.kakao.com/v2/local/search/keyword.json?size=15&query=' + encodeURIComponent(q), { headers: { Authorization: 'KakaoAK ' + key } })
  if (!r.ok) return { docs: [] }
  const j = await r.json(); return { docs: j.documents || [] }
}
async function lookup(key, name, gu, dbPlaceId) {
  const queries = [`${name} ${gu ?? '부산'}`, `${name} 부산`, name].filter((v, i, a) => v && a.indexOf(v) === i)
  for (const q of queries) {
    const { docs } = await kakaoKeyword(key, q); await sleep(130)
    if (dbPlaceId) { const d = docs.find((x) => String(x.id) === String(dbPlaceId)); if (d) return { matched: 'id', d } }
    const d = docs.find((x) => inBusan(+x.y, +x.x) && (norm(x.place_name).includes(norm(name)) || norm(name).includes(norm(x.place_name))))
    if (d) return { matched: dbPlaceId ? 'name_mismatch' : 'name_noid', d }
  }
  return { matched: null }
}

async function main() {
  loadEnv()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY, kakaoKey = process.env.KAKAO_REST_API_KEY
  if (!url || !key || !kakaoKey) { console.error('FAIL: env 누락(SUPABASE/KAKAO)'); process.exitCode = 2; return }
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

  console.log(`=== phone backfill batch 2 (${APPLY ? 'APPLY' : 'DRY-RUN'}) — 잔여 4곳 phone 만 ===`)
  let planned = 0, applied = 0, skipped = 0, blocked = 0
  for (const t of TARGETS) {
    const { data: row, error } = await sb.from('restaurants').select('id,slug,name,phone,kakao_map_url,address,is_published').eq('slug', t.slug).single()
    if (error || !row) { console.error(`  BLOCKED ${t.name}: row 조회 실패 ${error?.message ?? ''}`); blocked++; continue }
    const dbPlaceId = extractPlaceId(row.kakao_map_url)
    const gu = extractGu(row.address)
    let lk = { matched: null }
    try { lk = await lookup(kakaoKey, row.name, gu, dbPlaceId) } catch {}
    const d = lk.d
    const kakaoPhone = d ? String(d.phone ?? '').trim() : ''
    const placeMatch = lk.matched === 'id'
    const phoneMatch = kakaoPhone && normPhone(kakaoPhone) === normPhone(t.expected)
    const dbHas = !blank(row.phone)

    console.log(`\n  [${t.name}] ${t.slug} (공개 ${row.is_published})`)
    console.log(`    현재 phone : ${row.phone ?? '(없음)'}`)
    console.log(`    기대 phone : ${t.expected}`)
    console.log(`    Kakao 조회 : place_id ${dbPlaceId ?? '(DB없음)'} → match=${lk.matched ?? '없음'} / kakao_phone=${kakaoPhone || '(없음)'} / road=${d ? (d.road_address_name ?? '') : '-'}`)
    console.log(`    불변 확인  : address="${row.address}" / kakao_map_url=${row.kakao_map_url}`)

    if (dbHas) { console.log(`    → SKIP: 이미 phone 있음(보강 불필요)`); skipped++; continue }
    if (!placeMatch) { console.error(`    BLOCKED: place_id 미일치(match=${lk.matched ?? '없음'}) → 미수정`); blocked++; continue }
    if (!kakaoPhone) { console.error(`    BLOCKED: Kakao phone 없음`); blocked++; continue }
    if (!phoneMatch) { console.error(`    BLOCKED: Kakao phone(${kakaoPhone}) ≠ 기대값(${t.expected})`); blocked++; continue }

    if (!APPLY) { console.log(`    → 계획: phone 만 ${kakaoPhone} 로 UPDATE`); planned++; continue }
    const { data: upd, error: uErr } = await sb.from('restaurants').update({ phone: kakaoPhone }).eq('slug', t.slug).is('phone', null).select('slug,phone,name,address,kakao_map_url')
    if (uErr) { console.error(`    FAIL UPDATE: ${uErr.message}`); blocked++; continue }
    if ((upd?.length ?? 0) !== 1) { console.error(`    FAIL: 영향 행 ${upd?.length ?? 0} != 1`); blocked++; continue }
    console.log(`    APPLIED: phone → ${upd[0].phone} (name/address/kakao_map_url 불변)`)
    applied++
  }
  console.log(`\n요약: planned ${planned} / applied ${applied} / skipped ${skipped} / blocked ${blocked} (대상 ${TARGETS.length})`)
  if (blocked > 0) process.exitCode = 1
}
main().catch((e) => { console.error('FAIL 예외', e?.message ?? String(e)); process.exitCode = 2 })
