/**
 * 공개 프로필 신뢰 출처의 원천 경로·확인일 완결성 감사 (read-only).
 *
 * DB SELECT만 수행한다. 수정/공개 전환/배포/외부 URL 요청은 하지 않는다.
 *
 * 실행:
 *   npm run evidence:audit
 *   npm run evidence:audit:no-report
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const noReport = process.argv.includes('--no-report')

function loadEnv() {
  const envPath = join(here, '..', '.env.local')
  const raw = readFileSync(envPath, 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    const pivot = line.indexOf('=')
    if (pivot < 1 || line.trimStart().startsWith('#')) continue
    const key = line.slice(0, pivot).trim()
    const value = line.slice(pivot + 1).trim().replace(/^['"]|['"]$/g, '')
    if (!process.env[key]) process.env[key] = value
  }
}

function isHttpUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function csvCell(value) {
  const text = String(value ?? '')
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function asCount(rows, predicate) {
  return rows.reduce((count, row) => count + (predicate(row) ? 1 : 0), 0)
}

async function main() {
  loadEnv()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase 환경변수가 없습니다.')

  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data: restaurants, error: restaurantError } = await supabase
    .from('restaurants')
    .select('id,slug,name')
    .eq('is_published', true)
    .order('slug')
  if (restaurantError) throw new Error(`restaurants 조회 실패: ${restaurantError.message}`)

  const ids = (restaurants ?? []).map((restaurant) => restaurant.id)
  const { data: sources, error: sourceError } = await supabase
    .from('restaurant_trust_sources')
    .select('restaurant_id,source_kind,source_name,source_title,source_url,verified_at,is_public')
    .in('restaurant_id', ids)
    .eq('is_public', true)
    .order('restaurant_id')
  if (sourceError) throw new Error(`trust sources 조회 실패: ${sourceError.message}`)

  const byRestaurant = new Map((restaurants ?? []).map((restaurant) => [restaurant.id, restaurant]))
  const rows = (sources ?? []).map((source) => {
    const restaurant = byRestaurant.get(source.restaurant_id)
    const hasUrl = Boolean(source.source_url && isHttpUrl(source.source_url))
    const hasVerifiedAt = Boolean(source.verified_at && /^\d{4}-\d{2}-\d{2}$/.test(source.verified_at))
    return {
      slug: restaurant?.slug ?? '(missing restaurant)',
      name: restaurant?.name ?? '(missing restaurant)',
      source_kind: source.source_kind,
      source_name: source.source_name,
      has_url: hasUrl ? 'yes' : 'no',
      has_verified_at: hasVerifiedAt ? 'yes' : 'no',
      status: hasUrl && hasVerifiedAt ? 'READY' : hasUrl ? 'VERIFIED_AT_MISSING' : hasVerifiedAt && (source.source_kind === 'tv' || source.source_kind === 'youtube') && Boolean(source.source_title?.trim()) ? 'LINK_UNAVAILABLE' : hasVerifiedAt ? 'SOURCE_URL_MISSING' : 'EVIDENCE_INCOMPLETE',
    }
  })

  const profileIds = new Set(rows.map((row) => row.slug))
  const ready = asCount(rows, (row) => row.status === 'READY')
  const missingUrl = asCount(rows, (row) => row.has_url === 'no')
  const missingVerifiedAt = asCount(rows, (row) => row.has_verified_at === 'no')
  const linkUnavailable = asCount(rows, (row) => row.status === 'LINK_UNAVAILABLE')
  const incomplete = rows.filter((row) => row.status === 'VERIFIED_AT_MISSING' || row.status === 'SOURCE_URL_MISSING' || row.status === 'EVIDENCE_INCOMPLETE')
  const summary = {
    public_profiles: restaurants?.length ?? 0,
    profiles_with_public_source: profileIds.size,
    public_source_rows: rows.length,
    ready_source_rows: ready,
    source_url_missing: missingUrl,
    public_link_unavailable_rows: linkUnavailable,
    verified_at_missing: missingVerifiedAt,
    evidence_incomplete_rows: incomplete.length,
  }

  console.log('=== 나온집 프로필 증거 감사 ===')
  for (const [key, value] of Object.entries(summary)) console.log(`${key}=${value}`)
  if (noReport) return

  const outDir = join(here, '..', 'reports', 'profile-evidence')
  mkdirSync(outDir, { recursive: true })
  const headers = ['slug', 'name', 'source_kind', 'source_name', 'has_url', 'has_verified_at', 'status']
  writeFileSync(
    join(outDir, 'profile-evidence-audit-latest.csv'),
    [headers.join(','), ...rows.map((row) => headers.map((key) => csvCell(row[key])).join(','))].join('\n') + '\n',
  )
  const backlog = incomplete.map((row) => `- ${row.slug} (${row.name}) · ${row.source_kind}/${row.source_name} · ${row.status}`)
  writeFileSync(
    join(outDir, 'profile-evidence-audit-latest.md'),
    [
      '# 나온집 프로필 증거 감사 — latest',
      '',
      '- 성격: DB SELECT만 수행한 read-only 감사. 외부 URL 요청·DB 수정·공개 전환·배포는 하지 않음.',
      `- 공개 프로필: ${summary.public_profiles}`,
      `- 공개 출처 행: ${summary.public_source_rows}`,
      `- URL과 확인일 완결: ${summary.ready_source_rows}`,
      `- 원천 URL 미등록: ${summary.source_url_missing}`,
      `- 방송·유튜브 공개 링크 미등록(회차/확인일 보존): ${summary.public_link_unavailable_rows}`,
      `- 확인일 보완 필요: ${summary.verified_at_missing}`,
      '',
      '## 보완 큐',
      ...(backlog.length > 0 ? backlog : ['- 없음']),
      '',
      '## 운영 규칙',
      '- 공개 출처에는 확인일이 필요하다. 방송·유튜브는 회차/영상 제목과 확인일이 있으면 URL 없이도 링크 미등록 상태로 공개할 수 있다.',
      '- 가이드·운영자 확인 등은 URL·확인일이 모두 없으면 공개하지 않는다. 미확인 출처를 사실로 추정하지 않는다.',
      '- READY는 URL/날짜 필드 완결, LINK_UNAVAILABLE은 공개되지만 원천 링크가 보존되지 않은 상태이며, 어느 쪽도 검색 순위·AI 인용·방문·매출 성과가 아니다.',
      '',
    ].join('\n'),
  )
}

main().catch((error) => {
  console.error(`FAIL: ${error instanceof Error ? error.message : String(error)}`)
  process.exitCode = 2
})
