/**
 * DATA-G2 일회성: DATA-G1 후보(ready + needs_geocoding 13곳)를 비공개로 자동 등록.
 *
 * source: reports/new-restaurant-candidates-g1.csv (status ready_to_register / needs_geocoding 만)
 * 동작: preflight(중복/필수필드) → restaurants INSERT(is_published=false 고정) + restaurant_appearances INSERT
 *       + candidate_queue best-effort. 기본 dry-run, --apply 시에만 실제 INSERT.
 *
 * 옵션: --apply, --only slugA,slugB, --skip-existing
 *
 * 안전 원칙:
 *   - 비밀키 미출력(존재 여부만).
 *   - is_published 항상 false.
 *   - 대상 13 slug 외 INSERT 금지. 기존 row UPDATE/DELETE 금지.
 *   - restaurants.lat/lng 는 schema 상 NOT NULL → 좌표 없으면 INSERT 불가(좌표 추정 금지).
 *   - 강중복이면 해당 후보 skip.
 *
 * 종료코드: 0 정상, 2 env/설정/조회 오류.
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const CSV_PATH = join(here, '..', 'reports', 'new-restaurant-candidates-g1.csv')

const TARGET_SLUGS = [
  'jeonhyun-gwangalli-biwa-suljan', 'jeonhyun-yeongdo-watda-sikdang', 'jeonhyun-gwangalli-yeonhap-hoejip',
  'jeonhyun-nampo-yeosongje', 'jeonhyun-nampo-mullebanga-jeukseokgui', '2tv-sasang-yeonghui-halmae-jaecheopguk',
  'baekban-seogu-yetnal-guksujip', 'baekban-nampo-subok-centa', 'tzuyang-nampo-ijaemo-pizza',
  'tzuyang-haeundae-chopilsal', 'ansungjae-yeonje-mapobonga',
  'saengdal-gwangalli-baegil-pyeongnaeng', 'saengdal-seomyeon-dammiok',
]
const ALLOWED_STATUS = new Set(['ready_to_register', 'needs_geocoding'])
const VALID_SOURCE_TYPES = new Set(['youtube', 'tv', 'sns'])

const argv = process.argv.slice(2)
const APPLY = argv.includes('--apply')
const SKIP_EXISTING = argv.includes('--skip-existing')
function parseOnly() {
  const eq = argv.find((a) => a.startsWith('--only=')); if (eq) return eq.slice(7)
  const i = argv.indexOf('--only'); if (i !== -1 && argv[i + 1] && !argv[i + 1].startsWith('--')) return argv[i + 1]
  return null
}
const ONLY = parseOnly() ? new Set(parseOnly().split(',').map((s) => s.trim()).filter(Boolean)) : null
const MODE = APPLY ? 'APPLY' : 'DRY-RUN'

function loadEnv() {
  let raw; try { raw = readFileSync(join(here, '..', '.env.local'), 'utf8') } catch { return }
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/); if (!m) continue
    let v = m[2]; if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
    if (!process.env[m[1]]) process.env[m[1]] = v
  }
}
// 간단 CSV 파서(따옴표/콤마/이스케이프 처리)
function parseCsv(text) {
  const rows = []; let row = [], cur = '', inQ = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++ } else inQ = false }
      else cur += c
    } else {
      if (c === '"') inQ = true
      else if (c === ',') { row.push(cur); cur = '' }
      else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = '' }
      else if (c === '\r') { /* skip */ }
      else cur += c
    }
  }
  if (cur !== '' || row.length) { row.push(cur); rows.push(row) }
  return rows
}
const norm = (v) => String(v ?? '').trim().toLowerCase().replace(/\s+/g, '')
const trimOrNull = (v) => { const t = String(v ?? '').trim(); return t === '' ? null : t }
const csvCell = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s }

