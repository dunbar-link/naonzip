/**
 * 나온집 대표사진 신규/교체 통합 업서트 스크립트 (운영용).
 *
 * 입력 폴더의 {slug}.(jpg|jpeg|png|webp) 를 읽어
 *   1) restaurants row 확인(존재/공개/기존 thumbnail)
 *   2) 이미지 검증(열림/크기) + webp 변환(긴 변 ≤1200, q85)
 *   3) Storage(restaurant-thumbnails)에 restaurants/{slug}/main.webp 신규 업로드(upload) 또는 교체(update)
 *   4) Storage download API 로 실제 저장 바이트 검증
 *   5) restaurants.thumbnail URL 업데이트(교체 시 ?v= cache-bust 부여)
 * 한다.
 *
 * 기본 dry-run(검증/계획만). 실제 변경은 --apply 가 있을 때만.
 *
 * 옵션:
 *   --apply                 실제 Storage/DB 변경 수행 (없으면 dry-run)
 *   --only slugA,slugB      해당 slug 만 처리 (쉼표 구분, 공백/등호 모두 허용)
 *   --replace               기존 thumbnail 이 있어도 교체 (없으면 보유 row 는 skip)
 *   --include-private       비공개(is_published=false) 식당도 처리 (기본은 공개만)
 *   <경로>                  입력 폴더 경로 override (기본 C:\work\naonzip-thumbnail-input)
 *
 * 안전 원칙:
 *   - service_role 등 비밀값은 절대 출력하지 않는다(존재 여부만).
 *   - 기존 upload-restaurant-thumbnails.mjs 는 그대로 보존(이 파일은 별도 추가).
 *   - 기존 객체 교체는 storage.update() 사용 + download 로 바이트 검증(upload upsert 만 믿지 않음).
 *   - --apply 없이는 Storage/DB 를 절대 변경하지 않는다(dry-run 은 파일 쓰기도 안 함).
 *   - DB UPDATE 는 대상 slug 단건, 영향 행 1 확인.
 *   - 입력 폴더 이미지는 repo 밖. 이 스크립트는 repo 내부에 이미지를 만들지 않는다(webp 는 입력 폴더에만).
 *
 * 종료 코드: 0 정상, 2 env/설정/조회 오류.
 */
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import { readFileSync, readdirSync, statSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, basename, extname } from 'node:path'

const BUCKET = 'restaurant-thumbnails'
const DEFAULT_INPUT_DIR = 'C:\\work\\naonzip-thumbnail-input'
const EXT_PRIORITY = ['.jpg', '.jpeg', '.png', '.webp']
const MAX_LONG_EDGE = 1200
const WEBP_QUALITY = 85
const MIN_W = 400
const MIN_H = 300

// ── 인자 파싱 ─────────────────────────────────────
const argv = process.argv.slice(2)
const APPLY = argv.includes('--apply')
const REPLACE = argv.includes('--replace')
const INCLUDE_PRIVATE = argv.includes('--include-private')

function parseOnly() {
  const eq = argv.find((a) => a.startsWith('--only='))
  if (eq) return eq.slice('--only='.length)
  const i = argv.indexOf('--only')
  if (i !== -1 && argv[i + 1] && !argv[i + 1].startsWith('--')) return argv[i + 1]
  return null
}
const ONLY_RAW = parseOnly()
const ONLY = ONLY_RAW ? new Set(ONLY_RAW.split(',').map((s) => s.trim()).filter(Boolean)) : null

// 입력 폴더 override: 경로처럼 보이는 positional 만(슬래시 포함). --only 값과 혼동 방지.
const positional = argv.filter((a) => !a.startsWith('--'))
let INPUT_DIR = DEFAULT_INPUT_DIR
for (const p of positional) {
  if (p.includes('\\') || p.includes('/')) { INPUT_DIR = p; break }
}
const MODE = APPLY ? 'APPLY' : 'DRY-RUN'

