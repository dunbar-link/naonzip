/**
 * 공개 식당 trust_source 0개 백필 preflight (READ-ONLY).
 *
 * - DB: restaurants(is_published=true) + restaurant_trust_sources(is_public) + restaurant_appearances 를 SELECT 만.
 * - trust 0개 공개 식당을 추출하고, restaurants 비정규화 출처 필드로 백필 가능성을 분류한다.
 * - 데이터 수정/INSERT 0. CSV/MD report 만 생성.
 *
 * 분류:
 *   READY    : kind(source_type) + source_name(program_name||creator_name) 명확 → trust 확정 가능
 *   REVIEW   : source_title 만 있고 program/creator 미상 → source_name 보강 필요
 *   BLOCKED  : 출처 힌트 전무(거의 없음)
 *   EXCLUDED : appearance 없음(LEGACY_MANUAL) 또는 trust 불필요 케이스
 * 우선순위:
 *   P1 : 유명 방송/유튜버(신뢰칩 가치 높음)
 *   P2 : 출처 있으나 url/회차 보강 필요
 *   P3 : 낮은 ROI
 *
 * 실행: node scripts/preflight-trust-source-backfill.mjs
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

// 신뢰칩 가치 높은 출처(P1) — 유명 방송/유튜버
const P1_KEYWORDS = ['생활의 달인', '은둔식달', '2TV', '생생정보', '성시경', '먹을텐데', '풍자', '또간집', '미친맛집', '쯔양', '히밥', '백반기행', '수요미식회', '맛있는 녀석들', '6시 내고향', '한국인의 밥상', '백종원', '흑백요리사']
const csvCell = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s }

function classify(r, hasApp) {
  const kind = r.source_type
  const name = r.program_name || r.creator_name || ''
  const title = r.episode_title || ''
  const url = r.video_url || ''
  const date = r.broadcast_date || ''
  const srcTitle = r.source_title || ''

  let status, notes = []
  if (!hasApp) { status = 'EXCLUDED'; notes.push('appearance 없음(LEGACY_MANUAL)') }
  else if (!name && !srcTitle) { status = 'BLOCKED'; notes.push('출처 힌트 전무') }
  else if (name) { status = 'READY' }
  else { status = 'REVIEW'; notes.push('program/creator 미상, source_title만') }

  // 백필용 trust 값(확정 가능분)
  const trust_kind = kind
  const trust_source_name = name || srcTitle
  const trust_title = title
  const trust_url = url
  const trust_date = date
  if (!url) notes.push('url 없음')
  if (!date && kind === 'tv') notes.push('broadcast_date 없음')

  // 우선순위
  const hay = `${name} ${title} ${srcTitle}`.toLowerCase()
  const isP1 = P1_KEYWORDS.some((k) => hay.includes(k.toLowerCase()))
  let priority
  if (status === 'EXCLUDED' || status === 'BLOCKED') priority = 'P3'
  else if (isP1) priority = 'P1'
  else if (status === 'READY') priority = 'P2'
  else priority = 'P3'

  const backfill_candidate = (status === 'READY' && (priority === 'P1' || priority === 'P2')) ? 'YES' : 'no'
  return { kind, trust_kind, trust_source_name, trust_title, trust_url, trust_date, status, priority, backfill_candidate, notes: notes.join(' / ') }
}

async function main() {
  loadEnv()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) { console.error('FAIL: Supabase env 누락'); process.exitCode = 2; return }
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

  const { data: pub, error: e1 } = await sb.from('restaurants')
    .select('id,slug,name,area,category,source_type,source_title,program_name,creator_name,episode_title,broadcast_date,video_url,description,kakao_map_url')
    .eq('is_published', true).order('slug')
  if (e1) { console.error('FAIL restaurants', e1.message); process.exitCode = 2; return }
  const { data: ts, error: e2 } = await sb.from('restaurant_trust_sources').select('restaurant_id,is_public')
  if (e2) { console.error('FAIL trust_sources', e2.message); process.exitCode = 2; return }
  const { data: apps, error: e3 } = await sb.from('restaurant_appearances').select('restaurant_id')
  if (e3) { console.error('FAIL appearances', e3.message); process.exitCode = 2; return }

  const trustCount = new Map()
  for (const t of ts ?? []) if (t.is_public) trustCount.set(t.restaurant_id, (trustCount.get(t.restaurant_id) ?? 0) + 1)
  const hasApp = new Set((apps ?? []).map((a) => a.restaurant_id))

  const targets = (pub ?? []).filter((r) => (trustCount.get(r.id) ?? 0) === 0)
  const rows = targets.map((r) => {
    const c = classify(r, hasApp.has(r.id))
    return {
      slug: r.slug, name: r.name, area: r.area, category: r.category,
      source_type: r.source_type, source_title: r.source_title, program_name: r.program_name || '',
      creator_name: r.creator_name || '', episode_title: r.episode_title || '', broadcast_date: r.broadcast_date || '',
      video_url: r.video_url || '', has_appearance: hasApp.has(r.id) ? 'yes' : 'no',
      place_id: (String(r.kakao_map_url ?? '').match(/place\.map\.kakao\.com\/(\d+)/) || [])[1] || '',
      ...c,
    }
  })

  // 집계
  const tally = (k) => { const m = {}; for (const r of rows) { const v = r[k] || '(none)'; m[v] = (m[v] ?? 0) + 1 } return m }
  const statusT = tally('status'), priT = tally('priority'), typeT = tally('source_type')
  const candidates = rows.filter((r) => r.backfill_candidate === 'YES')
  const p1 = rows.filter((r) => r.priority === 'P1')

  console.log(`=== trust_source 0개 백필 preflight (READ-ONLY) ===`)
  console.log(`공개 ${pub.length} / trust 0개 대상 ${targets.length}`)
  console.log(`status: ${JSON.stringify(statusT)}`)
  console.log(`priority: ${JSON.stringify(priT)}`)
  console.log(`source_type: ${JSON.stringify(typeT)}`)
  console.log(`1차 백필 후보(YES): ${candidates.length} / P1: ${p1.length}`)

  // CSV
  const here = dirname(fileURLToPath(import.meta.url))
  const outDir = join(here, '..', 'reports', 'trust-source-backfill')
  mkdirSync(outDir, { recursive: true })
  const cols = ['slug', 'name', 'area', 'category', 'source_type', 'source_title', 'program_name', 'creator_name', 'episode_title', 'broadcast_date', 'video_url', 'has_appearance', 'place_id', 'trust_kind', 'trust_source_name', 'trust_title', 'trust_url', 'trust_date', 'status', 'priority', 'backfill_candidate', 'notes']
  const csv = [cols.join(',')].concat(rows.map((r) => cols.map((c) => csvCell(r[c])).join(','))).join('\n') + '\n'
  writeFileSync(join(outDir, 'trust-source-missing-preflight-2026-06.csv'), csv)

  // MD
  const sec = (title, obj) => `### ${title}\n\n` + Object.entries(obj).map(([k, v]) => `- ${k}: ${v}`).join('\n') + '\n'
  const candList = (arr) => arr.map((r) => `- \`${r.slug}\` ${r.name} (${r.area}/${r.category}) | ${r.priority} | kind=${r.trust_kind} name=${r.trust_source_name}${r.trust_title ? ' / ' + r.trust_title : ''}${r.trust_url ? ' / url✓' : ' / url✗'}`).join('\n')
  const first = candidates.slice().sort((a, b) => (a.priority === b.priority ? 0 : a.priority < b.priority ? -1 : 1)).slice(0, 20)
  const md = [
    '# 공개 식당 trust_source 0개 — 백필 preflight (2026-06, read-only)',
    '',
    `- 생성: scripts/preflight-trust-source-backfill.mjs (DB SELECT 만, 수정 0)`,
    `- 공개 식당 ${pub.length} / trust 0개 대상 **${targets.length}**`,
    `- CSV: reports/trust-source-backfill/trust-source-missing-preflight-2026-06.csv`,
    '',
    sec('상태 분류(status)', statusT),
    sec('우선순위(priority)', priT),
    sec('출처 타입(source_type)', typeT),
    `### 1차 백필 후보 (P1/P2 · READY · 상위 ${first.length})`,
    '',
    candList(first),
    '',
    '### 분류 기준',
    '- READY: source_type(kind) + program_name||creator_name 으로 trust kind/source_name 확정 가능. trust_title=episode_title, url=video_url(있으면).',
    '- REVIEW: program/creator 미상, source_title 만 → source_name 보강 필요.',
    '- BLOCKED: 출처 힌트 전무.',
    '- EXCLUDED: appearance 없음(LEGACY_MANUAL) → 별도 검토.',
    '- P1: 유명 방송/유튜버(생활의달인·2TV·성시경·풍자·또간집·미친맛집·쯔양·히밥·백반기행 등).',
    '',
  ].join('\n')
  writeFileSync(join(outDir, 'trust-source-missing-preflight-2026-06.md'), md)
  console.log(`\nreports/trust-source-backfill/*.{csv,md} 생성 완료. (대상 ${targets.length} = report 행 ${rows.length})`)
}
main().catch((e) => { console.error('FAIL 예외', e?.message ?? String(e)); process.exitCode = 2 })