async function main() {
  console.log('=== DATA-G2 신규 후보 비공개 자동등록 ===')
  console.log(`모드: ${MODE}${APPLY ? '' : ' (검증/계획만 — DB 변경 없음)'}`)
  loadEnv()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY
  console.log(`env: URL ${url ? '✓' : '✗'}, SERVICE_ROLE_KEY ${key ? '✓(값 비표시)' : '✗'}`)
  if (!url || !key) { console.error('FAIL: env 누락'); process.exitCode = 2; return }

  const raw = readFileSync(CSV_PATH, 'utf8')
  const rows = parseCsv(raw)
  const header = rows[0]
  const idx = (name) => header.indexOf(name)
  const recs = rows.slice(1).filter((r) => r.length >= header.length).map((r) => Object.fromEntries(header.map((h, i) => [h, r[i]])))

  // 대상 필터: TARGET_SLUGS ∩ status(ready/needs_geocoding) ∩ ONLY
  let targets = recs.filter((r) => TARGET_SLUGS.includes(r.slug) && ALLOWED_STATUS.has(r.status))
  if (ONLY) targets = targets.filter((r) => ONLY.has(r.slug))
  console.log(`CSV 레코드 ${recs.length}개 중 대상 ${targets.length}개 (제외 status/슬러그 자동 필터)`)

  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

  // 기존 restaurants 전체(중복 검사용)
  const { data: existing, error: exErr } = await sb.from('restaurants').select('slug,name,address,video_url,is_published')
  if (exErr) { console.error('FAIL: restaurants 조회 ' + exErr.message); process.exitCode = 2; return }
  const bySlug = new Set(existing.map((r) => r.slug))
  const nameSet = new Set(existing.map((r) => norm(r.name)))
  const addrSet = new Set(existing.filter((r) => norm(r.address)).map((r) => norm(r.address)))
  const videoSet = new Set(existing.filter((r) => trimOrNull(r.video_url)).map((r) => r.video_url))
  const pubBefore = existing.filter((r) => r.is_published).length
  const totalBefore = existing.length

  const REQUIRED = ['slug', 'name', 'area', 'category', 'address', 'main_menu', 'source_type', 'source_title']
  const results = []
  for (const r of targets) {
    const rec = { status: '', slug: r.slug, name: r.name, restaurant_id: '', is_published: '', area: r.area, category: r.category, address: r.address, lat: r.lat, lng: r.lng, appearance_status: '', duplicate_status: '', field_status: '', note: '' }

    // 중복
    const dups = []
    if (bySlug.has(r.slug)) dups.push('slug')
    if (nameSet.has(norm(r.name))) dups.push('name')
    if (norm(r.address) && addrSet.has(norm(r.address))) dups.push('address')
    if (trimOrNull(r.video_url) && videoSet.has(r.video_url)) dups.push('video_url')
    rec.duplicate_status = dups.length ? dups.join('+') : 'unique'
    if (bySlug.has(r.slug)) { rec.status = 'skipped_existing'; rec.note = '이미 존재하는 slug'; results.push(rec); continue }
    if (dups.length) { rec.status = 'skipped_duplicate'; rec.note = `강중복 의심: ${dups.join(', ')}`; results.push(rec); continue }

    // 필수필드(스키마 NOT NULL 포함). source_type 유효성. price_text/description 은 NOT NULL.
    const missing = REQUIRED.filter((f) => !trimOrNull(r[f]))
    if (!VALID_SOURCE_TYPES.has(String(r.source_type).trim())) missing.push('source_type(유효값아님)')
    // restaurants.price_text NOT NULL → 빈/"확인 필요"면 누락 취급
    if (!trimOrNull(r.price_text) || /확인 필요/.test(r.price_text)) missing.push('price_text(NOT NULL)')
    // restaurants.lat/lng NOT NULL → 좌표 필수(추정 금지)
    const latN = Number(r.lat), lngN = Number(r.lng)
    const coordOk = trimOrNull(r.lat) && trimOrNull(r.lng) && Number.isFinite(latN) && Number.isFinite(lngN) && latN !== 0 && lngN !== 0
    if (!coordOk) missing.push('lat/lng(NOT NULL·좌표없음)')
    rec.field_status = missing.length ? `누락: ${missing.join(', ')}` : 'ok'
    if (missing.length) { rec.status = 'skipped_missing_required'; rec.note = `필수필드 누락 → INSERT 불가. ${missing.join(', ')}`; results.push(rec); continue }

    // 여기까지 통과 = 등록 가능
    if (!APPLY) { rec.status = 'dry_run_planned'; rec.is_published = false; rec.appearance_status = 'planned'; results.push(rec); continue }

    // ── APPLY: restaurants INSERT(is_published=false) ──
    const { data: ins, error: insErr } = await sb.from('restaurants').insert({
      slug: trimOrNull(r.slug), name: trimOrNull(r.name), area: trimOrNull(r.area), address: trimOrNull(r.address),
      lat: latN, lng: lngN, category: trimOrNull(r.category), main_menu: trimOrNull(r.main_menu), price_text: trimOrNull(r.price_text),
      source_type: String(r.source_type).trim(), source_title: trimOrNull(r.source_title),
      creator_name: null, program_name: trimOrNull(r.source_title), episode_title: trimOrNull(r.episode_title),
      broadcast_date: trimOrNull(r.broadcast_date), description: trimOrNull(r.description), video_url: trimOrNull(r.video_url),
      kakao_map_url: trimOrNull(r.kakao_map_url), is_published: false,
    }, { defaultToNull: false }).select('id').single()
    if (insErr || !ins) { rec.status = 'failed_insert'; rec.note = `INSERT 실패: ${insErr?.message ?? '-'}`; results.push(rec); continue }
    rec.restaurant_id = ins.id; rec.is_published = false

    // appearance INSERT(실패 시 restaurant 롤백)
    const { error: appErr } = await sb.from('restaurant_appearances').insert({
      restaurant_id: ins.id, source_type: String(r.source_type).trim(), source_title: trimOrNull(r.source_title),
      program_name: trimOrNull(r.source_title), creator_name: null, episode_title: trimOrNull(r.episode_title),
      broadcast_date: trimOrNull(r.broadcast_date), video_url: trimOrNull(r.video_url), candidate_id: null, note: 'DATA-G2 자동등록',
    }, { defaultToNull: false })
    if (appErr) {
      await sb.from('restaurants').delete().eq('id', ins.id)
      rec.status = 'failed_appearance_insert'; rec.appearance_status = 'failed(rollback)'; rec.note = `appearance 실패 롤백: ${appErr.message}`; results.push(rec); continue
    }
    rec.appearance_status = 'inserted'
    rec.status = 'inserted_private'
    results.push(rec)
  }

  // 요약
  const byStatus = {}; for (const r of results) byStatus[r.status] = (byStatus[r.status] || 0) + 1
  console.log('\n── 요약 ──')
  for (const [k, v] of Object.entries(byStatus)) console.log(`  ${k}: ${v}`)

  // 사후 카운트
  const { count: pubAfter } = await sb.from('restaurants').select('*', { count: 'exact', head: true }).eq('is_published', true)
  const { count: totalAfter } = await sb.from('restaurants').select('*', { count: 'exact', head: true })
  console.log(`공개 ${pubBefore}→${pubAfter ?? '?'}, 전체 ${totalBefore}→${totalAfter ?? '?'}`)

  // reports
  const reportsDir = join(here, '..', 'reports')
  const cols = ['status', 'slug', 'name', 'restaurant_id', 'is_published', 'area', 'category', 'address', 'lat', 'lng', 'appearance_status', 'duplicate_status', 'field_status', 'note']
  const csv = [cols.join(',')].concat(results.map((r) => cols.map((c) => csvCell(r[c])).join(','))).join('\n') + '\n'
  writeFileSync(join(reportsDir, 'import-new-restaurant-candidates-g1.csv'), csv)
  const md = [
    '# 나온집 DATA-G2 신규 후보 자동등록 결과', '',
    `- 모드: ${MODE}`, `- 대상: ${targets.length}`, '- status 분포: ' + (Object.entries(byStatus).map(([k, v]) => `${k}=${v}`).join(', ') || '없음'),
    `- 공개 ${pubBefore}→${pubAfter ?? '?'}, 전체 ${totalBefore}→${totalAfter ?? '?'}`, '',
    '| status | slug | 식당명 | private | appearance | 좌표 | field_status | note |',
    '|---|---|---|---|---|---|---|---|',
    ...results.map((r) => `| ${r.status} | ${r.slug} | ${r.name} | ${r.is_published} | ${r.appearance_status} | ${trimOrNull(r.lat) && trimOrNull(r.lng) ? r.lat + ',' + r.lng : '(없음)'} | ${r.field_status} | ${String(r.note).replace(/\|/g, '/')} |`),
    '', APPLY ? '' : '※ dry-run 입니다.',
  ].join('\n')
  writeFileSync(join(reportsDir, 'import-new-restaurant-candidates-g1.md'), md)
  console.log('reports/import-new-restaurant-candidates-g1.{md,csv} 생성 완료.')
}
main().catch((e) => { console.error('FAIL: 예외 —', e?.message ?? String(e)); process.exitCode = 2 })