// ── 유틸 ──────────────────────────────────────────
const here = dirname(fileURLToPath(import.meta.url))
function loadEnvLocal() {
  let raw
  try { raw = readFileSync(join(here, '..', '.env.local'), 'utf8') } catch { return }
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!m) continue
    let v = m[2]
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
    if (!process.env[m[1]]) process.env[m[1]] = v
  }
}
function buildPublicUrl(baseUrl, slug) {
  return `${baseUrl.replace(/\/+$/, '')}/storage/v1/object/public/${BUCKET}/restaurants/${slug}/main.webp`
}
function cacheBustTag() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `thumb-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
}
function withVersion(url, ver) {
  if (/[?&]v=/.test(url)) return url.replace(/([?&]v=)[^&]*/, `$1${ver}`)
  return url + (url.includes('?') ? '&' : '?') + 'v=' + ver
}
function csvCell(v) {
  const s = String(v ?? '')
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
}

async function main() {
  console.log('=== 나온집 대표사진 업서트(신규/교체) ===')
  console.log(`모드: ${MODE}${APPLY ? '' : ' (검증/계획만 — Storage/DB/파일 변경 없음)'}`)
  console.log(`입력 폴더: ${INPUT_DIR}`)
  console.log(`옵션: replace=${REPLACE}, include-private=${INCLUDE_PRIVATE}, only=${ONLY ? [...ONLY].join('|') : '(없음)'}`)

  loadEnvLocal()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  console.log(`env: NEXT_PUBLIC_SUPABASE_URL ${url ? '✓' : '✗'}, SUPABASE_SERVICE_ROLE_KEY ${serviceKey ? '✓(값 비표시)' : '✗'}`)
  if (!url || !serviceKey) { console.error('FAIL: .env.local 에 URL/SERVICE_ROLE_KEY 필요(값 미출력).'); process.exitCode = 2; return }

  if (!existsSync(INPUT_DIR)) {
    console.log(`\n입력 폴더가 없습니다: ${INPUT_DIR}\n처리할 파일 없음(정상 종료).`)
    return
  }

  // ── 입력 파일 슬러그별 그룹(확장자 우선순위) ──
  const allFiles = readdirSync(INPUT_DIR).filter((f) => EXT_PRIORITY.includes(extname(f).toLowerCase()))
  const bySlug = new Map() // slug -> { primary, ignored: [] }
  for (const f of allFiles) {
    const slug = basename(f, extname(f))
    const cur = bySlug.get(slug) ?? { files: [] }
    cur.files.push(f)
    bySlug.set(slug, cur)
  }
  for (const [slug, g] of bySlug) {
    g.files.sort((a, b) => {
      const pa = EXT_PRIORITY.indexOf(extname(a).toLowerCase())
      const pb = EXT_PRIORITY.indexOf(extname(b).toLowerCase())
      if (pa !== pb) return pa - pb
      return statSync(join(INPUT_DIR, b)).mtimeMs - statSync(join(INPUT_DIR, a)).mtimeMs
    })
    g.primary = g.files[0]
    g.ignored = g.files.slice(1)
  }

  let slugs = [...bySlug.keys()]
  if (ONLY) slugs = slugs.filter((s) => ONLY.has(s))

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })

  // 대상 slug DB 조회(1회)
  const rowsBySlug = new Map()
  if (slugs.length) {
    const { data, error } = await supabase
      .from('restaurants')
      .select('id, slug, name, is_published, thumbnail')
      .in('slug', slugs)
    if (error) { console.error(`FAIL: restaurants 조회 실패 — ${error.code ?? '-'} ${error.message}`); process.exitCode = 2; return }
    for (const r of data ?? []) rowsBySlug.set(r.slug, r)
  }

  const results = []
  // --only 인데 입력 파일이 없는 slug도 보고
  if (ONLY) {
    for (const s of ONLY) {
      if (!bySlug.has(s)) results.push({ slug: s, name: '', input_file: '', published: '', had_thumbnail: '', action: 'none', status: 'skipped_no_input_file', width: '', height: '', output_file: '', storage_path: '', thumbnail_before: '', thumbnail_after: '', cache_busted: '', note: '입력 폴더에 해당 slug 이미지 없음' })
    }
  }

  for (const slug of slugs) {
    const g = bySlug.get(slug)
    const file = g.primary
    const fullPath = join(INPUT_DIR, file)
    const rec = { slug, name: '', input_file: file, published: '', had_thumbnail: '', action: '', status: '', width: '', height: '', output_file: '', storage_path: `restaurants/${slug}/main.webp`, thumbnail_before: '', thumbnail_after: '', cache_busted: 'no', note: g.ignored.length ? `중복확장자 무시: ${g.ignored.join(', ')}` : '' }

    const row = rowsBySlug.get(slug)
    if (!row) { rec.action = 'none'; rec.status = 'skipped_missing_row'; results.push(rec); continue }
    rec.name = row.name
    rec.published = row.is_published
    rec.had_thumbnail = !!(row.thumbnail && String(row.thumbnail).trim())
    rec.thumbnail_before = row.thumbnail ?? ''

    if (!row.is_published && !INCLUDE_PRIVATE) { rec.action = 'none'; rec.status = 'skipped_private'; results.push(rec); continue }

    // 이미지 검증(메타데이터, 읽기 전용)
    let meta
    try { meta = await sharp(fullPath).metadata() } catch (e) { rec.action = 'none'; rec.status = 'skipped_bad_image'; rec.note = (rec.note ? rec.note + ' / ' : '') + `이미지 열기 실패: ${e?.message ?? e}`; results.push(rec); continue }
    rec.width = meta.width ?? ''
    rec.height = meta.height ?? ''
    if ((meta.width ?? 0) < MIN_W || (meta.height ?? 0) < MIN_H) rec.note = (rec.note ? rec.note + ' / ' : '') + `작은 이미지 경고(${meta.width}x${meta.height})`

    // 액션 결정
    if (!rec.had_thumbnail) rec.action = 'new'
    else if (!REPLACE) { rec.action = 'none'; rec.status = 'skipped_has_thumbnail'; results.push(rec); continue }
    else rec.action = 'replace'

    const publicUrl = buildPublicUrl(url, slug)

    if (!APPLY) {
      rec.status = rec.action === 'new' ? 'dry_run_planned_new' : 'dry_run_planned_replace'
      rec.output_file = `${slug}.webp (예정)`
      if (rec.action === 'replace') { rec.cache_busted = 'planned'; rec.thumbnail_after = withVersion(publicUrl, cacheBustTag()) + ' (예시)' }
      else rec.thumbnail_after = publicUrl + ' (예정)'
      results.push(rec)
      continue
    }

    // ── APPLY: webp 변환 ──
    let buf
    try {
      buf = await sharp(fullPath).resize({ width: MAX_LONG_EDGE, height: MAX_LONG_EDGE, fit: 'inside', withoutEnlargement: true }).webp({ quality: WEBP_QUALITY }).toBuffer()
    } catch (e) { rec.status = 'skipped_bad_image'; rec.note += ` / webp 변환 실패: ${e?.message ?? e}`; results.push(rec); continue }
    // 입력 폴더에 webp 보관(repo 밖). 원본은 삭제하지 않음.
    try { writeFileSync(join(INPUT_DIR, `${slug}.webp`), buf); rec.output_file = `${slug}.webp` } catch { /* 보관 실패는 치명적 아님 */ }

    const storagePath = `restaurants/${slug}/main.webp`
    // 신규=upload, 교체=update (upsert 만 믿지 않음)
    let upErr
    if (rec.action === 'replace') ({ error: upErr } = await supabase.storage.from(BUCKET).update(storagePath, buf, { contentType: 'image/webp', upsert: true }))
    else ({ error: upErr } = await supabase.storage.from(BUCKET).upload(storagePath, buf, { contentType: 'image/webp', upsert: true }))
    if (upErr) { rec.status = 'failed_upload'; rec.note += ` / Storage ${rec.action} 실패: ${upErr.message}`; results.push(rec); continue }

    // download 바이트 검증
    const { data: dl, error: dlErr } = await supabase.storage.from(BUCKET).download(storagePath)
    if (dlErr) { rec.status = 'failed_download_verify'; rec.note += ` / download 실패: ${dlErr.message}`; results.push(rec); continue }
    const storedLen = Buffer.from(await dl.arrayBuffer()).length
    if (storedLen !== buf.length) { rec.status = 'failed_download_verify'; rec.note += ` / 저장 바이트 불일치(local ${buf.length} != stored ${storedLen})`; results.push(rec); continue }

    // thumbnail URL: 교체 시 cache-bust, 신규는 plain
    const newUrl = rec.action === 'replace' ? withVersion(publicUrl, cacheBustTag()) : publicUrl
    const { data: upd, error: updErr } = await supabase.from('restaurants').update({ thumbnail: newUrl }).eq('slug', slug).select('slug')
    if (updErr) { rec.status = 'failed_db_update'; rec.note += ` / DB update 실패: ${updErr.message}`; results.push(rec); continue }
    if ((upd?.length ?? 0) !== 1) { rec.status = 'failed_db_update'; rec.note += ` / 영향 행 ${upd?.length ?? 0}!=1`; results.push(rec); continue }

    rec.thumbnail_after = newUrl
    rec.cache_busted = rec.action === 'replace' ? 'yes' : 'no'
    rec.status = rec.action === 'replace' ? 'replaced_existing' : 'uploaded_new'
    results.push(rec)
  }

  // ── 콘솔 요약 ──
  const byStatus = {}
  for (const r of results) byStatus[r.status] = (byStatus[r.status] || 0) + 1
  console.log('\n── 결과 요약 ──')
  console.log(`입력 슬러그: ${slugs.length}, 처리 결과: ${results.length}`)
  for (const [k, v] of Object.entries(byStatus)) console.log(`  ${k}: ${v}`)

  // ── reports 생성 ──
  const reportsDir = join(here, '..', 'reports')
  try { mkdirSync(reportsDir, { recursive: true }) } catch {}
  const cols = ['slug', 'name', 'input_file', 'published', 'had_thumbnail', 'action', 'status', 'width', 'height', 'output_file', 'storage_path', 'thumbnail_before', 'thumbnail_after', 'cache_busted', 'note']
  const csv = [cols.join(',')].concat(results.map((r) => cols.map((c) => csvCell(r[c])).join(','))).join('\n') + '\n'
  writeFileSync(join(reportsDir, 'thumbnail-upsert-result.csv'), csv)
  const md = [
    '# 나온집 썸네일 업서트 결과',
    '',
    `- 모드: ${MODE}`,
    `- 옵션: replace=${REPLACE}, include-private=${INCLUDE_PRIVATE}, only=${ONLY ? [...ONLY].join(', ') : '(없음)'}`,
    `- 입력 슬러그: ${slugs.length}, 결과: ${results.length}`,
    '- status 분포: ' + (Object.entries(byStatus).map(([k, v]) => `${k}=${v}`).join(', ') || '없음'),
    '',
    '| slug | 식당명 | input | published | 기존썸네일 | action | status | 크기 | cache_bust | note |',
    '|---|---|---|---|---|---|---|---|---|---|',
    ...results.map((r) => `| ${r.slug} | ${r.name} | ${r.input_file} | ${r.published} | ${r.had_thumbnail} | ${r.action} | ${r.status} | ${r.width}x${r.height} | ${r.cache_busted} | ${String(r.note).replace(/\|/g, '/')} |`),
    '',
    APPLY ? '' : '※ dry-run 입니다. 실제 반영은 --apply 를 붙여 실행하세요.',
  ].join('\n')
  writeFileSync(join(reportsDir, 'thumbnail-upsert-result.md'), md)
  console.log('\nreports/thumbnail-upsert-result.{md,csv} 생성 완료.')
}

main().catch((err) => { console.error('FAIL: 예기치 못한 예외 —', err?.message ?? String(err)); process.exitCode = 2 })
