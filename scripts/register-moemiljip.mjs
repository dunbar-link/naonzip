/**
 * 신규 식당 1곳 등록: 뫼밀집 (미쉐린 가이드 부산 2026 빕 구르망 / source_type=guide).
 *
 * 미쉐린은 방송 출연이 아니므로 restaurant_appearances 를 만들지 않는다.
 * (appearance 0건이면 read 어댑터가 restaurants 방송컬럼으로 단일 가이드 출처를 fallback 표시)
 *
 * 절차(안전):
 *   - 기본 dry-run(중복 재검사 + 계획만, DB 무변경).
 *   - --apply : restaurants INSERT(is_published=false). appearance 없음.
 *   - --publish: thumbnail 이 채워진 것을 확인한 뒤에만 is_published=true 로 전환(영향 1행).
 *
 * 안전 원칙: 비밀키 미출력. 대상 slug 외 INSERT/UPDATE/DELETE 없음. 좌표 추정 없음(Kakao 검증값).
 *   동일 건물(초필살돼지구이)이라는 이유로 좌표를 조정하지 않는다.
 * 실행:
 *   node scripts/register-moemiljip.mjs            # dry-run
 *   node scripts/register-moemiljip.mjs --apply    # 비공개 등록(appearance 없음)
 *   node scripts/register-moemiljip.mjs --publish  # thumbnail 확인 후 공개 전환
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
  slug: 'michelin-haeundae-moemiljip',
  name: '뫼밀집',
  area: '해운대',
  address: '부산 해운대구 마린시티3로 23',
  lat: 35.156647,
  lng: 129.146931,
  category: '한식',
  main_menu: '들기름 메밀국수·편육',
  price_text: '들기름메밀국수 17,000원 / 물메밀국수 16,000원 / 비빔메밀국수 16,000원 / 편육 17,000원 / 맛보기 편육 9,000원',
  phone: '051-744-9944',
  kakao_map_url: 'https://place.map.kakao.com/973360722',
  naver_map_url: null,
  tmap_url: null,
  source_type: 'guide',
  source_title: '미쉐린 가이드',
  program_name: null,
  creator_name: null,
  episode_title: null,
  broadcast_date: null,
  video_url: null,
  description: '미쉐린 가이드 부산 2026 빕 구르망에 선정된 해운대 마린시티의 메밀국수 전문점.',
}
const PLACE_ID = '973360722'
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
  const dupName = all.filter((r) => norm(r.name).includes(norm('뫼밀집')))
  const dupAddr = all.filter((r) => norm(r.address).includes(norm('마린시티3로 23')))
  const dupPhone = all.filter((r) => norm(r.phone) === norm(R.phone))
  const dupPlace = all.filter((r) => String(r.kakao_map_url ?? '').includes(PLACE_ID))
  const pubBefore = all.filter((r) => r.is_published).length

  console.log(`=== 뫼밀집 등록 (${PUBLISH ? 'PUBLISH' : APPLY ? 'APPLY' : 'DRY-RUN'}) ===`)
  console.log(`전체 ${all.length} / 공개 ${pubBefore}`)
  console.log(`중복: slug=${dupSlug.length} name=${dupName.length} phone=${dupPhone.length} place=${dupPlace.length}`)
  console.log(`주소 부분일치(동일건물 허용): ${dupAddr.map((r) => r.name + '(' + r.slug + ')').join(', ') || '없음'}`)

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

  // ── 중복이면 중단 (주소 동일건물은 제외, 식당명/place/phone/slug 기준) ──
  if (dupSlug.length || dupName.length || dupPhone.length || dupPlace.length) {
    console.error('FAIL: 중복 감지 → 등록 중단'); process.exitCode = 2; return
  }

  // ── DRY-RUN ────────────────────────────────────────
  if (!APPLY) {
    console.log('\n[DRY-RUN] 등록 예정 restaurants row (is_published=false, appearance 없음):')
    console.log(JSON.stringify({ ...R, is_published: false }, null, 2))
    console.log('신규 restaurants 예정: 1 / appearance: 0(가이드) / 기존 수정: 0 / 신규 area·category 생성: 0')
    return
  }

  // ── APPLY: INSERT(비공개), appearance 없음 ─────────
  if (existing) { console.log('이미 등록됨. INSERT 생략.'); return }
  const { data: ins, error: insErr } = await sb.from('restaurants').insert({
    slug: R.slug, name: R.name, area: R.area, address: R.address, lat: R.lat, lng: R.lng,
    category: R.category, main_menu: R.main_menu, price_text: R.price_text, phone: R.phone,
    thumbnail: null, creator_name: R.creator_name, program_name: R.program_name,
    episode_title: R.episode_title, broadcast_date: R.broadcast_date, description: R.description,
    video_url: R.video_url, kakao_map_url: R.kakao_map_url, naver_map_url: R.naver_map_url,
    tmap_url: R.tmap_url, source_type: R.source_type, source_title: R.source_title, is_published: false,
  }, { defaultToNull: false }).select('id').single()
  if (insErr || !ins) { console.error('FAIL: restaurants INSERT', insErr?.code, insErr?.message); process.exitCode = 2; return }
  console.log(`INSERT 성공(비공개, guide): restaurant_id=${ins.id}`)
  console.log('appearance 미생성(미쉐린 가이드). 다음: 썸네일 업서트 후 --publish')
}

main().catch((e) => { console.error('FAIL: 예외 —', e?.message ?? String(e)); process.exitCode = 2 })
