/**
 * 신규 식당 3곳 등록: 넷플릭스 미친맛집 부산 시즌3·4 — 갈치회관·승하집·섬진강재첩전문점.
 * source_type=tv. 방송 출연이므로 restaurant_appearances 도 생성한다(신창국밥 선례).
 *
 * 절차(안전):
 *   (dry-run) 중복(slug/name/place)·120m 근접 재대조 + 계획만. DB 무변경.
 *   --apply   : restaurants INSERT(is_published=false) + restaurant_appearances INSERT.
 *               appearance 실패 시 restaurants row 롤백(delete) → 불완전 row 안 남김.
 *   --publish : thumbnail 확정 확인 후 is_published=true 전환 + trust_sources(미친맛집, is_public) 연결.
 *               trust 는 (restaurant_id, source_name) idempotent.
 * 안전 원칙: 비밀키 미출력. 대상 3 slug 외 INSERT/UPDATE/DELETE 없음. 좌표/가격 추정 없음(preflight 확정값).
 * 실행:
 *   node scripts/register-michinmatjip-busan.mjs            # dry-run
 *   node scripts/register-michinmatjip-busan.mjs --apply    # 비공개 INSERT + appearance
 *   node scripts/register-michinmatjip-busan.mjs --publish  # 썸네일 확인 후 공개 + trust
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
const VERIFIED_AT = '2026-06-23'

const TARGETS = [
  {
    slug: 'michinmatjip-sasang-galchi-hoegwan', name: '갈치회관', area: '사상',
    address: '부산 사상구 낙동대로 1402', lat: 35.18523, lng: 128.97738,
    category: '해산물', main_menu: '갈치조림·갈치정식·갈치회무침',
    price_text: '갈치조림 1인 18,000원 / 갈치정식 25,000원 / 갈치회무침(세꼬시) 50,000원',
    phone: '051-301-8292', kakao_map_url: 'https://place.map.kakao.com/593120865', place_id: '593120865',
    episode_title: '시즌4 6화', broadcast_date: null,
    description: '넷플릭스 미친맛집 시즌4에 소개된 부산 사상구 삼락동의 갈치요리 전문점.',
    trust_url: 'https://histale.com/i/넷플릭스-미친맛집-식당-리스트/A',
  },
  {
    slug: 'michinmatjip-dongnae-seungha-jip', name: '승하집', area: '동래',
    address: '부산 동래구 사직북로5번길 31', lat: 35.19607, lng: 129.05914,
    category: '한식', main_menu: '수육·석쇠불고기·오징어순대·통문어',
    price_text: '수육 39,000~55,000원 / 석쇠불고기 20,000원 / 오징어순대 15,000원',
    phone: '010-9102-5535', kakao_map_url: 'https://place.map.kakao.com/2020452181', place_id: '2020452181',
    episode_title: '시즌3 8화 홈런 치는 부산의 맛', broadcast_date: '2025-10-02',
    description: '넷플릭스 미친맛집 시즌3 홈런 치는 부산의 맛에 소개된 부산 동래구 사직동의 수육·안주 전문점.',
    trust_url: 'https://www.topstarnews.net/news/articleView.html?idxno=15827872',
  },
  {
    slug: 'michinmatjip-jung-seomjingang-jaecheop', name: '섬진강재첩전문점', area: '남포동',
    address: '부산 중구 광복로85번길 15-1', lat: 35.09977, lng: 129.03475,
    category: '해산물', main_menu: '재첩국정식·재첩국비빔밥·고등어조림',
    price_text: '재첩국정식 14,000원 / 재첩국비빔밥 17,000원',
    phone: '051-246-6471', kakao_map_url: 'https://place.map.kakao.com/10488926', place_id: '10488926',
    episode_title: '시즌3 6화', broadcast_date: null,
    description: '넷플릭스 미친맛집 시즌3에 소개된 부산 중구 동광동의 재첩국 전문점.',
    trust_url: 'https://www.busan.com/view/busan/view.php?code=2026020410372017215',
  },
]
const SOURCE_TYPE = 'tv'
const SOURCE_TITLE = '미친맛집'
const PROGRAM_NAME = '미친맛집'
const TRUST_NAME = '미친맛집: 미식가 친구의 맛집'
const TRUST_KIND = 'tv'
const TRUST_LABEL = '넷플릭스 출연'

const norm = (v) => String(v ?? '').trim().toLowerCase().replace(/\s+/g, '')
// 간이 거리(m): 부산 위도 35° 기준 위도 1°≈111000m, 경도 1°≈88800m
function distM(aLat, aLng, bLat, bLng) {
  const dLat = (aLat - bLat) * 111000
  const dLng = (aLng - bLng) * 88800
  return Math.sqrt(dLat * dLat + dLng * dLng)
}

async function main() {
  loadEnv()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) { console.error('FAIL: Supabase env 누락'); process.exitCode = 2; return }
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

  const { data: all, error } = await sb.from('restaurants').select('id,slug,name,address,phone,kakao_map_url,lat,lng,thumbnail,is_published')
  if (error) { console.error('FAIL 조회', error.code, error.message); process.exitCode = 2; return }
  const bySlug = new Map(all.map((r) => [r.slug, r]))
  const pubBefore = all.filter((r) => r.is_published).length

  console.log(`=== 미친맛집 3곳 등록 (${PUBLISH ? 'PUBLISH' : APPLY ? 'APPLY' : 'DRY-RUN'}) ===`)
  console.log(`전체 ${all.length} / 공개 ${pubBefore}`)

  for (const t of TARGETS) {
    const existing = bySlug.get(t.slug)

    // ── PUBLISH 모드 ──
    if (PUBLISH) {
      if (!existing) { console.error(`  FAIL ${t.name}: row 없음 → 먼저 --apply`); process.exitCode = 2; continue }
      const { data: row } = await sb.from('restaurants').select('id,thumbnail,is_published').eq('slug', t.slug).single()
      if (!row?.thumbnail) { console.error(`  FAIL ${t.name}: thumbnail 없음 → 공개 보류(이미지 먼저)`); process.exitCode = 2; continue }
      if (!row.is_published) {
        const { data: upd, error: uErr } = await sb.from('restaurants').update({ is_published: true }).eq('slug', t.slug).eq('is_published', false).select('slug')
        if (uErr) { console.error(`  FAIL ${t.name} 공개:`, uErr.message); process.exitCode = 2; continue }
        console.log(`  ${t.name} 공개 전환: ${upd?.length ?? 0}행`)
      } else console.log(`  ${t.name} 이미 공개`)
      const { data: exTs } = await sb.from('restaurant_trust_sources').select('id').eq('restaurant_id', row.id).eq('source_name', TRUST_NAME)
      if (exTs?.length) { console.log(`  ${t.name} trust 이미 존재(skip)`); continue }
      const { error: tErr } = await sb.from('restaurant_trust_sources').insert({
        restaurant_id: row.id, source_kind: TRUST_KIND, source_name: TRUST_NAME,
        source_url: t.trust_url, source_title: t.episode_title, trust_label: TRUST_LABEL, verified_at: VERIFIED_AT, is_public: true,
      }, { defaultToNull: false })
      if (tErr) { console.error(`  FAIL ${t.name} trust:`, tErr.message); process.exitCode = 2; continue }
      console.log(`  ${t.name} trust 연결(미친맛집)`)
      continue
    }

    // ── 중복 + 120m 근접 재대조 (dry-run/apply 공통) ──
    const dupName = all.filter((r) => norm(r.name) === norm(t.name))
    const dupPlace = all.filter((r) => String(r.kakao_map_url ?? '').includes(t.place_id))
    const near = all
      .filter((r) => typeof r.lat === 'number' && typeof r.lng === 'number' && r.slug !== t.slug && distM(t.lat, t.lng, r.lat, r.lng) < 120)
      .map((r) => `${r.slug}(${Math.round(distM(t.lat, t.lng, r.lat, r.lng))}m)`)

    if (existing) { console.log(`  [skip_exists] ${t.name} 이미 등록`); continue }
    if (dupName.length || dupPlace.length) { console.error(`  [중복중단] ${t.name}: name=${dupName.length} place=${dupPlace.length}`); process.exitCode = 2; continue }
    if (near.length) { console.error(`  [120m중단] ${t.name}: 근접 ${near.join(', ')}`); process.exitCode = 2; continue }

    // ── DRY-RUN ──
    if (!APPLY) {
      console.log(`  [to_insert] ${t.name} | ${t.area}/${t.category} | ${t.main_menu} | ${t.address} | bdate=${t.broadcast_date ?? '-'} | 근접0 dupName${dupName.length} dupPlace${dupPlace.length}`)
      continue
    }

    // ── APPLY: INSERT(비공개) + appearance ──
    const { data: ins, error: iErr } = await sb.from('restaurants').insert({
      slug: t.slug, name: t.name, area: t.area, address: t.address, lat: t.lat, lng: t.lng,
      category: t.category, main_menu: t.main_menu, price_text: t.price_text, phone: t.phone,
      thumbnail: null, creator_name: null, program_name: PROGRAM_NAME, episode_title: t.episode_title,
      broadcast_date: t.broadcast_date, description: t.description, video_url: null,
      kakao_map_url: t.kakao_map_url, naver_map_url: null, tmap_url: null,
      source_type: SOURCE_TYPE, source_title: SOURCE_TITLE, is_published: false,
    }, { defaultToNull: false }).select('id').single()
    if (iErr || !ins) { console.error(`  FAIL INSERT ${t.name}:`, iErr?.code, iErr?.message); process.exitCode = 2; continue }

    const { error: appErr } = await sb.from('restaurant_appearances').insert({
      restaurant_id: ins.id, source_type: SOURCE_TYPE, source_title: SOURCE_TITLE,
      program_name: PROGRAM_NAME, creator_name: null, episode_title: t.episode_title,
      broadcast_date: t.broadcast_date, video_url: null, candidate_id: null,
      note: `미친맛집 ${t.episode_title} — 2026 신규 등록`,
    }, { defaultToNull: false })
    if (appErr) {
      await sb.from('restaurants').delete().eq('id', ins.id)
      console.error(`  FAIL appearance ${t.name} → restaurants 롤백(delete):`, appErr.message); process.exitCode = 2; continue
    }
    console.log(`  [inserted_private] ${t.name} id=${ins.id} (+appearance)`)
  }

  if (!PUBLISH) console.log('신규 area·category 생성: 0 (사상/동래/남포동 · 해산물/한식 = canonical)')
}
main().catch((e) => { console.error('FAIL 예외', e?.message ?? String(e)); process.exitCode = 2 })
