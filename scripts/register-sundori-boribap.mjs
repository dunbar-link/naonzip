/**
 * 순돌이 보리밥 등록 — KBS 2TV 생생정보 '할매 밥 됩니까' 2551회 (해운대 중동 보리밥).
 *
 * 절차:
 *   (dry-run/preflight) Kakao keyword 로 place_id·좌표·주소·전화 확보 + DB 중복(slug/name/place) +
 *     사진(thumbnail-input/{slug}.jpg) 게이트 확인. 사진 없으면 BLOCKED_THUMBNAIL_MISSING(공개 publish 불가).
 *   --apply  : restaurants INSERT(is_published=false) + restaurant_appearances INSERT (롤백 처리). 사진 무관.
 *   --publish: thumbnail 확정(upsert-restaurant-thumbnails 로 별도 업로드) 확인 후에만 is_published=true + trust 연결.
 * 안전: 비밀키 미출력. 순돌이 보리밥 1건 외 INSERT/UPDATE/DELETE 없음. 좌표/주소/전화 Kakao 검증값(추정 금지).
 * 실행:
 *   node scripts/register-sundori-boribap.mjs            # dry-run(preflight)
 *   node scripts/register-sundori-boribap.mjs --apply    # 비공개 INSERT + appearance
 *   node scripts/register-sundori-boribap.mjs --publish  # 썸네일 확인 후 공개 + trust
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const THUMB_DIR = 'C:\\work\\naonzip-thumbnail-input'
function loadEnv() {
  const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/); if (!m) continue
    let v = m[2]; if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
    if (!process.env[m[1]]) process.env[m[1]] = v
  }
}
const argv = process.argv.slice(2)
const APPLY = argv.includes('--apply')
const PUBLISH = argv.includes('--publish')

const R = {
  slug: '2tv-haeundae-sundori-boribap', name: '순돌이 보리밥', area: '해운대',
  address: '부산 해운대구 해운대해변로 334', category: '한식',
  main_menu: '보리밥정식',
  price_text: '가격 매장 확인',
  phone: '051-746-2579', source_type: 'tv', source_title: '2TV 생생정보',
  program_name: '2TV 생생정보', episode_title: '할매 밥 됩니까 2551회', broadcast_date: '2026-06-15',
  description: "KBS 2TV 생생정보 '할매 밥 됩니까'에 소개된 부산 해운대 중동의 보리밥 전문점. 자운 할매가 국내산 재료·무조미료로 차려내는 보리밥정식이 대표.",
}
const PLACE_QUERY = '순돌이 보리밥 해운대 중동'
const ADDR_CORE = '해운대해변로'
// 2TV 생생정보 출처 trust (방송 식당 trust 칩)
const TRUST = { source_kind: 'tv', source_name: '2TV 생생정보', source_title: '할매 밥 됩니까 2551회', source_url: 'https://www.mhns.co.kr/news/articleView.html?idxno=750338', trust_label: '2TV 생생정보 방영', verified_at: '2026-06-25' }

const norm = (v) => String(v ?? '').trim().toLowerCase().replace(/\s+/g, '')
const inBusan = (la, ln) => la >= 34.8 && la <= 35.5 && ln >= 128.7 && ln <= 129.5
const extractPlaceId = (u) => { const m = String(u ?? '').match(/place\.map\.kakao\.com\/(\d+)/); return m ? m[1] : null }
async function kakaoKeyword(key, q) {
  const r = await fetch('https://dapi.kakao.com/v2/local/search/keyword.json?size=15&query=' + encodeURIComponent(q), { headers: { Authorization: 'KakaoAK ' + key } })
  if (!r.ok) return { docs: [] }
  const j = await r.json(); return { docs: j.documents || [] }
}

async function main() {
  loadEnv()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY, kakaoKey = process.env.KAKAO_REST_API_KEY
  if (!url || !key) { console.error('FAIL: Supabase env 누락'); process.exitCode = 2; return }
  if (!kakaoKey) { console.error('FAIL: KAKAO_REST_API_KEY 없음'); process.exitCode = 2; return }
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

  const { data: all, error } = await sb.from('restaurants').select('id,slug,name,address,phone,kakao_map_url,thumbnail,is_published')
  if (error) { console.error('FAIL 조회', error.code, error.message); process.exitCode = 2; return }
  const bySlug = new Map(all.map((r) => [r.slug, r]))
  const existing = bySlug.get(R.slug)

  console.log(`=== 순돌이 보리밥 등록 (${PUBLISH ? 'PUBLISH' : APPLY ? 'APPLY' : 'DRY-RUN/PREFLIGHT'}) ===`)
  console.log(`전체 ${all.length} / 공개 ${all.filter((r) => r.is_published).length}`)

  // ── PUBLISH ──
  if (PUBLISH) {
    if (!existing) { console.error('FAIL: row 없음 → 먼저 --apply'); process.exitCode = 2; return }
    const { data: row } = await sb.from('restaurants').select('id,thumbnail,is_published').eq('slug', R.slug).single()
    if (!row?.thumbnail) { console.error('FAIL: thumbnail 없음 → 공개 보류(썸네일 먼저)'); process.exitCode = 2; return }
    if (!row.is_published) {
      const { data: upd, error: uErr } = await sb.from('restaurants').update({ is_published: true }).eq('slug', R.slug).eq('is_published', false).select('slug')
      if (uErr) { console.error('FAIL 공개', uErr.message); process.exitCode = 2; return }
      console.log(`공개 전환: ${upd?.length ?? 0}행`)
    } else console.log('이미 공개')
    // trust 연결 (2TV 생생정보, idempotent: restaurant_id + source_name)
    const { data: exTs } = await sb.from('restaurant_trust_sources').select('id').eq('restaurant_id', row.id).eq('source_name', TRUST.source_name)
    if (exTs?.length) { console.log('trust 이미 존재(skip)'); return }
    const { error: tErr } = await sb.from('restaurant_trust_sources').insert({
      restaurant_id: row.id, source_kind: TRUST.source_kind, source_name: TRUST.source_name,
      source_url: TRUST.source_url, source_title: TRUST.source_title, trust_label: TRUST.trust_label, verified_at: TRUST.verified_at, is_public: true,
    }, { defaultToNull: false })
    if (tErr) { console.error('FAIL trust', tErr.message); process.exitCode = 2; return }
    console.log('trust 연결(2TV 생생정보)')
    return
  }

  // ── Kakao 조회(preflight) ──
  let lk = null, kakaoErr = null
  try {
    const { docs } = await kakaoKeyword(kakaoKey, PLACE_QUERY)
    lk = docs.find((x) => { const la = +x.y, ln = +x.x; const a = `${x.road_address_name || ''} ${x.address_name || ''}`; return inBusan(la, ln) && norm(x.place_name).includes(norm(R.name)) && a.includes(ADDR_CORE) })
      || docs.find((x) => inBusan(+x.y, +x.x) && norm(x.place_name).includes(norm(R.name)))
  } catch (e) { kakaoErr = e?.message }

  const placeId = lk ? String(lk.id) : null
  const kakaoAddr = lk ? (lk.road_address_name || lk.address_name || '') : ''
  const kakaoPhone = lk ? (lk.phone || '') : ''
  const lat = lk ? +lk.y : null, lng = lk ? +lk.x : null

  // 중복
  const dupName = all.filter((r) => norm(r.name) === norm(R.name))
  const dupPlace = placeId ? all.filter((r) => String(r.kakao_map_url ?? '').includes(placeId)) : []
  const dupAddr = all.filter((r) => norm(r.address).includes(norm(ADDR_CORE)))

  // 사진
  const thumbPath = join(THUMB_DIR, `${R.slug}.jpg`)
  const thumbExists = existsSync(thumbPath) || existsSync(join(THUMB_DIR, `${R.slug}.png`)) || existsSync(join(THUMB_DIR, `${R.slug}.webp`)) || existsSync(join(THUMB_DIR, `${R.slug}.jpeg`))

  console.log('\n── Kakao preflight ──')
  console.log(`  place_id   : ${placeId ?? '(미확인)'}`)
  console.log(`  kakao_name : ${lk ? lk.place_name : '-'}`)
  console.log(`  kakao_addr : ${kakaoAddr || '-'}  (기대 코어: ${ADDR_CORE})`)
  console.log(`  kakao_phone: ${kakaoPhone || '-'}  (후보: ${R.phone})`)
  console.log(`  좌표       : ${lat ?? '-'}, ${lng ?? '-'}  (부산범위 ${lat && lng ? inBusan(lat, lng) : '-'})`)
  if (kakaoErr) console.log(`  Kakao 오류 : ${kakaoErr}`)
  console.log('\n── 중복 ──')
  console.log(`  slug 존재  : ${existing ? 'YES' : 'no'} / name 중복 ${dupName.length} / place 중복 ${dupPlace.length} / 주소코어 중복 ${dupAddr.length}`)
  console.log('\n── 사진(공개 게이트) ──')
  console.log(`  ${R.slug}.(jpg|png|webp) in thumbnail-input : ${thumbExists ? '있음' : '없음 → 공개 publish 불가(thumbMiss)'}`)

  // 판정
  let verdict = 'REGISTER_READY'
  const reasons = []
  if (existing || dupPlace.length || dupName.length) { verdict = 'BLOCKED_DUPLICATE'; reasons.push('DB 중복') }
  else if (!placeId || !lat || !lng) { verdict = 'BLOCKED_KAKAO_PLACE_UNCONFIRMED'; reasons.push('Kakao place 미확정') }
  else if (!thumbExists) { verdict = 'BLOCKED_THUMBNAIL_MISSING'; reasons.push('사진 없음(공개 시 thumbMiss)') }
  console.log(`\n판정: ${verdict}${reasons.length ? ' — ' + reasons.join(', ') : ''}`)

  if (!APPLY) {
    console.log('\n[등록 예정 row(참고)]')
    console.log(JSON.stringify({ ...R, kakao_map_url: placeId ? `https://place.map.kakao.com/${placeId}` : null, lat, lng, is_published: false }, null, 2))
    return
  }

  // ── APPLY (insert 비공개 + appearance) ── REGISTER_READY/사진무관(비공개)만 진행
  if (verdict === 'BLOCKED_DUPLICATE' || verdict === 'BLOCKED_KAKAO_PLACE_UNCONFIRMED') { console.error('APPLY 중단: ' + verdict); process.exitCode = 2; return }
  if (existing) { console.log('이미 등록됨. INSERT 생략.'); return }
  const { data: ins, error: iErr } = await sb.from('restaurants').insert({
    slug: R.slug, name: R.name, area: R.area, address: R.address, lat, lng,
    category: R.category, main_menu: R.main_menu, price_text: R.price_text, phone: R.phone,
    thumbnail: null, creator_name: null, program_name: R.program_name, episode_title: R.episode_title,
    broadcast_date: R.broadcast_date, description: R.description, video_url: null,
    kakao_map_url: `https://place.map.kakao.com/${placeId}`, naver_map_url: null, tmap_url: null,
    source_type: R.source_type, source_title: R.source_title, is_published: false,
  }, { defaultToNull: false }).select('id').single()
  if (iErr || !ins) { console.error('FAIL INSERT', iErr?.message); process.exitCode = 2; return }
  const { error: appErr } = await sb.from('restaurant_appearances').insert({
    restaurant_id: ins.id, source_type: R.source_type, source_title: R.source_title,
    program_name: R.program_name, creator_name: null, episode_title: R.episode_title,
    broadcast_date: R.broadcast_date, video_url: null, candidate_id: null, note: '2TV 생생정보 할매 밥 됩니까 2551회 순돌이 보리밥 — 2026 신규 등록',
  }, { defaultToNull: false })
  if (appErr) { await sb.from('restaurants').delete().eq('id', ins.id); console.error('FAIL appearance → 롤백:', appErr.message); process.exitCode = 2; return }
  console.log(`INSERT 성공(비공개): id=${ins.id} (+appearance). 다음: 썸네일 업서트 후 --publish`)
}
main().catch((e) => { console.error('FAIL 예외', e?.message ?? String(e)); process.exitCode = 2 })
