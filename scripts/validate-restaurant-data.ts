/**
 * scripts/validate-restaurant-data.ts
 *
 * 운영 DB restaurants 데이터 무결성 검증 (읽기 전용)
 *
 * - DB INSERT/UPDATE/DELETE 절대 안 함.
 * - anon key 만 사용. service_role 사용 안 함.
 * - 환경변수 값은 절대 stdout 으로 출력하지 않음.
 * - RLS 정책상 anon 으로는 is_published=true 행만 조회된다.
 *   (운영 노출 데이터의 무결성을 검증하는 것이 본 스크립트의 목적)
 *
 * 실행:
 *   npx tsx scripts/validate-restaurant-data.ts
 *
 * 종료 코드:
 *   0  PASS — FAIL 0건
 *   1  환경변수 미설정
 *   2  Supabase select 오류
 *   3  FAIL 1건 이상 (WARN 만 있으면 PASS 로 간주)
 *   99 예기치 못한 예외
 */

import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'

// ─────────────────────────────────────────────
// .env.local 자동 로드 (Next 외부 실행 환경 대응)
//   - dotenv 같은 외부 lib 안 씀
//   - 단순 KEY=VALUE 라인만 처리, 주석/공백 무시
//   - 이미 process.env 에 있으면 덮어쓰지 않음
//   - 값은 절대 console 에 출력하지 않음
// ─────────────────────────────────────────────

function loadEnvLocal(): void {
  const envPath = resolve(process.cwd(), '.env.local')
  if (!existsSync(envPath)) return

  const content = readFileSync(envPath, 'utf-8')
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

loadEnvLocal()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    'FAIL: NEXT_PUBLIC_SUPABASE_URL 또는 NEXT_PUBLIC_SUPABASE_ANON_KEY 환경변수 누락',
  )
  console.error('  - .env.local 에 두 변수가 정의되어 있는지 확인 (값은 출력하지 않음)')
  process.exit(1)
}

// ─────────────────────────────────────────────
// 검증 규칙
// ─────────────────────────────────────────────

const REQUIRED_FIELDS = [
  'slug',
  'name',
  'area',
  'address',
  'lat',
  'lng',
  'category',
  'main_menu',
  'source_type',
  'source_title',
  'is_published',
] as const

const ALLOWED_SOURCE_TYPES: ReadonlySet<string> = new Set(['tv', 'youtube', 'sns'])

const BUSAN_LAT_MIN = 35.05
const BUSAN_LAT_MAX = 35.4
const BUSAN_LNG_MIN = 128.85
const BUSAN_LNG_MAX = 129.3

const BROADCAST_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

type RawRow = Record<string, unknown>

type IssueLevel = 'FAIL' | 'WARN'

type Issue = {
  level: IssueLevel
  rowKey: string
  rule: string
  detail: string
}

// ─────────────────────────────────────────────
// 단일 row 검증
// ─────────────────────────────────────────────

function validateRow(row: RawRow): Issue[] {
  const issues: Issue[] = []
  const slug = typeof row.slug === 'string' ? row.slug : null
  const id = typeof row.id === 'string' ? row.id : null
  const rowKey = slug ?? id ?? 'unknown'

  // 필수 필드
  for (const field of REQUIRED_FIELDS) {
    const v = row[field]
    if (v === null || v === undefined || v === '') {
      issues.push({
        level: 'FAIL',
        rowKey,
        rule: 'required',
        detail: `${field} 누락`,
      })
    }
  }

  // source_type 화이트리스트
  if (typeof row.source_type === 'string' && !ALLOWED_SOURCE_TYPES.has(row.source_type)) {
    issues.push({
      level: 'FAIL',
      rowKey,
      rule: 'source_type',
      detail: `허용되지 않은 값: ${row.source_type}`,
    })
  }

  // 좌표 검증 (lat/lng가 0 또는 null이면 FAIL, 부산 범위 밖이면 FAIL)
  const lat = typeof row.lat === 'number' ? row.lat : null
  const lng = typeof row.lng === 'number' ? row.lng : null

  if (lat === null || lat === 0) {
    issues.push({ level: 'FAIL', rowKey, rule: 'lat-missing', detail: `lat 0 또는 null` })
  } else if (lat < BUSAN_LAT_MIN || lat > BUSAN_LAT_MAX) {
    issues.push({
      level: 'FAIL',
      rowKey,
      rule: 'lat-range',
      detail: `lat ${lat} 부산 범위(${BUSAN_LAT_MIN}-${BUSAN_LAT_MAX}) 밖`,
    })
  }

  if (lng === null || lng === 0) {
    issues.push({ level: 'FAIL', rowKey, rule: 'lng-missing', detail: `lng 0 또는 null` })
  } else if (lng < BUSAN_LNG_MIN || lng > BUSAN_LNG_MAX) {
    issues.push({
      level: 'FAIL',
      rowKey,
      rule: 'lng-range',
      detail: `lng ${lng} 부산 범위(${BUSAN_LNG_MIN}-${BUSAN_LNG_MAX}) 밖`,
    })
  }

  // broadcast_date 형식 (있을 때만)
  if (row.broadcast_date != null && row.broadcast_date !== '') {
    const bd = row.broadcast_date
    if (typeof bd !== 'string' || !BROADCAST_DATE_RE.test(bd)) {
      issues.push({
        level: 'FAIL',
        rowKey,
        rule: 'broadcast_date',
        detail: `YYYY-MM-DD 형식 아님: ${String(bd)}`,
      })
    }
  }

  return issues
}

