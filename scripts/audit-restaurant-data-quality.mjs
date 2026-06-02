/**
 * 나온집 식당 데이터 품질 점검 스크립트 (읽기 전용).
 *
 * - 목적: 운영 DB 의 restaurants / restaurant_appearances / candidate_queue 를 점검해
 *   "문제 가능성이 높은 식당 후보" 를 자동으로 뽑아 콘솔 + 파일 리포트로 남긴다.
 * - 읽기 전용: select 만 수행하며 DB 를 절대 수정하지 않는다.
 *   (update / insert / delete / upsert / rpc 사용 금지)
 * - 웹검색·사실검증은 하지 않는다. 코드로 식별 가능한 문제 후보만 집계한다.
 *
 * 실행: node scripts/audit-restaurant-data-quality.mjs
 * 리포트: reports/restaurant-data-quality-audit.json, reports/restaurant-data-quality-audit.md
 *
 * 종료 코드:
 *   0 — 점검 완료(리포트 생성). 문제 후보가 있어도 0.
 *   2 — env 누락 / 테이블 없음 / 조회 실패 / 예기치 못한 예외
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

// .env.local 파싱 (audit-restaurant-appearances.mjs 와 동일한 방식). 값은 출력 금지.
const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
for (const line of raw.split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (!m) continue
  let value = m[2]
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1)
  }
  if (!process.env[m[1]]) process.env[m[1]] = value
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// 부산 좌표 범위 (src/lib/coords.ts 와 동일 — publish 게이트와 일관).
const LAT_MIN = 34.8
const LAT_MAX = 35.5
const LNG_MIN = 128.7
const LNG_MAX = 129.5

const MISSING_TABLE_CODES = new Set(['42P01', 'PGRST205'])

const isBlank = (v) => v === null || v === undefined || `${v}`.trim() === ''
const isPlaceholderUrl = (v) => typeof v === 'string' && /^https?:\/\/\s*$/.test(v.trim())
const norm = (v) => (v ?? '').toString().trim().toLowerCase().replace(/\s+/g, '')

function groupDuplicates(rows, keyFn) {
  const map = new Map()
  for (const r of rows) {
    const k = keyFn(r)
    if (k == null || `${k}`.trim() === '') continue
    const arr = map.get(k) ?? []
    arr.push(r)
    map.set(k, arr)
  }
  const dups = []
  for (const [key, arr] of map.entries()) {
    if (arr.length > 1) dups.push({ key, slugs: arr.map((x) => x.slug ?? x.id) })
  }
  return dups
}

async function main() {
  if (!url || !serviceKey) {
    console.error(
      'FAIL: env 누락 — .env.local 에 NEXT_PUBLIC_SUPABASE_URL 과 SUPABASE_SERVICE_ROLE_KEY 를 설정하세요.',
    )
    process.exitCode = 2
    return
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  // ── 조회 (select only) ──────────────────────────
  const { data: restos, error: rErr } = await supabase.from('restaurants').select('*')
  if (rErr) {
    console.error(`FAIL: restaurants 조회 실패 — ${rErr.code ?? '-'} ${rErr.message}`)
    process.exitCode = 2
    return
  }

  const { data: appsData, error: aErr } = await supabase
    .from('restaurant_appearances')
    .select('*')
  if (aErr && !MISSING_TABLE_CODES.has(aErr.code)) {
    console.error(`FAIL: restaurant_appearances 조회 실패 — ${aErr.code ?? '-'} ${aErr.message}`)
    process.exitCode = 2
    return
  }
  const apps = appsData ?? []

  const { data: candsData, error: cErr } = await supabase
    .from('candidate_queue')
    .select('id, restaurant_name, status, converted_restaurant_slug')
  if (cErr && !MISSING_TABLE_CODES.has(cErr.code)) {
    console.error(`FAIL: candidate_queue 조회 실패 — ${cErr.code ?? '-'} ${cErr.message}`)
    process.exitCode = 2
    return
  }
  const cands = candsData ?? []

  const restaurants = restos ?? []

  // restaurant_id → appearances[]
  const appsByRestaurant = new Map()
  for (const a of apps) {
    const arr = appsByRestaurant.get(a.restaurant_id) ?? []
    arr.push(a)
    appsByRestaurant.set(a.restaurant_id, arr)
  }

  // ── 1. 필수값 누락 ──────────────────────────────
  const REQUIRED = [
    'slug', 'name', 'area', 'category', 'address',
    'main_menu', 'price_text', 'source_type', 'source_title',
  ]
  const missingRequired = []
  let noThumbnail = 0
  for (const r of restaurants) {
    const missing = []
    for (const f of REQUIRED) if (isBlank(r[f])) missing.push(f)
    if (typeof r.lat !== 'number' || Number.isNaN(r.lat)) missing.push('lat')
    if (typeof r.lng !== 'number' || Number.isNaN(r.lng)) missing.push('lng')
    if (isBlank(r.program_name) && isBlank(r.creator_name)) missing.push('program_name|creator_name')
    const appHasDate = (appsByRestaurant.get(r.id) ?? []).some((a) => !isBlank(a.broadcast_date))
    if (isBlank(r.broadcast_date) && !appHasDate) missing.push('broadcast_date')
    if (isBlank(r.kakao_map_url)) missing.push('kakao_map_url')
    if (isBlank(r.video_url)) missing.push('video_url')
    if (isBlank(r.thumbnail)) noThumbnail += 1
    if (missing.length > 0) missingRequired.push({ slug: r.slug, name: r.name, missing, is_published: r.is_published })
  }

  // ── 2. 좌표 점검 ────────────────────────────────
  const coordWarnings = []
  for (const r of restaurants) {
    const reasons = []
    const lat = r.lat
    const lng = r.lng
    if (typeof lat !== 'number' || typeof lng !== 'number' || Number.isNaN(lat) || Number.isNaN(lng)) {
      reasons.push('non_numeric')
    } else if (lat === 0 || lng === 0) {
      reasons.push('zero')
    } else if (lat < LAT_MIN || lat > LAT_MAX || lng < LNG_MIN || lng > LNG_MAX) {
      reasons.push('out_of_busan_range')
    }
    if (reasons.length > 0) coordWarnings.push({ slug: r.slug, name: r.name, lat, lng, reasons })
  }
  // 동일 좌표 반복 / 주소 다른데 좌표 동일
  const coordMap = new Map()
  for (const r of restaurants) {
    if (typeof r.lat !== 'number' || typeof r.lng !== 'number') continue
    const k = `${r.lat},${r.lng}`
    const arr = coordMap.get(k) ?? []
    arr.push(r)
    coordMap.set(k, arr)
  }
  const duplicateCoords = []
  for (const [key, arr] of coordMap.entries()) {
    if (arr.length > 1) {
      const distinctAddr = new Set(arr.map((x) => norm(x.address))).size
      duplicateCoords.push({
        coord: key,
        slugs: arr.map((x) => x.slug),
        address_differs: distinctAddr > 1,
      })
    }
  }

  // ── 3. URL 점검 ─────────────────────────────────
  const urlWarnings = []
  for (const r of restaurants) {
    const reasons = []
    if (isBlank(r.kakao_map_url)) reasons.push('kakao_map_url_missing')
    else if (isPlaceholderUrl(r.kakao_map_url)) reasons.push('kakao_map_url_placeholder')
    if (isBlank(r.video_url)) reasons.push('video_url_missing')
    else if (isPlaceholderUrl(r.video_url)) reasons.push('video_url_placeholder')
    if (reasons.length > 0) urlWarnings.push({ slug: r.slug, name: r.name, reasons })
  }

  // ── 4. 중복 가능성 ──────────────────────────────
  const dupSlug = groupDuplicates(restaurants, (r) => r.slug)
  const dupName = groupDuplicates(restaurants, (r) => r.name)
  const dupNormName = groupDuplicates(restaurants, (r) => norm(r.name)).filter(
    (d) => !dupName.some((x) => norm(x.key) === d.key),
  )
  const dupAddress = groupDuplicates(restaurants, (r) => r.address)
  const dupNormAddress = groupDuplicates(restaurants, (r) => norm(r.address)).filter(
    (d) => !dupAddress.some((x) => norm(x.key) === d.key),
  )
  const dupPhone = groupDuplicates(restaurants.filter((r) => !isBlank(r.phone)), (r) => norm(r.phone))
  const dupKakao = groupDuplicates(
    restaurants.filter((r) => !isBlank(r.kakao_map_url) && !isPlaceholderUrl(r.kakao_map_url)),
    (r) => r.kakao_map_url,
  )
  // candidate_queue: converted_restaurant_slug 없이 같은 restaurant_name 여러 개
  const unconvertedCands = cands.filter((c) => isBlank(c.converted_restaurant_slug))
  const candNameMap = new Map()
  for (const c of unconvertedCands) {
    const k = norm(c.restaurant_name)
    if (!k) continue
    const arr = candNameMap.get(k) ?? []
    arr.push(c)
    candNameMap.set(k, arr)
  }
  const duplicateCandidates = []
  for (const [, arr] of candNameMap.entries()) {
    if (arr.length > 1) {
      duplicateCandidates.push({ restaurant_name: arr[0].restaurant_name, count: arr.length, ids: arr.map((x) => x.id) })
    }
  }

  // ── 5. area / category 집계 ─────────────────────
  const tally = (rows, field) => {
    const m = new Map()
    for (const r of rows) {
      const k = isBlank(r[field]) ? '(빈값)' : `${r[field]}`.trim()
      m.set(k, (m.get(k) ?? 0) + 1)
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([value, count]) => ({ value, count }))
  }
  const areaTally = tally(restaurants, 'area')
  const categoryTally = tally(restaurants, 'category')
  const VALID_AREAS = new Set([
    '해운대', '서면', '광안리', '남포동', '기장', '동래', '사상', '영도', '남구', '연제', '기타',
  ])
  const oddAreas = areaTally.filter((a) => a.value === '(빈값)' || !VALID_AREAS.has(a.value))
  const etcAreaCount = areaTally.find((a) => a.value === '기타')?.count ?? 0

  // ── 6. 방송/출처(appearance) 점검 ────────────────
  const appearanceWarnings = []
  for (const a of apps) {
    const reasons = []
    if (isBlank(a.source_type)) reasons.push('source_type_missing')
    if (isBlank(a.source_title)) reasons.push('source_title_missing')
    if (isBlank(a.program_name) && isBlank(a.creator_name)) reasons.push('program_and_creator_missing')
    if (isBlank(a.episode_title)) reasons.push('episode_title_missing')
    if (isBlank(a.broadcast_date)) reasons.push('broadcast_date_missing')
    if (isBlank(a.video_url)) reasons.push('video_url_missing')
    if (reasons.length > 0) appearanceWarnings.push({ restaurant_id: a.restaurant_id, source_title: a.source_title, reasons })
  }
  // 대표(restaurant) vs appearance 불일치(소스명) 후보
  const repMismatch = []
  for (const r of restaurants) {
    const list = appsByRestaurant.get(r.id) ?? []
    if (list.length === 0) continue
    const hasMatch = list.some((a) => norm(a.source_title) === norm(r.source_title))
    if (!hasMatch && !isBlank(r.source_title)) {
      repMismatch.push({ slug: r.slug, restaurant_source: r.source_title, appearance_sources: list.map((a) => a.source_title) })
    }
  }
  // appearance 2개 이상
  const multiAppearance = []
  for (const r of restaurants) {
    const list = appsByRestaurant.get(r.id) ?? []
    if (list.length >= 2) multiAppearance.push({ slug: r.slug, name: r.name, count: list.length })
  }

  // ── 7. 공개 상태 ────────────────────────────────
  const published = restaurants.filter((r) => r.is_published === true)
  const unpublished = restaurants.filter((r) => r.is_published !== true)
  const publishedMissingSlugs = new Set(
    missingRequired.filter((m) => m.is_published).map((m) => m.slug),
  )
  const publishedMissing = [...publishedMissingSlugs]
  const convertedSlugs = new Set(cands.map((c) => c.converted_restaurant_slug).filter(Boolean))
  const unpublishedButConverted = unpublished
    .filter((r) => convertedSlugs.has(r.slug))
    .map((r) => r.slug)

  // ── 8. 테스트 흔적 ──────────────────────────────
  const testTraces = restaurants
    .filter(
      (r) =>
        /test/i.test(r.slug ?? '') ||
        /테스트/.test(r.name ?? '') ||
        /테스트/.test(r.description ?? ''),
    )
    .map((r) => ({ slug: r.slug, name: r.name, is_published: r.is_published }))

  // ── 요약 ────────────────────────────────────────
  const summary = {
    restaurants: restaurants.length,
    appearances: apps.length,
    candidates: cands.length,
    published: published.length,
    unpublished: unpublished.length,
    missing_required: missingRequired.length,
    no_thumbnail: noThumbnail,
    coordinate_warnings: coordWarnings.length,
    duplicate_coords: duplicateCoords.length,
    url_warnings: urlWarnings.length,
    duplicate_slug: dupSlug.length,
    duplicate_name: dupName.length,
    duplicate_norm_name: dupNormName.length,
    duplicate_address: dupAddress.length,
    duplicate_phone: dupPhone.length,
    duplicate_kakao: dupKakao.length,
    duplicate_candidates: duplicateCandidates.length,
    odd_areas: oddAreas.length,
    etc_area_count: etcAreaCount,
    appearance_warnings: appearanceWarnings.length,
    rep_mismatch: repMismatch.length,
    multi_appearance: multiAppearance.length,
    published_missing: publishedMissing.length,
    unpublished_but_converted: unpublishedButConverted.length,
    test_traces: testTraces.length,
  }

  // 실행 시각 (KST 표기 + ISO).
  const now = new Date()
  const generatedAtIso = now.toISOString()
  const generatedAtKst = now.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })

  // ── 콘솔 요약 ───────────────────────────────────
  console.log('=== 나온집 데이터 품질 점검 (읽기 전용) ===')
  console.log(`생성시각: ${generatedAtKst} (KST)`)
  console.log(`restaurants: ${summary.restaurants}`)
  console.log(`appearances: ${summary.appearances}`)
  console.log(`candidates: ${summary.candidates}`)
  console.log(`published: ${summary.published}`)
  console.log(`unpublished: ${summary.unpublished}`)
  console.log(`missing required: ${summary.missing_required}`)
  console.log(`no thumbnail(별도집계): ${summary.no_thumbnail}`)
  console.log(`coordinate warnings: ${summary.coordinate_warnings}`)
  console.log(`duplicate coords: ${summary.duplicate_coords}`)
  console.log(`url warnings: ${summary.url_warnings}`)
  console.log(`duplicate slug/name/normName/address/phone/kakao: ${summary.duplicate_slug}/${summary.duplicate_name}/${summary.duplicate_norm_name}/${summary.duplicate_address}/${summary.duplicate_phone}/${summary.duplicate_kakao}`)
  console.log(`duplicate candidates: ${summary.duplicate_candidates}`)
  console.log(`odd areas: ${summary.odd_areas} (기타 ${summary.etc_area_count})`)
  console.log(`appearance warnings: ${summary.appearance_warnings}`)
  console.log(`rep/appearance mismatch: ${summary.rep_mismatch}`)
  console.log(`multi appearance: ${summary.multi_appearance}`)
  console.log(`published missing required: ${summary.published_missing}`)
  console.log(`unpublished but converted: ${summary.unpublished_but_converted}`)
  console.log(`test traces: ${summary.test_traces}`)

  const report = {
    generated_at: generatedAtIso,
    generated_at_kst: generatedAtKst,
    busan_range: { lat: [LAT_MIN, LAT_MAX], lng: [LNG_MIN, LNG_MAX] },
    summary,
    details: {
      missing_required: missingRequired,
      coordinate_warnings: coordWarnings,
      duplicate_coords: duplicateCoords,
      url_warnings: urlWarnings,
      duplicates: {
        slug: dupSlug,
        name: dupName,
        norm_name: dupNormName,
        address: dupAddress,
        norm_address: dupNormAddress,
        phone: dupPhone,
        kakao_map_url: dupKakao,
        candidates: duplicateCandidates,
      },
      area_tally: areaTally,
      category_tally: categoryTally,
      odd_areas: oddAreas,
      appearance_warnings: appearanceWarnings,
      rep_mismatch: repMismatch,
      multi_appearance: multiAppearance,
      published_missing: publishedMissing,
      unpublished_but_converted: unpublishedButConverted,
      test_traces: testTraces,
    },
  }

  // ── 파일 저장 ───────────────────────────────────
  const here = dirname(fileURLToPath(import.meta.url))
  const reportsDir = join(here, '..', 'reports')
  mkdirSync(reportsDir, { recursive: true })
  const jsonPath = join(reportsDir, 'restaurant-data-quality-audit.json')
  const mdPath = join(reportsDir, 'restaurant-data-quality-audit.md')

  writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8')
  writeFileSync(mdPath, buildMarkdown(report), 'utf8')

  console.log('')
  console.log(`리포트 저장: reports/restaurant-data-quality-audit.json`)
  console.log(`리포트 저장: reports/restaurant-data-quality-audit.md`)
}

function buildMarkdown(report) {
  const s = report.summary
  const lines = []
  const push = (l = '') => lines.push(l)
  push('# 나온집 데이터 품질 점검 리포트')
  push('')
  push(`- 생성시각: ${report.generated_at_kst} (KST) / ${report.generated_at}`)
  push(`- 부산 좌표 범위: lat ${report.busan_range.lat.join('~')}, lng ${report.busan_range.lng.join('~')}`)
  push('- 읽기 전용 점검. DB 수정 없음. 웹검색·사실검증 미포함(코드 식별 문제 후보만).')
  push('')
  push('## 요약')
  push('```text')
  for (const [k, v] of Object.entries(s)) push(`${k}: ${v}`)
  push('```')
  push('')

  const section = (title, rows, fmt) => {
    push(`## ${title} (${rows.length})`)
    if (rows.length === 0) push('- 없음')
    else for (const r of rows) push(`- ${fmt(r)}`)
    push('')
  }

  section('필수값 누락', report.details.missing_required, (r) =>
    `${r.slug} (${r.name}) [${r.is_published ? '공개' : '비공개'}] → ${r.missing.join(', ')}`)
  section('좌표 경고', report.details.coordinate_warnings, (r) =>
    `${r.slug} (${r.name}) lat=${r.lat} lng=${r.lng} → ${r.reasons.join(', ')}`)
  section('동일 좌표', report.details.duplicate_coords, (r) =>
    `${r.coord} → ${r.slugs.join(', ')}${r.address_differs ? ' (주소 다름!)' : ''}`)
  section('URL 경고', report.details.url_warnings, (r) =>
    `${r.slug} (${r.name}) → ${r.reasons.join(', ')}`)

  push('## 중복 가능성')
  const dup = report.details.duplicates
  const dumpDup = (label, arr, kf = (d) => `${d.key} → ${(d.slugs || []).join(', ')}`) => {
    push(`### ${label} (${arr.length})`)
    if (arr.length === 0) push('- 없음')
    else for (const d of arr) push(`- ${kf(d)}`)
    push('')
  }
  dumpDup('slug 중복', dup.slug)
  dumpDup('name 완전 동일', dup.name)
  dumpDup('name 유사(공백/대소문자 무시)', dup.norm_name)
  dumpDup('address 완전 동일', dup.address)
  dumpDup('address 유사', dup.norm_address)
  dumpDup('전화번호 동일', dup.phone)
  dumpDup('카카오맵 URL 동일', dup.kakao_map_url)
  dumpDup('candidate restaurant_name 중복(미변환)', dup.candidates, (d) =>
    `${d.restaurant_name} ×${d.count} (ids: ${d.ids.join(', ')})`)

  push('## area 집계')
  for (const a of report.details.area_tally) push(`- ${a.value}: ${a.count}`)
  push('')
  push('## category 집계')
  for (const c of report.details.category_tally) push(`- ${c.value}: ${c.count}`)
  push('')
  section('이상 area 후보', report.details.odd_areas, (a) => `${a.value}: ${a.count}`)
  section('appearance 경고', report.details.appearance_warnings, (a) =>
    `restaurant_id=${a.restaurant_id} (${a.source_title ?? '-'}) → ${a.reasons.join(', ')}`)
  section('대표/appearance 출처 불일치', report.details.rep_mismatch, (r) =>
    `${r.slug}: restaurant="${r.restaurant_source}" vs appearance=${JSON.stringify(r.appearance_sources)}`)
  section('appearance 2개 이상', report.details.multi_appearance, (r) =>
    `${r.slug} (${r.name}) ×${r.count}`)
  section('공개 식당 필수값 누락', report.details.published_missing, (slug) => `${slug}`)
  section('비공개인데 converted', report.details.unpublished_but_converted, (slug) => `${slug}`)
  section('테스트 흔적 후보', report.details.test_traces, (r) =>
    `${r.slug} (${r.name}) [${r.is_published ? '공개' : '비공개'}]`)

  return lines.join('\n')
}

main().catch((err) => {
  console.error('FAIL: 예기치 못한 예외 —', err?.message ?? String(err))
  process.exitCode = 2
})
