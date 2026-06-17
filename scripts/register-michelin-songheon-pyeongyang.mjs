/**
 * 신규 식당 2곳 등록: 송헌집(민락본점) · 평양집(북구 덕천) — 미쉐린 가이드 부산 2026 빕 구르망.
 * source_type=guide. 미쉐린은 방송 출연이 아니므로 restaurant_appearances 미생성.
 *
 * 절차(안전):
 *   --apply  : restaurants INSERT(is_published=false). appearance 없음.
 *   --publish: thumbnail 확정 확인 후 is_published=true 전환 + trust_sources(미쉐린, is_public) 연결.
 *              trust 는 (restaurant_id, source_name) idempotent.
 * 안전: 비밀키 미출력. 대상 slug 외 무변경. 좌표 추정 없음(Kakao 검증값). 가격 추정 없음.
 * 실행:
 *   node scripts/register-michelin-songheon-pyeongyang.mjs            # dry-run
 *   node scripts/register-michelin-songheon-pyeongyang.mjs --apply    # 비공개 INSERT
 *   node scripts/register-michelin-songheon-pyeongyang.mjs --publish  # 공개 전환 + trust 연결
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
const VERIFIED_AT = '2026-06-17'
const MICHELIN_URL = 'https://guide.michelin.com/kr/ko/article/michelin-guide-ceremony/korea-bib-gourmand-2026'

const TARGETS = [
  {
    slug: 'michelin-gwangalli-songheonjip', name: '송헌집', area: '광안리',
    address: '부산 수영구 민락로19번길 18', lat: 35.156552, lng: 129.121438,
    category: '고기', main_menu: '숯불 떡갈비정식', price_text: '가격 매장 확인',
    phone: null, kakao_map_url: 'https://place.map.kakao.com/1559134124',
    source_type: 'guide', source_title: '미쉐린 가이드',
    description: '미쉐린 가이드 부산 2026 빕 구르망에 선정된 수영구 민락동의 숯불 떡갈비 전문점.',
    place_id: '1559134124',
  },
  {
    slug: 'michelin-bukgu-pyeongyangjip', name: '평양집', area: '기타',
    address: '부산 북구 금곡대로20번길 21', lat: 35.212098, lng: 129.005911,
    category: '한식', main_menu: '이북식 만둣국·녹두전', price_text: '가격 매장 확인',
    phone: '051-331-5455', kakao_map_url: 'https://place.map.kakao.com/12293207',
    source_type: 'guide', source_title: '미쉐린 가이드',
    description: '미쉐린 가이드 부산 2026 빕 구르망에 선정된 북구 덕천의 이북식 만둣국 전문점.',
    place_id: '12293207',
  },
]
const TRUST = { source_name: '미쉐린 가이드 부산 2026', source_kind: 'guide', trust_label: '빕 구르망', source_url: MICHELIN_URL }
const norm = (v) => String(v ?? '').trim().toLowerCase().replace(/\s+/g, '')

async function main() {
  loadEnv()
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data: all, error } = await sb.from('restaurants').select('id,slug,name,address,phone,kakao_map_url,thumbnail,is_published')
  if (error) { console.error('FAIL 조회', error.code, error.message); process.exitCode = 2; return }
  const bySlug = new Map(all.map((r) => [r.slug, r]))

  console.log(`=== 송헌집·평양집 등록 (${PUBLISH ? 'PUBLISH' : APPLY ? 'APPLY' : 'DRY-RUN'}) ===`)
  console.log(`전체 ${all.length} / 공개 ${all.filter((r) => r.is_published).length}`)

  for (const t of TARGETS) {
    const existing = bySlug.get(t.slug)
    const dupName = all.filter((r) => norm(r.name) === norm(t.name))
    const dupPlace = all.filter((r) => String(r.kakao_map_url ?? '').includes(t.place_id))

    if (PUBLISH) {
      if (!existing) { console.error(`  FAIL ${t.name}: row 없음 → 먼저 --apply`); process.exitCode = 2; continue }
      const { data: row } = await sb.from('restaurants').select('id,thumbnail,is_published').eq('slug', t.slug).single()
      if (!row?.thumbnail) { console.error(`  FAIL ${t.name}: thumbnail 없음 → 공개 보류`); process.exitCode = 2; continue }
      if (!row.is_published) {
        const { data: upd, error: uErr } = await sb.from('restaurants').update({ is_published: true }).eq('slug', t.slug).eq('is_published', false).select('slug')
        if (uErr) { console.error(`  FAIL ${t.name} 공개:`, uErr.message); process.exitCode = 2; continue }
        console.log(`  ${t.name} 공개 전환: ${upd?.length ?? 0}행`)
      } else console.log(`  ${t.name} 이미 공개`)
      // trust 연결 (idempotent: restaurant_id + source_name)
      const { data: exTs } = await sb.from('restaurant_trust_sources').select('id').eq('restaurant_id', row.id).eq('source_name', TRUST.source_name)
      if (exTs?.length) { console.log(`  ${t.name} trust 이미 존재(skip)`); continue }
      const { error: tErr } = await sb.from('restaurant_trust_sources').insert({
        restaurant_id: row.id, source_kind: TRUST.source_kind, source_name: TRUST.source_name,
        source_url: TRUST.source_url, trust_label: TRUST.trust_label, verified_at: VERIFIED_AT, is_public: true,
      }, { defaultToNull: false })
      if (tErr) { console.error(`  FAIL ${t.name} trust:`, tErr.message); process.exitCode = 2; continue }
      console.log(`  ${t.name} trust 연결(미쉐린 빕구르망)`)
      continue
    }

    if (existing) { console.log(`  [skip_exists] ${t.name} 이미 등록`); continue }
    if (dupName.length || dupPlace.length) { console.error(`  [중복중단] ${t.name}: name/place 중복`); process.exitCode = 2; continue }

    if (!APPLY) {
      console.log(`  [to_insert] ${t.name} | ${t.area} | ${t.category} | ${t.main_menu} | ${t.address} | guide`)
      continue
    }
    const { data: ins, error: iErr } = await sb.from('restaurants').insert({
      slug: t.slug, name: t.name, area: t.area, address: t.address, lat: t.lat, lng: t.lng,
      category: t.category, main_menu: t.main_menu, price_text: t.price_text, phone: t.phone,
      thumbnail: null, creator_name: null, program_name: null, episode_title: null, broadcast_date: null,
      description: t.description, video_url: null, kakao_map_url: t.kakao_map_url, naver_map_url: null, tmap_url: null,
      source_type: t.source_type, source_title: t.source_title, is_published: false,
    }, { defaultToNull: false }).select('id').single()
    if (iErr || !ins) { console.error(`  FAIL INSERT ${t.name}:`, iErr?.code, iErr?.message); process.exitCode = 2; continue }
    console.log(`  [inserted_private] ${t.name} id=${ins.id}`)
  }
}
main().catch((e) => { console.error('FAIL 예외', e?.message ?? String(e)); process.exitCode = 2 })
