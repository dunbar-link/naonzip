/**
 * 우슐랭(우체국 추천 맛집가이드 2026) 10차 신규 2곳 등록 — 공개 우슐랭 40 달성:
 *   바보엄마칼국수(한식) / 복오네(해산물).
 *
 * 1~9차(register-postoffice-batch1~9.mjs)와 동일 패턴. guide 출처이므로 appearances 안 만든다.
 * 출처는 restaurants.source_type=guide + restaurant_trust_sources("우체국 추천 맛집가이드 2026").
 *
 * 10차 후보 dry-run 12곳 중 clean 2곳만. 제외:
 *   - 왕짜장·봉식당·소설가: 메뉴 공란/ category 확정 불가
 *   - 쏘이472: 태국(canonical category 없음)
 *   - 국수가·숙향·다무치아·설화회초밥·황태를벗삼아·장어마을: 120m 근접 REVIEW
 *
 * 절차(안전):
 *   - dry-run : 중복 재검사 + 계획만(DB 무변경).
 *   - --apply --confirm APPLY_POSTOFFICE_BATCH10 : restaurants INSERT(비공개) + trust_sources INSERT(공개).
 *   - --publish : thumbnail 채워진 행만 is_published=true (썸네일 업서트 후).
 * 이미지: node scripts/upsert-restaurant-thumbnails.mjs --only <2 slugs> --include-private --apply (jpg/jpeg 자동).
 * 안전: 비밀키 미출력. 대상 2 slug 외 write 없음. 좌표·전화 추정 0. source_url=null. category(한식/해산물) canonical.
 * 실행:
 *   node scripts/register-postoffice-batch10.mjs
 *   node scripts/register-postoffice-batch10.mjs --apply --confirm APPLY_POSTOFFICE_BATCH10
 *   node scripts/register-postoffice-batch10.mjs --publish
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
const PUBLISH = argv.includes('--publish')
const CONFIRM = (() => { const i = argv.indexOf('--confirm'); return i !== -1 ? argv[i + 1] : null })()
const APPLY_TOKEN = 'APPLY_POSTOFFICE_BATCH10'
const MODE = PUBLISH ? 'PUBLISH' : APPLY ? 'APPLY' : 'DRY-RUN'
const norm = (v) => String(v ?? '').trim().toLowerCase().replace(/\s+/g, '')
const TODAY = new Date().toISOString().slice(0, 10)

const TRUST = { source_kind: 'guide', source_name: '우체국 추천 맛집가이드 2026', source_title: null, source_url: null, trust_label: '부산지방우정청 추천', is_public: true }

const ROWS = [
  { slug: 'postoffice-bukgu-babo-eomma-kalguksu', name: '바보엄마칼국수', area: '기타', address: '부산광역시 북구 화명대로12번길 91', lat: 35.23084434156769, lng: 129.0089766794398, category: '한식', main_menu: '사골칼국수·들깨칼국수·쭈꾸미비빔밥', price_text: '사골칼국수 ₩5,500 | 들깨칼국수 ₩6,500 | 쭈꾸미비빔밥 ₩8,500', phone: '051-362-3690', place_id: '729277084', description: '부산지방우정청 「우체국 추천 맛집가이드 2026」에 선정된 북구 화명동의 사골칼국수·들깨칼국수 전문점.' },
  { slug: 'postoffice-gangseo-bogone', name: '복오네', area: '기타', address: '부산광역시 강서구 대저중앙로 61-7', lat: 35.2181573298303, lng: 128.954131676576, category: '해산물', main_menu: '밀복·복수육·왕대구탕', price_text: '밀복 ₩13,000 | 복수육 ₩40,000~ | 왕대구탕 ₩10,000', phone: '051-972-5245', place_id: '1387540824', description: '부산지방우정청 「우체국 추천 맛집가이드 2026」에 선정된 강서 대저동의 밀복·복수육 전문점.' },
]

async function main() {
  loadEnv()
  if (APPLY && !PUBLISH && CONFIRM !== APPLY_TOKEN) {
    console.error(`FAIL: --apply 에는 --confirm ${APPLY_TOKEN} 필요. 중단(DB 무변경).`)
    process.exitCode = 2; return
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) { console.error('FAIL: Supabase env 누락'); process.exitCode = 2; return }
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

  const { data: all, error: exErr } = await sb.from('restaurants').select('id,slug,name,address,phone,kakao_map_url,lat,lng,is_published,thumbnail')
  if (exErr) { console.error('FAIL: restaurants 조회', exErr.code, exErr.message); process.exitCode = 2; return }
  const pubBefore = all.filter((r) => r.is_published).length
  console.log(`=== 우슐랭 10차 2곳 등록 (${MODE}) ===`)
  console.log(`현재 전체 ${all.length} / 공개 ${pubBefore}`)

  const dist = (la1, ln1, la2, ln2) => { const R = 6371000, t = (x) => x * Math.PI / 180; const dla = t(la2 - la1), dln = t(ln2 - ln1); const a = Math.sin(dla / 2) ** 2 + Math.cos(t(la1)) * Math.cos(t(la2)) * Math.sin(dln / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(a)) }

  if (PUBLISH) {
    let pub = 0
    for (const R of ROWS) {
      const row = all.find((r) => r.slug === R.slug)
      if (!row) { console.error(`  FAIL: ${R.slug} row 없음 → 먼저 --apply`); process.exitCode = 2; continue }
      if (!row.thumbnail || !String(row.thumbnail).trim()) { console.error(`  SKIP: ${R.slug} thumbnail 비어있음 → 공개 보류(이미지 먼저)`); continue }
      if (row.is_published) { console.log(`  이미 공개: ${R.slug}`); continue }
      const { data: upd, error: uErr } = await sb.from('restaurants').update({ is_published: true }).eq('slug', R.slug).eq('is_published', false).select('slug')
      if (uErr) { console.error(`  FAIL 공개전환 ${R.slug}: ${uErr.message}`); process.exitCode = 2; continue }
      if ((upd?.length ?? 0) === 1) { pub++; console.log(`  공개 전환: ${R.slug} (thumbnail=${row.thumbnail})`) }
    }
    console.log(`\n공개 전환 ${pub}곳 / 공개 총 ${pubBefore + pub}`)
    return
  }

  // ── 중복 재검사 ──
  let blocked = false
  for (const R of ROWS) {
    const dupSlug = all.filter((r) => r.slug === R.slug)
    const dupName = all.filter((r) => norm(r.name) === norm(R.name))
    const dupPhone = all.filter((r) => norm(r.phone) === norm(R.phone))
    const dupPlace = all.filter((r) => String(r.kakao_map_url ?? '').includes(R.place_id))
    const near = all.filter((r) => r.lat && r.lng && dist(R.lat, R.lng, r.lat, r.lng) < 120)
    const bad = dupSlug.length || dupName.length || dupPhone.length || dupPlace.length || near.length
    console.log(`  [${R.name}] slug=${dupSlug.length} name=${dupName.length} phone=${dupPhone.length} place=${dupPlace.length} near120m=${near.length} ${bad ? '→ BLOCKED' : 'OK'}`)
    if (near.length) console.log(`     near: ${near.map((r) => r.name + '(' + Math.round(dist(R.lat, R.lng, r.lat, r.lng)) + 'm)').join(', ')}`)
    if (bad) blocked = true
  }
  if (blocked) { console.error('\nFAIL: 중복 감지 → 등록 중단(REVIEW)'); process.exitCode = 2; return }

  if (!APPLY) {
    console.log('\n[DRY-RUN] 신규 restaurants 2 (is_published=false, thumbnail=null) + trust_sources 2 (is_public=true, source_url=null)')
    for (const R of ROWS) console.log(`  - ${R.slug} | ${R.area} | ${R.category} | guide | trust="우체국 추천 맛집가이드 2026"`)
    console.log('appearances 0 / 기존 수정 0 / 신규 area·category 생성 0. 다음: --apply --confirm ' + APPLY_TOKEN + ' → 썸네일 업서트 → --publish')
    return
  }

  // ── APPLY ──
  let insR = 0, insT = 0
  for (const R of ROWS) {
    if (all.find((r) => r.slug === R.slug)) { console.log(`  이미 등록됨(skip INSERT): ${R.slug}`); continue }
    const { data: ins, error: insErr } = await sb.from('restaurants').insert({
      slug: R.slug, name: R.name, area: R.area, address: R.address, lat: R.lat, lng: R.lng,
      category: R.category, main_menu: R.main_menu, price_text: R.price_text, phone: R.phone,
      thumbnail: null, creator_name: null, program_name: null, episode_title: null, broadcast_date: null,
      description: R.description, video_url: null, kakao_map_url: `https://place.map.kakao.com/${R.place_id}`,
      naver_map_url: null, tmap_url: null, source_type: 'guide', source_title: '우체국 추천 맛집가이드 2026', is_published: false,
    }, { defaultToNull: false }).select('id').single()
    if (insErr || !ins) { console.error(`  FAIL restaurants INSERT ${R.slug}: ${insErr?.code} ${insErr?.message}`); process.exitCode = 2; return }
    insR++
    console.log(`  restaurants INSERT(비공개): ${R.slug} → id=${ins.id}`)
    const { data: ex } = await sb.from('restaurant_trust_sources').select('id').eq('restaurant_id', ins.id).eq('source_name', TRUST.source_name)
    if (ex && ex.length) { console.log(`    trust 이미 존재(skip): ${R.slug}`); continue }
    const { error: tErr } = await sb.from('restaurant_trust_sources').insert({
      restaurant_id: ins.id, source_kind: TRUST.source_kind, source_name: TRUST.source_name, source_title: TRUST.source_title,
      source_url: TRUST.source_url, source_note: null, trust_label: TRUST.trust_label, verified_at: TODAY, is_public: TRUST.is_public,
    })
    if (tErr) { console.error(`  FAIL trust INSERT ${R.slug}: ${tErr.message}`); process.exitCode = 2; return }
    insT++
    console.log(`    trust_sources INSERT(공개): ${R.slug} | verified_at=${TODAY}`)
  }
  console.log(`\nINSERT 완료 — restaurants ${insR}(비공개) / trust_sources ${insT}(공개)`)
  console.log('다음: node scripts/upsert-restaurant-thumbnails.mjs --only ' + ROWS.map((r) => r.slug).join(',') + ' --include-private --apply  →  이 스크립트 --publish')
}
main().catch((e) => { console.error('FAIL 예외', e?.message ?? String(e)); process.exitCode = 2 })
