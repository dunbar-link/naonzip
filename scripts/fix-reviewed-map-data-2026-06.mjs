/**
 * REVIEW 확정 보정 — 사용자 현장 확인 완료된 2곳의 지도/주소 데이터 교정.
 *
 * 1) 시골집명품석갈비(matnyuk-sasang-doejigalbi): 현 place_id 1045757902(Kakao 미존재)+가짜 phone →
 *    Kakao 17710705(동일 업장 확인)로 교체. map_url/address/phone/lat/lng 보정.
 * 2) 양가네 양곱창(baekban-haeundae-yangs-yanggopchang): 수영구 이전(2026-04) 확인.
 *    DB place_id 15897470은 이미 현주소(수영구 감포로 106)를 가리킴 → address/lat/lng 만 현행화.
 *
 * 안전: 허용 컬럼(address/phone/lat/lng/kakao_map_url)만 UPDATE.
 *   name/slug/area/category/source/trust/public/thumbnail 무변경.
 *   현재 map_url place_id 가 기대값과 불일치하면 STOP. 대상 2 slug 외 미접근. report 파일 0(콘솔만).
 * 실행:
 *   node scripts/fix-reviewed-map-data-2026-06.mjs          # dry-run
 *   node scripts/fix-reviewed-map-data-2026-06.mjs --apply  # UPDATE
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
const ALLOWED = new Set(['address', 'phone', 'lat', 'lng', 'kakao_map_url'])

const TARGETS = [
  {
    slug: 'matnyuk-sasang-doejigalbi', name: '시골집명품석갈비', cur_place_id: '1045757902',
    set: { address: '부산 사상구 낙동대로1210번길 82', phone: '051-315-0709', lat: 35.1670253, lng: 128.9811468, kakao_map_url: 'https://place.map.kakao.com/17710705' },
  },
  {
    slug: 'baekban-haeundae-yangs-yanggopchang', name: '양가네 양곱창', cur_place_id: '15897470',
    set: { address: '부산 수영구 감포로 106', lat: 35.167940650076716, lng: 129.1178399233333 },
  },
]

async function main() {
  loadEnv()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) { console.error('FAIL: Supabase env 누락'); process.exitCode = 2; return }
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

  const slugs = TARGETS.map((t) => t.slug)
  const { data: rows, error } = await sb.from('restaurants').select('slug,name,address,phone,lat,lng,kakao_map_url,area,category,is_published').in('slug', slugs)
  if (error) { console.error('FAIL 조회', error.message); process.exitCode = 2; return }
  const bySlug = new Map((rows ?? []).map((r) => [r.slug, r]))

  console.log(`=== REVIEW 확정 보정 (${APPLY ? 'APPLY' : 'DRY-RUN'}) ===`)
  let stop = false
  for (const t of TARGETS) {
    const r = bySlug.get(t.slug)
    if (!r) { console.error(`  [STOP] ${t.slug} row 없음`); stop = true; continue }
    const curPid = extractPlaceId(r.kakao_map_url)
    if (curPid !== t.cur_place_id) { console.error(`  [STOP] ${t.slug} 현재 place_id 불일치: DB=${curPid} 기대=${t.cur_place_id}`); stop = true }
    for (const k of Object.keys(t.set)) if (!ALLOWED.has(k)) { console.error(`  [STOP] ${t.slug} 허용 외 필드: ${k}`); stop = true }
    console.log(`\n  ${t.name} (${t.slug}) cur_place_id=${curPid} ${curPid === t.cur_place_id ? 'OK' : '✗'}`)
    for (const [k, v] of Object.entries(t.set)) console.log(`    ${k}: ${r[k]}  →  ${v}`)
    console.log(`    (불변: name=${r.name} / area=${r.area} / category=${r.category} / pub=${r.is_published})`)
  }
  if (stop) { console.error('\nSTOP: 검증 실패 → 보정 차단.'); process.exitCode = 2; return }
  if (!APPLY) { console.log('\n[dry-run] --apply 로 반영.'); return }

  let updated = 0
  for (const t of TARGETS) {
    const r = bySlug.get(t.slug)
    const { data: upd, error: uErr } = await sb.from('restaurants')
      .update(t.set)
      .eq('slug', t.slug).eq('kakao_map_url', r.kakao_map_url)
      .select('slug')
    if (uErr) { console.error(`  FAIL UPDATE ${t.slug}: ${uErr.message}`); process.exitCode = 2; continue }
    if ((upd?.length ?? 0) !== 1) { console.error(`  FAIL ${t.slug}: 영향 행 ${upd?.length ?? 0}!=1`); process.exitCode = 2; continue }
    updated += 1
    console.log(`  UPDATE OK: ${t.slug}`)
  }
  console.log(`\nUPDATE 완료: ${updated}/${TARGETS.length}`)
}
main().catch((e) => { console.error('FAIL 예외', e?.message ?? String(e)); process.exitCode = 2 })
