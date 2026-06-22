/**
 * 우슐랭(우체국 추천 맛집가이드 2026) 6차 신규 5곳 등록:
 *   첸차이나(중식) / 소바재우재(일식) / 심청이왕족발(고기) / 금용만두(분식) / 대박손칼국수(한식).
 *
 * 1~5차(register-postoffice-batch1~5.mjs)와 동일 패턴. guide 출처이므로 appearances 안 만든다.
 * 출처는 restaurants.source_type=guide + restaurant_trust_sources("우체국 추천 맛집가이드 2026").
 *
 * 절차(안전):
 *   - dry-run : 중복 재검사 + 계획만(DB 무변경).
 *   - --apply --confirm APPLY_POSTOFFICE_BATCH6 :
 *               restaurants INSERT(is_published=false, thumbnail=null) + trust_sources INSERT(is_public=true).
 *   - --publish : thumbnail 채워진 행만 is_published=true (썸네일 업서트 후).
 *
 * 이미지(webp 변환·Storage 업로드·thumbnail URL)는 기존 검증 스크립트가 담당한다:
 *   node scripts/upsert-restaurant-thumbnails.mjs --only <5 slugs> --include-private --apply
 *
 * 안전: 비밀키 미출력. 대상 5 slug 외 write 없음. 좌표·전화 추정 0(Kakao/CSV 검증값). source_url=null.
 *       source_type 에 우슐랭/postoffice 신규 enum 안 씀. --apply 는 --confirm 토큰 필수(이중 안전장치).
 *       category(중식/일식/고기/분식/한식) 는 기존 canonical — 신규 area/category 생성 0.
 *       등대횟집(사또분식 81m 근접)은 REVIEW 로 이번 배치에서 제외.
 * 실행:
 *   node scripts/register-postoffice-batch6.mjs                                   # dry-run
 *   node scripts/register-postoffice-batch6.mjs --apply --confirm APPLY_POSTOFFICE_BATCH6
 *   node scripts/register-postoffice-batch6.mjs --publish
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
const APPLY_TOKEN = 'APPLY_POSTOFFICE_BATCH6'
const MODE = PUBLISH ? 'PUBLISH' : APPLY ? 'APPLY' : 'DRY-RUN'
const norm = (v) => String(v ?? '').trim().toLowerCase().replace(/\s+/g, '')
const TODAY = new Date().toISOString().slice(0, 10)

const TRUST = { source_kind: 'guide', source_name: '우체국 추천 맛집가이드 2026', source_title: null, source_url: null, trust_label: '부산지방우정청 추천', is_public: true }

const ROWS = [
  { slug: 'postoffice-bukgu-chen-china', name: '첸차이나', area: '기타', address: '부산광역시 북구 효열로219번가길 42', lat: 35.26352631754734, lng: 129.01701413689906, category: '중식', main_menu: '짜장면·짬뽕·간짜장·탕수육', price_text: '짜장면 ₩7,000 | 짬뽕 ₩9,500 | 간짜장 ₩9,000 | 탕수육 ₩19,000', phone: '051-343-7778', place_id: '491752023', description: '부산지방우정청 「우체국 추천 맛집가이드 2026」에 선정된 북구의 짜장면·짬뽕 중식당.' },
  { slug: 'postoffice-suyeong-soba-jaewuujae', name: '소바재우재', area: '광안리', address: '부산광역시 수영구 광남로 4-1, 1층', lat: 35.1434784200677, lng: 129.109553529647, category: '일식', main_menu: '유자온소바·유자소바·수제만두', price_text: '유자온소바 ₩9,500 | 유자소바 ₩10,500 | 수제만두 ₩7,000', phone: '0507-1312-8952', place_id: '1280383204', description: '부산지방우정청 「우체국 추천 맛집가이드 2026」에 선정된 수영구 광안동의 유자소바 일식당.' },
  { slug: 'postoffice-busanjin-simcheongi-wang-jokbal', name: '심청이왕족발', area: '서면', address: '부산광역시 부산진구 가야대로588번길 14', lat: 35.1540369613871, lng: 129.035798068665, category: '고기', main_menu: '차가운 옛날족발·심청이 족발', price_text: '차가운 옛날족발 ₩27,000~ | 심청이 족발 ₩27,000~', phone: '051-896-5357', place_id: '1953683526', description: '부산지방우정청 「우체국 추천 맛집가이드 2026」에 선정된 부산진구 가야동의 옛날족발 전문점.' },
  { slug: 'postoffice-bukgu-geumyong-mandu', name: '금용만두', area: '기타', address: '부산광역시 북구 구포만세길 75', lat: 35.205463165525906, lng: 128.9966622638993, category: '분식', main_menu: '군만두·찐만두·만두국밥', price_text: '군만두 ₩8,000 | 찐만두 ₩8,000 | 만두국밥 ₩8,000', phone: '051-337-8868', place_id: '8792300', description: '부산지방우정청 「우체국 추천 맛집가이드 2026」에 선정된 북구 구포동의 만두 전문점.' },
  { slug: 'postoffice-geumjeong-daebak-son-kalguksu', name: '대박손칼국수', area: '기타', address: '부산광역시 금정구 수림로20번길 21, 천호빌딩 1층', lat: 35.2406506717372, lng: 129.090208503656, category: '한식', main_menu: '칼국수·얼큰칼국수·들깨칼국수', price_text: '칼국수 ₩7,000 | 얼큰칼국수 ₩7,000 | 들깨칼국수 ₩7,500', phone: '051-515-5295', place_id: '24574146', description: '부산지방우정청 「우체국 추천 맛집가이드 2026」에 선정된 금정구의 칼국수 전문점.' },
]

async function main() {
  loadEnv()
  // 이중 안전장치: --apply(비공개 INSERT) 는 --confirm 토큰이 있어야만 수행. --publish 는 thumbnail 있는 행만 바꾸므로 제외.
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
  console.log(`=== 우슐랭 6차 5곳 등록 (${MODE}) ===`)
  console.log(`현재 전체 ${all.length} / 공개 ${pubBefore}`)

  const dist = (la1, ln1, la2, ln2) => { const R = 6371000, t = (x) => x * Math.PI / 180; const dla = t(la2 - la1), dln = t(ln2 - ln1); const a = Math.sin(dla / 2) ** 2 + Math.cos(t(la1)) * Math.cos(t(la2)) * Math.sin(dln / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(a)) }

  // ── PUBLISH ──
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
    console.log('\n[DRY-RUN] 신규 restaurants 5 (is_published=false, thumbnail=null) + trust_sources 5 (is_public=true, source_url=null)')
    for (const R of ROWS) console.log(`  - ${R.slug} | ${R.area} | ${R.category} | guide | trust="우체국 추천 맛집가이드 2026"`)
    console.log('appearances 0 / 기존 수정 0 / 신규 area·category 생성 0. 다음: --apply --confirm ' + APPLY_TOKEN + ' → 썸네일 업서트 → --publish')
    return
  }

  // ── APPLY: restaurants INSERT(비공개) + trust INSERT(공개) ──
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
    // trust 중복 체크(idempotent)
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
