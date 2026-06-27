/**
 * 양가네양곱창 area 정합성 보정 — area 만 '해운대' → '광안리'.
 *
 * 근거: 수영구(광안동/남천동/민락동) 식당은 DB 에서 area='광안리' 로 일관 분류
 *   (예: 해진아나고·진미언양 = 같은 광안동, area 광안리). 양가네는 수영구 이전(감포로 106, 광안동)
 *   후에도 area 가 '해운대'로 남아 현주소와 불일치 → '광안리' 로 교정.
 * 안전: area 1필드만 UPDATE. name/slug/address/lat/lng/phone/kakao_map_url/category/
 *   source/trust/public/thumbnail 무변경. 현재 area='해운대' + address 에 '수영구' 포함 확인 후만.
 *   대상 1 slug 외 미접근. report 파일 0(콘솔만).
 * 실행:
 *   node scripts/fix-yanggane-area-2026-06.mjs          # dry-run
 *   node scripts/fix-yanggane-area-2026-06.mjs --apply  # UPDATE
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
const T = { slug: 'baekban-haeundae-yangs-yanggopchang', cur_area: '해운대', new_area: '광안리', addr_must_include: '수영구' }

async function main() {
  loadEnv()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) { console.error('FAIL: Supabase env 누락'); process.exitCode = 2; return }
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

  const { data: r, error } = await sb.from('restaurants')
    .select('slug,name,area,address,lat,lng,phone,kakao_map_url,category,is_published')
    .eq('slug', T.slug).single()
  if (error || !r) { console.error('FAIL 조회/row 없음', error?.message); process.exitCode = 2; return }

  console.log(`=== 양가네 area 보정 (${APPLY ? 'APPLY' : 'DRY-RUN'}) ===`)
  console.log(`  현재: area=${r.area} / address=${r.address} / name=${r.name}`)
  console.log(`  변경: area ${r.area} → ${T.new_area}  (불변: address/lat/lng/phone/map_url/category/pub)`)

  let stop = false
  if (r.area !== T.cur_area) { console.error(`  [STOP] 현재 area '${r.area}' != 기대 '${T.cur_area}'`); stop = true }
  if (!String(r.address ?? '').includes(T.addr_must_include)) { console.error(`  [STOP] address 에 '${T.addr_must_include}' 없음(현주소 미보정 의심)`); stop = true }
  if (stop) { console.error('\nSTOP: 검증 실패 → area 보정 차단.'); process.exitCode = 2; return }

  if (!APPLY) { console.log('\n[dry-run] area 1필드만 변경 예정. --apply 로 반영.'); return }

  const { data: upd, error: uErr } = await sb.from('restaurants')
    .update({ area: T.new_area })
    .eq('slug', T.slug).eq('area', T.cur_area)
    .select('slug,area')
  if (uErr) { console.error('FAIL UPDATE', uErr.message); process.exitCode = 2; return }
  if ((upd?.length ?? 0) !== 1) { console.error(`FAIL: 영향 행 ${upd?.length ?? 0}!=1`); process.exitCode = 2; return }
  console.log(`\nUPDATE OK: ${T.slug} area → ${upd[0].area}`)
}
main().catch((e) => { console.error('FAIL 예외', e?.message ?? String(e)); process.exitCode = 2 })
