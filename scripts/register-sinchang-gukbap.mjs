/**
 * 신규 식당 1곳 등록: 신창국밥 본점 (미친맛집 시즌4 / source_type=tv).
 *
 * 절차(안전):
 *   - 기본 dry-run(중복 재검사 + 계획만, DB 무변경).
 *   - --apply : restaurants INSERT(is_published=false) + restaurant_appearances INSERT.
 *               appearance 실패 시 restaurants row 롤백(delete). 불완전 공개 row 안 남김.
 *   - --publish: thumbnail 이 채워진 것을 확인한 뒤에만 is_published=true 로 전환(영향 1행 확인).
 *
 * 안전 원칙: 비밀키 미출력. 대상 slug 외 INSERT/UPDATE/DELETE 없음. 좌표 추정 없음(Kakao 검증값).
 * 실행:
 *   node scripts/register-sinchang-gukbap.mjs            # dry-run
 *   node scripts/register-sinchang-gukbap.mjs --apply    # 비공개 등록 + appearance
 *   node scripts/register-sinchang-gukbap.mjs --publish  # thumbnail 확인 후 공개 전환
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

// ── 등록 대상 (Kakao 검증값) ──────────────────────────
const R = {
  slug: 'michinmatjip-seogu-sinchang-gukbap',
  name: '신창국밥 본점',
  area: '기타',
  address: '부산 서구 보수대로 53',
  lat: 35.1009584,
  lng: 129.0225883,
  category: '돼지국밥',
  main_menu: '돼지국밥·수육밥',
  price_text: '국밥 10,000원 / 따로밥 11,000원 / 수육밥 13,000원',
  phone: '051-244-1112',
  kakao_map_url: 'https://place.map.kakao.com/7979137',
  naver_map_url: null,
  tmap_url: null,
  source_type: 'tv',
  source_title: '미친맛집',
  program_name: '미친맛집',
  creator_name: null,
  episode_title: '부산 편',
  broadcast_date: null, // 시즌4 11화 정확 방영일 미상 → 추정 금지(null)
  video_url: null, // 넷플릭스(공개 영상 URL 없음)
  description: '넷플릭스 미친맛집 시즌4에 소개된 부산 서구 토성동의 돼지국밥 노포.',
}
const PLACE_ID = '7979137'
const norm = (v) => String(v ?? '').trim().toLowerCase().replace(/\s+/g, '')

async function main() {
  loadEnv()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) { console.error('FAIL: Supabase env 누락'); process.exitCode = 2; return }
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

  const { data: all, error: exErr } = await sb
    .from('restaurants')
    .select('id,slug,name,address,phone,kakao_map_url,is_published')
  if (exErr) { console.error('FAIL: restaurants 조회', exErr.code, exErr.message); process.exitCode = 2; return }

  const dupSlug = all.filter((r) => r.slug === R.slug)
  const dupName = all.filter((r) => norm(r.name).includes(norm('신창국밥')))
  const dupAddr = all.filter((r) => norm(r.address).includes(norm('보수대로 53')))
  const dupPhone = all.filter((r) => norm(r.phone) === norm(R.phone))
  const dupPlace = all.filter((r) => String(r.kakao_map_url ?? '').includes(PLACE_ID))
  const pubBefore = all.filter((r) => r.is_published).length

  console.log(`=== 신창국밥 본점 등록 (${PUBLISH ? 'PUBLISH' : APPLY ? 'APPLY' : 'DRY-RUN'}) ===`)
  console.log(`전체 ${all.length} / 공개 ${pubBefore}`)
  console.log(`중복: slug=${dupSlug.length} name=${dupName.length} addr=${dupAddr.length} phone=${dupPhone.length} place=${dupPlace.length}`)

  const existing = all.find((r) => r.slug === R.slug)

  // ── PUBLISH 모드 ───────────────────────────────────
  if (PUBLISH) {
    if (!existing) { console.error('FAIL: 등록된 row 없음 → 먼저 --apply'); process.exitCode = 2; return }
    const { data: row, error } = await sb.from('restaurants').select('id,thumbnail,is_published').eq('slug', R.slug).single()
    if (error || !row) { console.error('FAIL: row 조회', error?.message); process.exitCode = 2; return }
    if (!row.thumbnail || !String(row.thumbnail).trim()) { console.error('FAIL: thumbnail 비어있음 → 공개 보류(이미지 먼저)'); process.exitCode = 2; return }
    if (row.is_published) { console.log('이미 공개 상태. 변경 없음.'); return }
    const { data: upd, error: updErr } = await sb.from('restaurants').update({ is_published: true }).eq('slug', R.slug).eq('is_published', false).select('slug')
    if (updErr) { console.error('FAIL: 공개 전환', updErr.message); process.exitCode = 2; return }
    console.log(`공개 전환 영향 행: ${upd?.length ?? 0} (thumbnail=${row.thumbnail})`)
    if ((upd?.length ?? 0) !== 1) process.exitCode = 2
    return
  }

  // ── 중복이면 중단 ──────────────────────────────────
  if (dupSlug.length || dupName.length || dupPhone.length || dupPlace.length) {
    console.error('FAIL: 중복 감지 → 등록 중단'); process.exitCode = 2; return
  }

  // ── DRY-RUN ────────────────────────────────────────
  if (!APPLY) {
    console.log('\n[DRY-RUN] 등록 예정 restaurants row (is_published=false 로 INSERT, thumbnail 확정 후 공개):')
    console.log(JSON.stringify({ ...R, is_published: false }, null, 2))
    console.log('\n[DRY-RUN] appearance 예정: source_type=tv, program_name=미친맛집')
    console.log('신규 restaurants 예정: 1 / 기존 수정: 0 / 신규 area·category 생성: 0')
    return
  }

  // ── APPLY: INSERT(비공개) + appearance ─────────────
  if (existing) { console.log('이미 등록됨. INSERT 생략.'); return }
  const { data: ins, error: insErr } = await sb.from('restaurants').insert({
    slug: R.slug, name: R.name, area: R.area, address: R.address, lat: R.lat, lng: R.lng,
    category: R.category, main_menu: R.main_menu, price_text: R.price_text, phone: R.phone,
    thumbnail: null, creator_name: R.creator_name, program_name: R.program_name,
    episode_title: R.episode_title, broadcast_date: R.broadcast_date, description: R.description,
    video_url: R.video_url, kakao_map_url: R.kakao_map_url, naver_map_url: R.naver_map_url,
    tmap_url: R.tmap_url, source_type: R.source_type, source_title: R.source_title, is_published: false,
  }, { defaultToNull: false }).select('id').single()
  if (insErr || !ins) { console.error('FAIL: restaurants INSERT', insErr?.message); process.exitCode = 2; return }
  console.log(`INSERT 성공(비공개): restaurant_id=${ins.id}`)

  const { error: appErr } = await sb.from('restaurant_appearances').insert({
    restaurant_id: ins.id, source_type: R.source_type, source_title: R.source_title,
    program_name: R.program_name, creator_name: R.creator_name, episode_title: R.episode_title,
    broadcast_date: R.broadcast_date, video_url: R.video_url, candidate_id: null,
    note: '미친맛집 시즌4 신창국밥 본점 — 2026 신규 등록',
  }, { defaultToNull: false })
  if (appErr) {
    await sb.from('restaurants').delete().eq('id', ins.id)
    console.error('FAIL: appearance INSERT → restaurants 롤백(delete) 완료:', appErr.message)
    process.exitCode = 2; return
  }
  console.log('appearance INSERT 성공. (is_published=false 유지 — 다음: 썸네일 업서트 후 --publish)')
}

main().catch((e) => { console.error('FAIL: 예외 —', e?.message ?? String(e)); process.exitCode = 2 })
