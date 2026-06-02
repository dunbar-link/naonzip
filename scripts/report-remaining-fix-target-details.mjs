/**
 * 나온집 남은 보강 후보 TOP20 상세 조사 리포트 (읽기 전용).
 *
 * - 목적: 지정된 TOP20 slug 의 restaurants + restaurant_appearances + candidate_queue
 *   실제 DB 값을 상세 조회해, 다음 보강 SQL 의 근거표를 만든다.
 * - 읽기 전용: select 만 수행. update/insert/delete/upsert/rpc 금지. 웹검색 없음.
 *
 * 실행: node scripts/report-remaining-fix-target-details.mjs
 * 리포트: reports/remaining-fix-target-details.json, reports/remaining-fix-target-details.md
 *
 * 종료 코드: 0 성공 / 2 env·조회 실패
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
for (const line of raw.split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (!m) continue
  let v = m[2]
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
  if (!process.env[m[1]]) process.env[m[1]] = v
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const MISSING_TABLE_CODES = new Set(['42P01', 'PGRST205'])

const TOP20 = [
  'subyeon-choego-doejigukbap-minrak',
  'bapsang-gijang-haebyeon-jipbul-gomjangeo',
  'ddoganjip-pungnyeon-gopchang',
  'hanyakbang-gukbap-hyeongje-food',
  'sungsik-gwangalli-jinmi-eonyang-bulgogi',
  'saengdal-jeonpo-toda-park',
  'samdae-haeundae-wonjo-halmae-gukbap',
  'sungsik-gwangalli-geumson-1983',
  'baekban-dongnae-pajeon',
  'saengbang-gwangalli-sanhae-hoejip',
  'saengdal-bukgu-shunsaikubo',
  'saengdal-namgu-daeyeon-milmyeon',
  'saengdal-yeonje-gukje-milmyeon',
  'baekban-haeundae-yangs-yanggopchang',
  'baekban-yeongdo-jinju-sikdang',
  'baekban-yeongdo-jungri-haenyeochon',
  'saengdal-sasang-peanut-bbangatgan',
  'saengdal-suyeong-sushibashiku',
  'wonjo-gaya-milmyeon',
  'naeho-naengmyeon',
]

const isBlank = (v) => v === null || v === undefined || `${v}`.trim() === ''
const isPlaceholderUrl = (v) => typeof v === 'string' && /^https?:\/\/\s*$/.test(v.trim())
const isPlaceholderText = (v) => {
  if (isBlank(v)) return true
  const t = `${v}`.trim()
  return t.length < 3 || /확인\s*필요|상이|미정|tbd|placeholder/i.test(t)
}
const isShortDesc = (v) => isBlank(v) || `${v}`.trim().length < 10

// video_url 누락 묶음용 출처 라벨 정규화.
function sourceBucket(label) {
  if (!label) return '기타'
  const s = `${label}`
  if (/생활의\s*달인/.test(s)) return '생활의 달인'
  if (/백반기행/.test(s)) return '백반기행'
  if (/3대\s*천왕|3대천왕|삼대천왕/.test(s)) return '백종원의 3대천왕'
  if (/또간집|풍자/.test(s)) return '풍자 또간집'
  if (/쯔양/.test(s)) return '쯔양'
  if (/성시경|먹을텐데/.test(s)) return '성시경 먹을텐데'
  if (/생생정보/.test(s)) return '2TV 생생정보'
  if (/생방송\s*투데이/.test(s)) return '생방송 투데이'
  return s.trim() || '기타'
}

function classify(reasons, r) {
  const has = (k) => reasons.includes(k)
  const sourceUnclear = has('source_title') || has('program_or_creator')
  const webNeeded = ['video_url', 'broadcast_date', 'appearance_broadcast_date', 'episode_title'].some(has)
  const policyOnly = reasons.length > 0 && reasons.every((k) => ['area_etc', 'main_menu', 'price_text', 'description'].includes(k))
  if (sourceUnclear) return 'C'
  if (policyOnly) return 'C'
  if (webNeeded) return 'B'
  return 'A'
}

function recommend(reasons) {
  const map = {
    video_url: '영상 URL', kakao_map_url: '카카오맵 URL', broadcast_date: '방영일',
    appearance_broadcast_date: '방영일(출연)', episode_title: '에피소드', source_title: '출처명',
    program_or_creator: '프로그램/크리에이터', main_menu: '대표메뉴', price_text: '가격대',
    area_etc: '지역 재분류', description: '설명',
  }
  const labels = reasons.map((k) => map[k]).filter(Boolean)
  if (labels.length === 0) return '확인 불필요'
  return labels.slice(0, 3).join(' / ') + ' 보강'
}

async function main() {
  if (!url || !serviceKey) {
    console.error('FAIL: env 누락 — NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 필요.')
    process.exitCode = 2
    return
  }
  const sb = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })

  const { data: rs, error: rErr } = await sb.from('restaurants').select('*').in('slug', TOP20)
  if (rErr) {
    console.error(`FAIL: restaurants 조회 실패 — ${rErr.code ?? '-'} ${rErr.message}`)
    process.exitCode = 2
    return
  }
  const bySlug = new Map((rs ?? []).map((r) => [r.slug, r]))
  const ids = (rs ?? []).map((r) => r.id)

  const { data: appsData, error: aErr } = await sb.from('restaurant_appearances').select('*').in('restaurant_id', ids)
  if (aErr && !MISSING_TABLE_CODES.has(aErr.code)) {
    console.error(`FAIL: restaurant_appearances 조회 실패 — ${aErr.code ?? '-'} ${aErr.message}`)
    process.exitCode = 2
    return
  }
  const apps = appsData ?? []
  const appsByRestaurant = new Map()
  for (const a of apps) {
    const arr = appsByRestaurant.get(a.restaurant_id) ?? []
    arr.push(a)
    appsByRestaurant.set(a.restaurant_id, arr)
  }

  const names = (rs ?? []).map((r) => r.name)
  const { data: candsData } = await sb
    .from('candidate_queue')
    .select('id, restaurant_name, status, source_name, source_url, converted_restaurant_slug, created_at, converted_at')
    .or(`restaurant_name.in.(${names.map((n) => `"${n.replace(/"/g, '')}"`).join(',')}),converted_restaurant_slug.in.(${TOP20.join(',')})`)
  const cands = candsData ?? []

  // ── 상세 표 ─────────────────────────────────────
  const rows = []
  for (let i = 0; i < TOP20.length; i++) {
    const slug = TOP20[i]
    const r = bySlug.get(slug)
    if (!r) {
      rows.push({ rank: i + 1, slug, found: false })
      continue
    }
    const myApps = appsByRestaurant.get(r.id) ?? []
    const reasons = []
    if (isBlank(r.video_url)) reasons.push('video_url')
    if (isBlank(r.kakao_map_url) || isPlaceholderUrl(r.kakao_map_url)) reasons.push('kakao_map_url')
    if (isBlank(r.broadcast_date)) reasons.push('broadcast_date')
    if (myApps.some((a) => isBlank(a.broadcast_date))) reasons.push('appearance_broadcast_date')
    if (isBlank(r.episode_title)) reasons.push('episode_title')
    if (isBlank(r.source_title)) reasons.push('source_title')
    if (isBlank(r.program_name) && isBlank(r.creator_name)) reasons.push('program_or_creator')
    if (isPlaceholderText(r.main_menu)) reasons.push('main_menu')
    if (isPlaceholderText(r.price_text)) reasons.push('price_text')
    if (`${r.area}`.trim() === '기타') reasons.push('area_etc')
    if (isShortDesc(r.description)) reasons.push('description')

    const relatedCands = cands.filter(
      (c) => c.converted_restaurant_slug === slug || `${c.restaurant_name}`.trim() === `${r.name}`.trim(),
    )

    rows.push({
      rank: i + 1,
      found: true,
      id: r.id,
      slug: r.slug,
      name: r.name,
      area: r.area,
      category: r.category,
      address: r.address,
      lat: r.lat,
      lng: r.lng,
      phone: r.phone ?? null,
      main_menu: r.main_menu ?? null,
      price_text: r.price_text ?? null,
      source_type: r.source_type ?? null,
      source_title: r.source_title ?? null,
      program_name: r.program_name ?? null,
      creator_name: r.creator_name ?? null,
      episode_title: r.episode_title ?? null,
      broadcast_date: r.broadcast_date ?? null,
      video_url: r.video_url ?? null,
      kakao_map_url: r.kakao_map_url ?? null,
      thumbnail: r.thumbnail ?? null,
      is_published: r.is_published,
      created_at: r.created_at ?? null,
      updated_at: r.updated_at ?? null,
      appearance_count: myApps.length,
      appearances: myApps.map((a) => ({
        id: a.id,
        source_type: a.source_type ?? null,
        source_title: a.source_title ?? null,
        program_name: a.program_name ?? null,
        creator_name: a.creator_name ?? null,
        episode_title: a.episode_title ?? null,
        broadcast_date: a.broadcast_date ?? null,
        video_url: a.video_url ?? null,
        source_url: a.source_url ?? null,
        created_at: a.created_at ?? null,
      })),
      appearance_broadcast_dates: myApps.map((a) => a.broadcast_date ?? null),
      appearance_video_urls: myApps.map((a) => a.video_url ?? null),
      missing_reasons: reasons,
      recommended_action: recommend(reasons),
      group: classify(reasons, r),
      candidates: relatedCands,
    })
  }

  const found = rows.filter((x) => x.found)
  const groupA = found.filter((x) => x.group === 'A')
  const groupB = found.filter((x) => x.group === 'B')
  const groupC = found.filter((x) => x.group === 'C')

  // ── 카카오 누락 ──────────────────────────────────
  const kakaoMissing = found
    .filter((x) => x.missing_reasons.includes('kakao_map_url'))
    .map((x) => ({
      slug: x.slug, name: x.name, address: x.address, lat: x.lat, lng: x.lng,
      kakao_search_url_candidate: `https://map.kakao.com/link/search/${encodeURIComponent(x.name)}`,
    }))

  // ── 방영일 누락 ──────────────────────────────────
  const restoDateMissing = found.filter((x) => isBlank(x.broadcast_date)).map((x) => ({ slug: x.slug, name: x.name, source_title: x.source_title }))
  const appDateMissing = []
  for (const x of found) {
    for (const a of x.appearances) {
      if (isBlank(a.broadcast_date)) appDateMissing.push({ slug: x.slug, name: x.name, appearance_id: a.id, source_title: a.source_title })
    }
  }

  // ── video_url 누락 (출처 버킷별) ────────────────
  const videoMissingBuckets = {}
  for (const x of found) {
    if (!isBlank(x.video_url)) continue
    const bucket = sourceBucket(x.program_name ?? x.creator_name ?? x.source_title)
    ;(videoMissingBuckets[bucket] ??= []).push({ slug: x.slug, name: x.name, source_title: x.source_title })
  }

  const summary = {
    requested: TOP20.length,
    found: found.length,
    not_found: rows.length - found.length,
    group_A: groupA.length,
    group_B: groupB.length,
    group_C: groupC.length,
    kakao_missing: kakaoMissing.length,
    resto_broadcast_date_missing: restoDateMissing.length,
    appearance_broadcast_date_missing: appDateMissing.length,
    video_url_missing: found.filter((x) => isBlank(x.video_url)).length,
  }

  const now = new Date()
  const report = {
    generated_at: now.toISOString(),
    generated_at_kst: now.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
    summary,
    top20: rows,
    groups: { A: groupA.map((x) => x.slug), B: groupB.map((x) => x.slug), C: groupC.map((x) => x.slug) },
    kakao_missing: kakaoMissing,
    resto_broadcast_date_missing: restoDateMissing,
    appearance_broadcast_date_missing: appDateMissing,
    video_url_missing_buckets: videoMissingBuckets,
  }

  // ── 콘솔 ────────────────────────────────────────
  console.log('=== 남은 보강 후보 TOP20 상세 (읽기 전용) ===')
  console.log(`생성시각: ${report.generated_at_kst} (KST)`)
  console.log(`requested ${summary.requested} / found ${summary.found} / not found ${summary.not_found}`)
  console.log(`group A(SQL가능): ${summary.group_A} / B(웹검증): ${summary.group_B} / C(보류·정책): ${summary.group_C}`)
  console.log(`kakao missing: ${summary.kakao_missing}`)
  console.log(`resto broadcast_date missing: ${summary.resto_broadcast_date_missing}`)
  console.log(`appearance broadcast_date missing: ${summary.appearance_broadcast_date_missing}`)
  console.log(`video_url missing: ${summary.video_url_missing}`)
  console.log('')
  for (const x of rows) {
    if (!x.found) { console.log(`${String(x.rank).padStart(2)}. ${x.slug} → NOT FOUND`); continue }
    console.log(`${String(x.rank).padStart(2)}. [${x.group}] ${x.slug} (${x.name}) | src=${x.source_title ?? '-'} | bdate=${x.broadcast_date ?? '-'} | video=${isBlank(x.video_url) ? 'X' : 'O'} | kakao=${isBlank(x.kakao_map_url) ? 'X' : 'O'} | app=${x.appearance_count} → ${x.recommended_action}`)
  }

  const here = dirname(fileURLToPath(import.meta.url))
  const reportsDir = join(here, '..', 'reports')
  mkdirSync(reportsDir, { recursive: true })
  writeFileSync(join(reportsDir, 'remaining-fix-target-details.json'), JSON.stringify(report, null, 2), 'utf8')
  writeFileSync(join(reportsDir, 'remaining-fix-target-details.md'), buildMarkdown(report), 'utf8')
  console.log('')
  console.log('리포트 저장: reports/remaining-fix-target-details.json')
  console.log('리포트 저장: reports/remaining-fix-target-details.md')
}

function buildMarkdown(report) {
  const lines = []
  const push = (l = '') => lines.push(l)
  push('# 나온집 남은 보강 후보 TOP20 상세 조사')
  push('')
  push(`- 생성시각: ${report.generated_at_kst} (KST) / ${report.generated_at}`)
  push('- 읽기 전용. DB 수정 없음. 웹검색 미포함. 다음 보강 SQL 근거표.')
  push('')
  push('## Summary')
  push('```text')
  for (const [k, v] of Object.entries(report.summary)) push(`${k}: ${v}`)
  push('```')
  push('')
  push('## TOP20 상세 표')
  push('| # | grp | slug | name | area/cat | source_title | program | creator | bdate | video | kakao | app | app_bdate | 추천 |')
  push('|---|---|---|---|---|---|---|---|---|---|---|---|---|---|')
  for (const x of report.top20) {
    if (!x.found) { push(`| ${x.rank} | - | ${x.slug} | NOT FOUND | | | | | | | | | | |`); continue }
    push(`| ${x.rank} | ${x.group} | ${x.slug} | ${x.name} | ${x.area}/${x.category} | ${x.source_title ?? '-'} | ${x.program_name ?? '-'} | ${x.creator_name ?? '-'} | ${x.broadcast_date ?? '-'} | ${x.video_url ? 'O' : 'X'} | ${x.kakao_map_url ? 'O' : 'X'} | ${x.appearance_count} | ${JSON.stringify(x.appearance_broadcast_dates)} | ${x.recommended_action} |`)
  }
  push('')
  push('### 누락 사유 상세')
  for (const x of report.top20) {
    if (!x.found) continue
    push(`- ${x.rank}. **${x.slug}** (${x.name}) [${x.group}] → ${x.missing_reasons.join(', ') || '없음'}`)
  }
  push('')
  const grpSection = (title, slugs) => {
    push(`## ${title} (${slugs.length})`)
    if (slugs.length === 0) push('- 없음')
    else for (const s of slugs) push(`- ${s}`)
    push('')
  }
  grpSection('A. SQL 보강 가능성 높은 후보 (출처 명확 · 카카오/지역/설명 등 직접 채움)', report.groups.A)
  grpSection('B. 웹검증 후 보강 (식당명 명확하나 방영일/영상 URL 부족)', report.groups.B)
  grpSection('C. 보류·정책 판단 (출처 모호 · area/category 정책 · 가격/메뉴만)', report.groups.C)

  push(`## 카카오맵 URL 누락 후보 (${report.kakao_missing.length})`)
  push('| slug | name | address | 카카오 검색 URL 후보(DB 미반영) |')
  push('|---|---|---|---|')
  for (const k of report.kakao_missing) push(`| ${k.slug} | ${k.name} | ${k.address} | ${k.kakao_search_url_candidate} |`)
  push('')

  push(`## 방영일 누락 — restaurants (${report.resto_broadcast_date_missing.length})`)
  for (const x of report.resto_broadcast_date_missing) push(`- ${x.slug} (${x.name}) / 출처: ${x.source_title ?? '-'}`)
  push('')
  push(`## 방영일 누락 — appearances (${report.appearance_broadcast_date_missing.length})`)
  for (const x of report.appearance_broadcast_date_missing) push(`- ${x.slug} (${x.name}) appearance=${x.appearance_id} / 출처: ${x.source_title ?? '-'}`)
  push('')

  push('## video_url 누락 — 출처 버킷별')
  for (const [bucket, arr] of Object.entries(report.video_url_missing_buckets)) {
    push(`### ${bucket} (${arr.length})`)
    for (const x of arr) push(`- ${x.slug} (${x.name})`)
  }
  push('')
  push('## 다음 작업 추천')
  push('1. A 그룹부터: 카카오맵 URL(이름 검색 링크)·지역 재분류·설명 보강은 웹검증 없이 SQL 가능.')
  push('2. B 그룹: 출처(프로그램/회차) 기준 방영일·영상 URL을 웹에서 확인 후 보강.')
  push('3. C 그룹: 출처 모호/정책 판단 → 운영자 결정 후 진행(자동 보강 보류).')
  return lines.join('\n')
}

main().catch((err) => {
  console.error('FAIL: 예기치 못한 예외 —', err?.message ?? String(err))
  process.exitCode = 2
})
