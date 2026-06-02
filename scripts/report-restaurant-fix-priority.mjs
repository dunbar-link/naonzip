/**
 * 나온집 공개 식당 보강 우선순위 리포트 (읽기 전용).
 *
 * - 목적: 공개 식당(is_published=true) 중 사용자 화면/SEO/정렬에 영향이 큰
 *   누락값을 가중 점수로 환산해 보강 우선순위 TOP 를 뽑는다.
 * - 읽기 전용: select 만 수행. update/insert/delete/upsert/rpc 금지.
 * - 웹검색·사실검증 없음. 코드로 식별 가능한 누락만 점수화한다.
 *
 * 실행: node scripts/report-restaurant-fix-priority.mjs
 * 리포트: reports/restaurant-fix-priority.json, reports/restaurant-fix-priority.md
 *
 * 종료 코드: 0 성공 / 2 env·테이블·조회 실패
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

const isBlank = (v) => v === null || v === undefined || `${v}`.trim() === ''
const isPlaceholderUrl = (v) => typeof v === 'string' && /^https?:\/\/\s*$/.test(v.trim())
// 가격/메뉴 placeholder: "확인 필요", "상이", "미정" 등 또는 과도하게 짧음.
const isPlaceholderText = (v) => {
  if (isBlank(v)) return true
  const t = `${v}`.trim()
  if (t.length < 3) return true
  return /확인\s*필요|상이|미정|tbd|placeholder/i.test(t)
}
const isShortDesc = (v) => isBlank(v) || `${v}`.trim().length < 10

function buildAction(reasons) {
  const has = (k) => reasons.includes(k)
  if (has('video_url') && has('kakao_map_url') && (has('broadcast_date') || has('appearance_broadcast_date'))) {
    return '영상 URL + 카카오맵 URL + 방영일 우선 보강'
  }
  const labelOrder = [
    ['video_url', '영상 URL'],
    ['kakao_map_url', '카카오맵 URL'],
    ['broadcast_date', '방영일'],
    ['appearance_broadcast_date', '방영일(출연)'],
    ['source_title', '출처명'],
    ['program_or_creator', '프로그램/크리에이터'],
    ['episode_title', '에피소드'],
    ['main_menu', '대표메뉴'],
    ['price_text', '가격대'],
    ['description', '설명'],
    ['area_etc', '지역 재분류'],
  ]
  const labels = []
  for (const [k, lbl] of labelOrder) if (has(k) && !labels.includes(lbl)) labels.push(lbl)
  if (labels.length === 0) return '확인 불필요'
  if (labels.length === 1 && labels[0] === '지역 재분류') return '기타 지역 재분류 검토'
  return labels.slice(0, 3).join(' / ') + ' 보강'
}

async function main() {
  if (!url || !serviceKey) {
    console.error('FAIL: env 누락 — .env.local 에 NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 설정 필요.')
    process.exitCode = 2
    return
  }
  const sb = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })

  const { data: restos, error: rErr } = await sb.from('restaurants').select('*')
  if (rErr) {
    console.error(`FAIL: restaurants 조회 실패 — ${rErr.code ?? '-'} ${rErr.message}`)
    process.exitCode = 2
    return
  }
  const { data: appsData, error: aErr } = await sb.from('restaurant_appearances').select('*')
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

  const published = (restos ?? []).filter((r) => r.is_published === true)

  // ── 점수화 ──────────────────────────────────────
  const scored = []
  let noThumbnail = 0
  const counters = {
    video_url_missing: 0,
    kakao_map_url_missing: 0,
    broadcast_date_missing: 0,
    appearance_broadcast_date_missing: 0,
    episode_title_missing: 0,
    source_title_missing: 0,
    program_or_creator_missing: 0,
  }

  for (const r of published) {
    const myApps = appsByRestaurant.get(r.id) ?? []
    const reasons = []
    let score = 0

    if (isBlank(r.video_url)) { score += 5; reasons.push('video_url'); counters.video_url_missing++ }
    if (isBlank(r.kakao_map_url) || isPlaceholderUrl(r.kakao_map_url)) { score += 5; reasons.push('kakao_map_url'); counters.kakao_map_url_missing++ }
    if (isBlank(r.broadcast_date)) { score += 4; reasons.push('broadcast_date'); counters.broadcast_date_missing++ }
    if (myApps.some((a) => isBlank(a.broadcast_date))) { score += 4; reasons.push('appearance_broadcast_date'); counters.appearance_broadcast_date_missing++ }
    if (isBlank(r.episode_title)) { score += 3; reasons.push('episode_title'); counters.episode_title_missing++ }
    if (isBlank(r.source_title)) { score += 4; reasons.push('source_title'); counters.source_title_missing++ }
    if (isBlank(r.program_name) && isBlank(r.creator_name)) { score += 4; reasons.push('program_or_creator'); counters.program_or_creator_missing++ }
    if (isPlaceholderText(r.main_menu)) { score += 2; reasons.push('main_menu') }
    if (isPlaceholderText(r.price_text)) { score += 2; reasons.push('price_text') }
    if (`${r.area}`.trim() === '기타') { score += 1; reasons.push('area_etc') }
    if (isShortDesc(r.description)) { score += 1; reasons.push('description') }
    if (isBlank(r.thumbnail)) noThumbnail++

    if (score > 0) {
      scored.push({
        score,
        slug: r.slug,
        name: r.name,
        area: r.area,
        category: r.category,
        address: r.address,
        source_title: r.source_title ?? null,
        program_name: r.program_name ?? null,
        creator_name: r.creator_name ?? null,
        broadcast_date: r.broadcast_date ?? null,
        video_url_status: isBlank(r.video_url) ? 'missing' : (isPlaceholderUrl(r.video_url) ? 'placeholder' : 'ok'),
        kakao_map_url_status: isBlank(r.kakao_map_url) ? 'missing' : (isPlaceholderUrl(r.kakao_map_url) ? 'placeholder' : 'ok'),
        appearance_count: myApps.length,
        missing_reasons: reasons,
        recommended_action: buildAction(reasons),
      })
    }
  }
  scored.sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug))
  const top20 = scored.slice(0, 20)

  // ── area/category 누락 집계 (점수>0 식당 기준) ──
  const tallyMissing = (rows, field) => {
    const m = new Map()
    for (const r of rows) {
      const k = isBlank(r[field]) ? '(빈값)' : `${r[field]}`.trim()
      m.set(k, (m.get(k) ?? 0) + 1)
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([value, count]) => ({ value, count }))
  }
  const areaMissing = tallyMissing(scored, 'area')
  const categoryMissing = tallyMissing(scored, 'category')
  const etcAreaList = published
    .filter((r) => `${r.area}`.trim() === '기타')
    .map((r) => ({ slug: r.slug, name: r.name, category: r.category, address: r.address }))

  // ── appearance 누락 TOP ─────────────────────────
  const appMissing = []
  for (const r of published) {
    const myApps = appsByRestaurant.get(r.id) ?? []
    let cnt = 0
    const detail = []
    for (const a of myApps) {
      if (isBlank(a.broadcast_date)) { cnt++; detail.push('broadcast_date') }
      if (isBlank(a.episode_title)) { cnt++; detail.push('episode_title') }
      if (isBlank(a.video_url)) { cnt++; detail.push('video_url') }
    }
    if (cnt > 0) appMissing.push({ slug: r.slug, name: r.name, appearance_count: myApps.length, missing_count: cnt, missing: [...new Set(detail)] })
  }
  appMissing.sort((a, b) => b.missing_count - a.missing_count || a.slug.localeCompare(b.slug))
  const appMissingTop = appMissing.slice(0, 20)

  // ── 요약 ────────────────────────────────────────
  const summary = {
    published_restaurants: published.length,
    priority_candidates: scored.length,
    top_score: scored[0]?.score ?? 0,
    no_thumbnail: noThumbnail,
    ...counters,
  }

  const now = new Date()
  const report = {
    generated_at: now.toISOString(),
    generated_at_kst: now.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
    weights: {
      video_url: 5, kakao_map_url: 5, broadcast_date: 4, appearance_broadcast_date: 4,
      episode_title: 3, source_title: 4, program_or_creator: 4, main_menu: 2, price_text: 2,
      area_etc: 1, description: 1, thumbnail: '집계만(점수 제외)',
    },
    summary,
    top20,
    area_missing: areaMissing,
    category_missing: categoryMissing,
    etc_area_list: etcAreaList,
    appearance_missing_top: appMissingTop,
    all_scored: scored,
  }

  // ── 콘솔 ────────────────────────────────────────
  console.log('=== 공개 식당 보강 우선순위 (읽기 전용) ===')
  console.log(`생성시각: ${report.generated_at_kst} (KST)`)
  console.log(`published restaurants: ${summary.published_restaurants}`)
  console.log(`priority candidates: ${summary.priority_candidates}`)
  console.log(`top score: ${summary.top_score}`)
  console.log(`video_url missing: ${summary.video_url_missing}`)
  console.log(`kakao_map_url missing: ${summary.kakao_map_url_missing}`)
  console.log(`broadcast_date missing: ${summary.broadcast_date_missing}`)
  console.log(`appearance date missing: ${summary.appearance_broadcast_date_missing}`)
  console.log(`source_title missing: ${summary.source_title_missing}`)
  console.log(`program/creator missing: ${summary.program_or_creator_missing}`)
  console.log(`no thumbnail(별도집계): ${summary.no_thumbnail}`)
  console.log('')
  console.log('--- TOP 20 ---')
  top20.forEach((r, i) => {
    console.log(`${String(i + 1).padStart(2)}. [${r.score}] ${r.slug} (${r.name}) | ${r.area}/${r.category} | ${r.recommended_action}`)
  })

  // ── 파일 저장 ───────────────────────────────────
  const here = dirname(fileURLToPath(import.meta.url))
  const reportsDir = join(here, '..', 'reports')
  mkdirSync(reportsDir, { recursive: true })
  writeFileSync(join(reportsDir, 'restaurant-fix-priority.json'), JSON.stringify(report, null, 2), 'utf8')
  writeFileSync(join(reportsDir, 'restaurant-fix-priority.md'), buildMarkdown(report), 'utf8')
  console.log('')
  console.log('리포트 저장: reports/restaurant-fix-priority.json')
  console.log('리포트 저장: reports/restaurant-fix-priority.md')
}

function buildMarkdown(report) {
  const s = report.summary
  const lines = []
  const push = (l = '') => lines.push(l)
  push('# 나온집 공개 식당 보강 우선순위 리포트')
  push('')
  push(`- 생성시각: ${report.generated_at_kst} (KST) / ${report.generated_at}`)
  push('- 대상: 공개 식당(is_published=true). 읽기 전용. DB 수정 없음. 웹검색 미포함.')
  push('- thumbnail 누락은 점수 제외(별도 집계). naver/tmap URL 누락은 점수 대상 아님(좌표 자동생성 정책).')
  push('')
  push('## Summary')
  push('```text')
  for (const [k, v] of Object.entries(s)) push(`${k}: ${v}`)
  push('```')
  push('')
  push('## TOP 20 보강 대상')
  push('| # | score | slug | name | area | category | 출처 | 방영일 | video | kakao | app | 추천 액션 |')
  push('|---|---|---|---|---|---|---|---|---|---|---|---|')
  report.top20.forEach((r, i) => {
    const src = r.program_name ?? r.creator_name ?? r.source_title ?? '-'
    push(`| ${i + 1} | ${r.score} | ${r.slug} | ${r.name} | ${r.area} | ${r.category} | ${src} | ${r.broadcast_date ?? '-'} | ${r.video_url_status} | ${r.kakao_map_url_status} | ${r.appearance_count} | ${r.recommended_action} |`)
  })
  push('')
  push('### TOP 20 누락 사유 상세')
  report.top20.forEach((r, i) => {
    push(`- ${i + 1}. **${r.slug}** (${r.name}) [score ${r.score}] — ${r.missing_reasons.join(', ')}`)
  })
  push('')
  push('## 이유별 집계 (우선순위 후보 기준)')
  push('### area별')
  for (const a of report.area_missing) push(`- ${a.value}: ${a.count}`)
  push('### category별')
  for (const c of report.category_missing) push(`- ${c.value}: ${c.count}`)
  push('')
  push(`## "기타" area 공개 식당 (${report.etc_area_list.length})`)
  if (report.etc_area_list.length === 0) push('- 없음')
  else for (const r of report.etc_area_list) push(`- ${r.slug} (${r.name}) / ${r.category} / ${r.address}`)
  push('')
  push(`## appearance 보강 대상 TOP ${report.appearance_missing_top.length}`)
  push('| # | slug | name | app수 | 누락항목 | 누락수 |')
  push('|---|---|---|---|---|---|')
  report.appearance_missing_top.forEach((r, i) => {
    push(`| ${i + 1} | ${r.slug} | ${r.name} | ${r.appearance_count} | ${r.missing.join(', ')} | ${r.missing_count} |`)
  })
  push('')
  push('## 다음 작업 추천')
  push('1. TOP 20부터 영상 URL / 카카오맵 URL / 방영일을 우선 보강(화면·SEO·정렬 영향 큼).')
  push('2. 방영일은 restaurants.broadcast_date + 해당 appearance 양쪽을 함께 채워 대표 방송 정렬 정확도 확보.')
  push('3. "기타" area 식당은 실제 지역으로 재분류 가능한지 검토(지역 landing 노출).')
  push('4. 출처명/프로그램·크리에이터 누락 식당은 출처 확인 후 보강(콘텐츠 배지/landing 매핑).')
  push('5. 보강 후 이 스크립트를 재실행해 점수 하락을 추적.')
  return lines.join('\n')
}

main().catch((err) => {
  console.error('FAIL: 예기치 못한 예외 —', err?.message ?? String(err))
  process.exitCode = 2
})
