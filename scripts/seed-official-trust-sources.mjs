/**
 * 공식 가이드 출처 trust_sources 연결 (idempotent):
 *   - 2026 부산의 맛: 기존 식당 10곳
 *   - 미쉐린 가이드 부산 2026 빕 구르망: 뫼밀집 1곳
 *
 * 원칙:
 *   - restaurants row 는 읽기만(수정 없음). source_type/source_title 무변경.
 *   - restaurant_trust_sources 에만 INSERT. source_kind='guide'(기존 허용값).
 *   - idempotent: (restaurant_id, source_name) 동일 row 가 이미 있으면 skip(중복 INSERT 안 함).
 *   - slug 로 restaurant 매칭. 못 찾으면 그 식당은 write 안 하고 REVIEW.
 *   - 비밀키 미출력. schema/CHECK ALTER 없음. appearances 생성 없음.
 *
 * 실행:
 *   node scripts/seed-official-trust-sources.mjs            # dry-run(매칭/계획만)
 *   node scripts/seed-official-trust-sources.mjs --apply    # 실제 INSERT
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

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

const APPLY = process.argv.slice(2).includes('--apply')
const VERIFIED_AT = '2026-06-16'
const MICHELIN_URL = 'https://guide.michelin.com/kr/ko/article/michelin-guide-ceremony/korea-bib-gourmand-2026'
const BUSAN_URL = 'https://www.visitbusan.net/board/download.do?boardId=BBS_0000007&dataSid=5445&fileSid=10322'

// 연결 대상 11곳. slug 는 직전 감사(restaurant-source-matches)에서 전화 매칭으로 확정.
const TARGETS = [
  // 2026 부산의 맛 (10) — source_kind=guide, trust_label 없음(146곳 수록, 등급 개념 없음)
  { slug: 'baekban-yeonje-godeungeo-datchi', source_name: '2026 부산의 맛', source_url: BUSAN_URL, trust_label: null },
  { slug: 'saengdal-yeonje-gukje-milmyeon', source_name: '2026 부산의 맛', source_url: BUSAN_URL, trust_label: null },
  { slug: 'mulkkong-sikdang', source_name: '2026 부산의 맛', source_url: BUSAN_URL, trust_label: null },
  { slug: 'saengdal-gwangalli-baegil-pyeongnaeng', source_name: '2026 부산의 맛', source_url: BUSAN_URL, trust_label: null },
  { slug: 'samdaecheonwang-shinbalwon', source_name: '2026 부산의 맛', source_url: BUSAN_URL, trust_label: null },
  { slug: 'saengdal-ssangdungyi-doejigukbap', source_name: '2026 부산의 맛', source_url: BUSAN_URL, trust_label: null },
  { slug: 'samdae-seomyeon-wonjo-halmae-nakji', source_name: '2026 부산의 맛', source_url: BUSAN_URL, trust_label: null },
  { slug: 'bapsang-gijang-haebyeon-jipbul-gomjangeo', source_name: '2026 부산의 맛', source_url: BUSAN_URL, trust_label: null },
  { slug: 'kimyusun-daegu-bbol-jjim', source_name: '2026 부산의 맛', source_url: BUSAN_URL, trust_label: null },
  { slug: 'tzuyang-nampo-ijaemo-pizza', source_name: '2026 부산의 맛', source_url: BUSAN_URL, trust_label: null },
  // 미쉐린 가이드 부산 2026 빕 구르망 (1)
  { slug: 'michelin-haeundae-moemiljip', source_name: '미쉐린 가이드 부산 2026', source_url: MICHELIN_URL, trust_label: '빕 구르망' },
]

async function main() {
  loadEnv()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) { console.error('FAIL: Supabase env 누락'); process.exitCode = 2; return }
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

  // restaurants(slug→id) 일괄 조회
  const slugs = TARGETS.map((t) => t.slug)
  const { data: rows, error: rErr } = await sb.from('restaurants').select('id,slug,name,source_type').in('slug', slugs)
  if (rErr) { console.error('FAIL: restaurants 조회', rErr.code, rErr.message); process.exitCode = 2; return }
  const bySlug = new Map(rows.map((r) => [r.slug, r]))

  // 기존 trust_sources 일괄 조회(idempotent 판정용)
  const ids = rows.map((r) => r.id)
  const { data: existing, error: eErr } = await sb.from('restaurant_trust_sources').select('restaurant_id,source_name')
  if (eErr) { console.error('FAIL: trust_sources 조회', eErr.code, eErr.message, '(테이블 미적용일 수 있음)'); process.exitCode = 2; return }
  const existKey = new Set((existing ?? []).map((e) => `${e.restaurant_id}|${e.source_name}`))

  const plan = []
  for (const t of TARGETS) {
    const r = bySlug.get(t.slug)
    if (!r) { plan.push({ ...t, status: 'REVIEW_no_match', restaurant_id: null, name: null, source_type: null }); continue }
    const dup = existKey.has(`${r.id}|${t.source_name}`)
    plan.push({ ...t, status: dup ? 'skip_exists' : 'to_insert', restaurant_id: r.id, name: r.name, source_type: r.source_type })
  }

  const toInsert = plan.filter((p) => p.status === 'to_insert')
  const review = plan.filter((p) => p.status === 'REVIEW_no_match')
  const skip = plan.filter((p) => p.status === 'skip_exists')

  console.log(`=== 공식 출처 trust_sources 연결 (${APPLY ? 'APPLY' : 'DRY-RUN'}) ===`)
  console.log(`대상 ${TARGETS.length} / 매칭 ${plan.length - review.length} / REVIEW(미매칭) ${review.length} / 기존중복 ${skip.length} / INSERT 예정 ${toInsert.length}`)
  for (const p of plan) {
    console.log(`  [${p.status}] ${p.name ?? p.slug} (${p.source_type ?? '-'}) ← ${p.source_name}${p.trust_label ? ' / ' + p.trust_label : ''}`)
  }

  let inserted = 0
  if (APPLY) {
    for (const p of toInsert) {
      const { error } = await sb.from('restaurant_trust_sources').insert({
        restaurant_id: p.restaurant_id,
        source_kind: 'guide',
        source_name: p.source_name,
        source_url: p.source_url,
        trust_label: p.trust_label,
        verified_at: VERIFIED_AT,
        is_public: true,
      }, { defaultToNull: false })
      if (error) { console.error(`  FAIL INSERT ${p.slug}: ${error.code} ${error.message}`); continue }
      inserted += 1
    }
    console.log(`\nINSERT 완료: ${inserted}`)
    const { count } = await sb.from('restaurant_trust_sources').select('*', { count: 'exact', head: true })
    console.log(`trust_sources 총 행: ${count ?? '?'}`)
  }

  // 결과 리포트(JSON) 기록
  const here = dirname(fileURLToPath(import.meta.url))
  const dir = join(here, '..', 'reports', 'official-guide-audit')
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'trust-source-seed-2026-06-16.json'), JSON.stringify({
    generated_at: VERIFIED_AT, mode: APPLY ? 'APPLY' : 'DRY-RUN',
    target: TARGETS.length, to_insert: toInsert.length, skip_exists: skip.length, review_no_match: review.length, inserted: APPLY ? inserted : 0,
    plan: plan.map((p) => ({ slug: p.slug, name: p.name, source_type: p.source_type, source_name: p.source_name, trust_label: p.trust_label, status: p.status })),
  }, null, 2), 'utf8')
}

main().catch((e) => { console.error('FAIL: 예외 —', e?.message ?? String(e)); process.exitCode = 2 })
