/**
 * P1 방송/유튜브 trust_source 백필 (preflight 기반).
 *
 * 대상: 공개 restaurants 중 trust 0개 + preflight 분류 P1 (47곳).
 *   - 그 중 status=READY (program_name||creator_name 확정) 만 INSERT.
 *   - status=REVIEW (program/creator 미상, source_title만)는 추정 금지 → EXCLUDED_REVIEW (skip).
 *   - P2/P3, trust 보유 식당은 애초에 대상 아님.
 * 안전: restaurant_trust_sources 에만 INSERT. restaurants 무수정. source_url 없으면 null.
 *   비밀키 미출력. idempotent: (restaurant_id, source_name) 이미 있으면 skip.
 * 실행:
 *   node scripts/backfill-p1-trust-sources-2026-06.mjs          # dry-run(+report 생성)
 *   node scripts/backfill-p1-trust-sources-2026-06.mjs --apply  # 실제 INSERT
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
// preflight 와 동일한 P1 판정 키워드(반드시 일치 유지)
const P1_KEYWORDS = ['생활의 달인', '은둔식달', '2TV', '생생정보', '성시경', '먹을텐데', '풍자', '또간집', '미친맛집', '쯔양', '히밥', '백반기행', '수요미식회', '맛있는 녀석들', '6시 내고향', '한국인의 밥상', '백종원', '흑백요리사']
const csvCell = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s }

function classify(r, hasApp) {
  const name = r.program_name || r.creator_name || ''
  const srcTitle = r.source_title || ''
  let status
  if (!hasApp) status = 'EXCLUDED'
  else if (!name && !srcTitle) status = 'BLOCKED'
  else if (name) status = 'READY'
  else status = 'REVIEW'
  const hay = `${name} ${r.episode_title || ''} ${srcTitle}`.toLowerCase()
  const isP1 = P1_KEYWORDS.some((k) => hay.includes(k.toLowerCase()))
  let priority
  if (status === 'EXCLUDED' || status === 'BLOCKED') priority = 'P3'
  else if (isP1) priority = 'P1'
  else if (status === 'READY') priority = 'P2'
  else priority = 'P3'
  return { status, priority }
}

async function main() {
  loadEnv()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) { console.error('FAIL: Supabase env 누락'); process.exitCode = 2; return }
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

  const { data: pub, error: e1 } = await sb.from('restaurants')
    .select('id,slug,name,area,category,source_type,source_title,program_name,creator_name,episode_title,broadcast_date,video_url')
    .eq('is_published', true).order('slug')
  if (e1) { console.error('FAIL restaurants', e1.message); process.exitCode = 2; return }
  const { data: ts, error: e2 } = await sb.from('restaurant_trust_sources').select('restaurant_id,source_name,is_public')
  if (e2) { console.error('FAIL trust_sources', e2.message); process.exitCode = 2; return }
  const { data: apps, error: e3 } = await sb.from('restaurant_appearances').select('restaurant_id')
  if (e3) { console.error('FAIL appearances', e3.message); process.exitCode = 2; return }

  const trustCount = new Map()
  for (const t of ts ?? []) if (t.is_public) trustCount.set(t.restaurant_id, (trustCount.get(t.restaurant_id) ?? 0) + 1)
  const hasApp = new Set((apps ?? []).map((a) => a.restaurant_id))
  const existKey = new Set((ts ?? []).map((t) => `${t.restaurant_id}|${t.source_name}`))

  const targets0 = (pub ?? []).filter((r) => (trustCount.get(r.id) ?? 0) === 0)
  const p1 = targets0.filter((r) => classify(r, hasApp.has(r.id)).priority === 'P1')

  const plan = []
  for (const r of p1) {
    const c = classify(r, hasApp.has(r.id))
    const source_name = r.program_name || r.creator_name || ''
    const title = r.episode_title || r.source_title || ''
    const surl = r.video_url || null
    const kind = r.source_type
    const label = kind === 'tv' ? '방송 출연' : kind === 'youtube' ? 'YouTube 출연' : '출연'
    let status
    if (c.status !== 'READY') status = 'EXCLUDED_REVIEW'
    else if (!source_name) status = 'EXCLUDED_NO_NAME'
    else if (existKey.has(`${r.id}|${source_name}`)) status = 'skip_exists'
    else status = 'to_insert'
    plan.push({ restaurant_id: r.id, slug: r.slug, name: r.name, area: r.area, category: r.category, kind, source_name, title, source_url: surl, label, status })
  }

  const toInsert = plan.filter((p) => p.status === 'to_insert')
  const exReview = plan.filter((p) => p.status === 'EXCLUDED_REVIEW')
  const skip = plan.filter((p) => p.status === 'skip_exists')
  const exNoName = plan.filter((p) => p.status === 'EXCLUDED_NO_NAME')
  const tvN = toInsert.filter((p) => p.kind === 'tv').length
  const ytN = toInsert.filter((p) => p.kind === 'youtube').length
  const urlNull = toInsert.filter((p) => !p.source_url).length

  console.log(`=== P1 trust_source 백필 (${APPLY ? 'APPLY' : 'DRY-RUN'}) ===`)
  console.log(`P1 대상 ${p1.length} / INSERT 예정 ${toInsert.length} / 제외(REVIEW) ${exReview.length} / 제외(no_name) ${exNoName.length} / 중복skip ${skip.length}`)
  console.log(`INSERT 내역: tv ${tvN} / youtube ${ytN} / url null ${urlNull}`)

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
    // dry-run: report 생성
    const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'reports', 'trust-source-backfill')
    mkdirSync(outDir, { recursive: true })
    const cols = ['slug', 'name', 'area', 'category', 'kind', 'source_name', 'title', 'source_url', 'label', 'status']
    const csv = [cols.join(',')].concat(plan.map((p) => cols.map((c) => csvCell(p[c] ?? '')).join(','))).join('\n') + '\n'
    writeFileSync(join(outDir, 'p1-trust-source-backfill-dry-run-2026-06.csv'), csv)
    const md = [
      '# P1 trust_source 백필 — DRY-RUN (2026-06)', '',
      `- 스크립트: scripts/backfill-p1-trust-sources-2026-06.mjs (dry-run, DB 수정 0)`,
      `- P1 대상 ${p1.length} / INSERT 예정 ${toInsert.length} / 제외(REVIEW) ${exReview.length} / 제외(no_name) ${exNoName.length} / 중복skip ${skip.length}`,
      `- INSERT 내역: tv ${tvN} / youtube ${ytN} / url null ${urlNull}`,
      `- verified_at=${VERIFIED_AT}, label: tv='방송 출연' / youtube='YouTube 출연'`, '',
      '## INSERT 예정', '',
      ...toInsert.map((p) => `- \`${p.slug}\` ${p.name} (${p.area}/${p.category}) | ${p.kind} | ${p.source_name}${p.title ? ' / ' + p.title : ''}${p.source_url ? ' / url✓' : ' / url=null'}`),
      '', '## 제외(REVIEW — program/creator 미상, 추정 금지)', '',
      ...exReview.map((p) => `- \`${p.slug}\` ${p.name} (${p.area}/${p.category}) | source_title=${p.title}`),
      '',
    ].join('\n')
    writeFileSync(join(outDir, 'p1-trust-source-backfill-dry-run-2026-06.md'), md)
    console.log(`\nreports/trust-source-backfill/p1-trust-source-backfill-dry-run-2026-06.{csv,md} 생성`)
  }
}
main().catch((e) => { console.error('FAIL 예외', e?.message ?? String(e)); process.exitCode = 2 })