// ─────────────────────────────────────────────
// 전체 row 간 중복 검사
//   - slug 중복   → FAIL (DB UNIQUE 제약상 정상 운영에선 발생 불가, 방어용)
//   - name+address 중복 → WARN (같은 가게 두 번 등록 가능성)
// ─────────────────────────────────────────────

function findDuplicates(rows: RawRow[]): Issue[] {
  const issues: Issue[] = []

  // slug 중복 → FAIL
  const slugCount = new Map<string, number>()
  for (const r of rows) {
    if (typeof r.slug === 'string' && r.slug) {
      slugCount.set(r.slug, (slugCount.get(r.slug) ?? 0) + 1)
    }
  }
  for (const [slug, count] of slugCount) {
    if (count > 1) {
      issues.push({
        level: 'FAIL',
        rowKey: slug,
        rule: 'slug-duplicate',
        detail: `slug 중복 ${count}건`,
      })
    }
  }

  // name+address 중복 → WARN
  const naMap = new Map<string, string[]>()
  for (const r of rows) {
    const name = typeof r.name === 'string' ? r.name.trim() : ''
    const address = typeof r.address === 'string' ? r.address.trim() : ''
    if (!name || !address) continue
    const key = `${name}||${address}`
    const slugs = naMap.get(key) ?? []
    const slug = typeof r.slug === 'string' ? r.slug : 'unknown'
    slugs.push(slug)
    naMap.set(key, slugs)
  }
  for (const [key, slugs] of naMap) {
    if (slugs.length > 1) {
      const [name, address] = key.split('||')
      issues.push({
        level: 'WARN',
        rowKey: slugs.join(','),
        rule: 'name-address-duplicate',
        detail: `name="${name}" / address="${address}" 중복 ${slugs.length}건`,
      })
    }
  }

  return issues
}

// ─────────────────────────────────────────────
// main
// ─────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('나온집 데이터 무결성 검증 시작')
  console.log('  - read-only (DB write 없음)')
  console.log('  - anon key 사용 (service_role 사용 안 함)')
  console.log('')

  const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)

  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .order('slug', { ascending: true })

  if (error) {
    console.error(`FAIL: Supabase select error — ${error.message}`)
    process.exit(2)
  }

  const rows = (data ?? []) as RawRow[]
  console.log(`조회된 row: ${rows.length}건 (RLS: is_published=true 만 노출)`)
  console.log('')

  const allIssues: Issue[] = []
  for (const row of rows) {
    allIssues.push(...validateRow(row))
  }
  allIssues.push(...findDuplicates(rows))

  const failCount = allIssues.filter((i) => i.level === 'FAIL').length
  const warnCount = allIssues.filter((i) => i.level === 'WARN').length

  if (allIssues.length === 0) {
    console.log('PASS: 모든 row 검증 통과')
  } else {
    // FAIL 먼저, WARN 나중
    const failIssues = allIssues.filter((i) => i.level === 'FAIL')
    const warnIssues = allIssues.filter((i) => i.level === 'WARN')

    for (const i of failIssues) {
      console.log(`FAIL  ${i.rowKey}  [${i.rule}]  ${i.detail}`)
    }
    if (failIssues.length > 0 && warnIssues.length > 0) console.log('')
    for (const i of warnIssues) {
      console.log(`WARN  ${i.rowKey}  [${i.rule}]  ${i.detail}`)
    }
    console.log('')
  }

  console.log('─'.repeat(60))
  console.log(`총 ${rows.length} rows / FAIL ${failCount} / WARN ${warnCount}`)

  if (failCount > 0) {
    process.exit(3)
  }
}

main().catch((err: unknown) => {
  console.error('FAIL: 예기치 못한 예외')
  if (err instanceof Error) {
    console.error(`  ${err.message}`)
  } else {
    console.error(`  ${String(err)}`)
  }
  process.exit(99)
})
