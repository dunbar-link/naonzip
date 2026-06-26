/**
 * 잔여 REVIEW trust_source 최종 백필 (slug prefix + source_title 이중 근거 확정).
 *
 * 배경: P1/P2 백필 후 trust 0개로 남은 7곳은 program_name/creator_name 컬럼이 비어
 *   자동 분류가 REVIEW 였다. 단 slug prefix(tzuyang-/sungsik-)와 source_title 이 동일 출처를
 *   가리키므로, "이중 근거 일치" 일 때만 source_name 을 확정해 백필한다(추정 금지).
 *
 * 확정 규칙(둘 다 충족해야 to_insert):
 *   - slug 가 tzuyang- → 기대 source_name='쯔양' / sungsik- → '성시경'
 *   - source_title 에 그 기대값 문자열이 실제 포함
 *   불일치/예상밖 prefix → EXCLUDED (insert 안 함). 하나라도 있으면 apply 전 STOP.
 *
 * 필드: source_kind='youtube'(통일), source_name=확정값, source_title=episode||source_title,
 *   source_url=video_url||null, trust_label='YouTube 출연'. restaurants 무수정.
 * idempotent: (restaurant_id, source_name) 이미 있으면 skip.
 * 실행:
 *   node scripts/backfill-review-trust-sources-2026-06.mjs          # dry-run(+report)
 *   node scripts/backfill-review-trust-sources-2026-06.mjs --apply  # 실제 INSERT
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

function loadEnv() {
  const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/); if (!m) continue
    let v = m[2]; if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
    if (!process.env[m[1]]) process.env[m[1]] = v
  }
}
const APPLY = process.argv.slice(2).includes('--apply')
const VERIFIED_AT = '2026-06-26'
const EXPECT = [{ prefix: 'tzuyang-', name: '쯔양' }, { prefix: 'sungsik-', name: '성시경' }]
const csvCell = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s }

async function main() {
  loadEnv()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) { console.error('FAIL: Supabase env 누락'); process.exitCode = 2; return }
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

  const { data: pub, error: e1 } = await sb.from('restaurants')
    .select('id,slug,name,area,category,source_type,source_title,program_name,creator_name,episode_title,video_url')
    .eq('is_published', true).order('slug')
  if (e1) { console.error('FAIL restaurants', e1.message); process.exitCode = 2; return }
  const { data: ts, error: e2 } = await sb.from('restaurant_trust_sources').select('restaurant_id,source_name,is_public')
  if (e2) { console.error('FAIL trust_sources', e2.message); process.exitCode = 2; return }

  const trustCount = new Map()
  for (const t of ts ?? []) if (t.is_public) trustCount.set(t.restaurant_id, (trustCount.get(t.restaurant_id) ?? 0) + 1)
  const existKey = new Set((ts ?? []).map((t) => `${t.restaurant_id}|${t.source_name}`))
  const targets = (pub ?? []).filter((r) => (trustCount.get(r.id) ?? 0) === 0)

  const plan = []
  for (const r of targets) {
    const srcTitle = r.source_title || ''
    const exp = EXPECT.find((e) => r.slug.startsWith(e.prefix))
    const titleHit = exp ? srcTitle.includes(exp.name) : false
    const source_name = exp ? exp.name : ''
    const title = r.episode_title || srcTitle
    const surl = r.video_url || null
    let status, basis
    if (!exp) { status = 'STOP_unexpected_prefix'; basis = `예상밖 slug prefix` }
    else if (!titleHit) { status = 'EXCLUDED_mismatch'; basis = `slug '${exp.prefix}'(${exp.name}) ↔ source_title 불일치` }
    else if (!title) { status = 'EXCLUDED_no_title'; basis = 'title 없음' }
    else if (existKey.has(`${r.id}|${source_name}`)) { status = 'skip_exists'; basis = `slug '${exp.prefix}' + title '${exp.name}' 일치(기존)` }
    else { status = 'to_insert'; basis = `slug '${exp.prefix}' + source_title '${exp.name}' 일치` }
    plan.push({ restaurant_id: r.id, slug: r.slug, name: r.name, area: r.area, category: r.category, kind: 'youtube', source_name, title, source_url: surl, label: 'YouTube 출연', status, basis })
  }

  const toInsert = plan.filter((p) => p.status === 'to_insert')
  const excluded = plan.filter((p) => p.status.startsWith('EXCLUDED') || p.status.startsWith('STOP'))
  const skip = plan.filter((p) => p.status === 'skip_exists')
  const urlNull = toInsert.filter((p) => !p.source_url).length
  const stop = plan.some((p) => p.status.startsWith('STOP') || p.status === 'EXCLUDED_mismatch')

  console.log(`=== 잔여 REVIEW trust_source 백필 (${APPLY ? 'APPLY' : 'DRY-RUN'}) ===`)
  console.log(`trust 0개 대상 ${targets.length} / INSERT 예정 ${toInsert.length} / 제외 ${excluded.length} / 중복skip ${skip.length} / url null ${urlNull}`)
  for (const p of plan) console.log(`  [${p.status}] ${p.slug} (${p.name}) → ${p.source_name || '-'} | ${p.basis}`)

  if (stop) { console.error('\nSTOP: 불일치/예상밖 prefix row 존재 → apply 차단(추정 금지).'); if (APPLY) { process.exitCode = 2; return } }

  let inserted = 0, failed = 0
  if (APPLY) {
    for (const p of toInsert) {
      const { error } = await sb.from('restaurant_trust_sources').insert({
        restaurant_id: p.restaurant_id, source_kind: p.kind, source_name: p.source_name,
        source_url: p.source_url, source_title: p.title, trust_label: p.label, verified_at: VERIFIED_AT, is_public: true,
      }, { defaultToNull: false })
      if (error) { console.error(`  FAIL ${p.slug}: ${error.code} ${error.message}`); failed += 1; continue }
      inserted += 1
    }
    console.log(`\nINSERT 완료: ${inserted} / 실패 ${failed}`)
    const { count } = await sb.from('restaurant_trust_sources').select('*', { count: 'exact', head: true })
    console.log(`trust_sources 총 행: ${count ?? '?'}`)
  } else {
    const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'reports', 'trust-source-backfill')
    mkdirSync(outDir, { recursive: true })
    const cols = ['slug', 'name', 'area', 'category', 'kind', 'source_name', 'title', 'source_url', 'label', 'status', 'basis']
    const csv = [cols.join(',')].concat(plan.map((p) => cols.map((c) => csvCell(p[c] ?? '')).join(','))).join('\n') + '\n'
    writeFileSync(join(outDir, 'review7-trust-source-backfill-dry-run-2026-06.csv'), csv)
    const md = [
      '# 잔여 REVIEW trust_source 백필 — DRY-RUN (2026-06)', '',
      `- 스크립트: scripts/backfill-review-trust-sources-2026-06.mjs (dry-run, DB 수정 0)`,
      `- trust 0개 대상 ${targets.length} / INSERT 예정 ${toInsert.length} / 제외 ${excluded.length} / 중복skip ${skip.length} / url null ${urlNull}`,
      `- 확정 규칙: slug prefix(tzuyang-→쯔양 / sungsik-→성시경) + source_title 키워드 이중 일치만 to_insert`,
      `- source_kind=youtube, label='YouTube 출연', verified_at=${VERIFIED_AT}`, '',
      '## 확정 근거표', '',
      '| slug | 식당 | source_name | source_title 근거 | url | status |',
      '|---|---|---|---|---|---|',
      ...plan.map((p) => `| ${p.slug} | ${p.name} | ${p.source_name || '-'} | ${p.basis} | ${p.source_url ? '✓' : 'null'} | ${p.status} |`),
      '',
    ].join('\n')
    writeFileSync(join(outDir, 'review7-trust-source-backfill-dry-run-2026-06.md'), md)
    console.log(`\nreports/trust-source-backfill/review7-trust-source-backfill-dry-run-2026-06.{csv,md} 생성`)
  }
}
main().catch((e) => { console.error('FAIL 예외', e?.message ?? String(e)); process.exitCode = 2 })
