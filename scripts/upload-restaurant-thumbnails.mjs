/**
 * 나온집 대표사진 일괄 업로드 + thumbnail 업데이트 스크립트
 *
 * 로컬 입력 폴더의 {slug}.webp 파일을 읽어
 *   1) Supabase Storage(restaurant-thumbnails)에 restaurants/{slug}/main.webp 로 업로드(upsert)
 *   2) restaurants.thumbnail 을 public URL 로 UPDATE
 * 한다.
 *
 * 기본은 dry-run(검증만). 실제 적용은 --apply 플래그가 있을 때만 수행한다.
 *
 * 사용:
 *   node scripts/upload-restaurant-thumbnails.mjs                 # dry-run, 기본 입력 폴더
 *   node scripts/upload-restaurant-thumbnails.mjs C:\work\my-imgs # dry-run, 다른 폴더
 *   node scripts/upload-restaurant-thumbnails.mjs --apply         # 실제 업로드 + DB 업데이트
 *
 * 안전 원칙:
 *   - service_role key 등 비밀값은 절대 콘솔에 출력하지 않는다(존재 여부만 표시).
 *   - 기본 dry-run. --apply 없이는 업로드/DB 변경을 하지 않는다.
 *   - .webp 만 처리. slug 가 DB 에 없으면 skip. 0바이트 skip.
 *   - 입력 폴더 이미지는 repo 에 두지 않는다(기본 경로는 repo 밖).
 *
 * 종료 코드: 0 정상(처리할 게 없어도 0), 2 env/설정/조회 오류.
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, basename, extname } from 'node:path'

const BUCKET = 'restaurant-thumbnails'
const DEFAULT_INPUT_DIR = 'C:\\work\\naonzip-thumbnail-input'

// ── 인자 파싱 ────────────────────────────────────
const argv = process.argv.slice(2)
const APPLY = argv.includes('--apply')
const positional = argv.filter((a) => !a.startsWith('--'))
const INPUT_DIR = positional[0] ?? DEFAULT_INPUT_DIR
const MODE = APPLY ? 'APPLY' : 'DRY-RUN'

// ── .env.local 로드 (값은 절대 출력하지 않는다) ──
//    audit-restaurant-data-quality.mjs 와 동일한 방식.
function loadEnvLocal() {
  const here = dirname(fileURLToPath(import.meta.url))
  const envPath = join(here, '..', '.env.local')
  let raw
  try {
    raw = readFileSync(envPath, 'utf8')
  } catch {
    return
  }
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/)
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
}

// public URL 은 NEXT_PUBLIC_SUPABASE_URL 에서 파생한다(프로젝트 ref 하드코딩 금지).
// 형태: {base}/storage/v1/object/public/restaurant-thumbnails/restaurants/{slug}/main.webp
function buildPublicUrl(baseUrl, slug) {
  const base = baseUrl.replace(/\/+$/, '')
  return `${base}/storage/v1/object/public/${BUCKET}/restaurants/${slug}/main.webp`
}

async function main() {
  console.log('=== 나온집 대표사진 일괄 업로드 ===')
  console.log(`모드: ${MODE}${APPLY ? '' : ' (검증만 — 실제 업로드/DB 변경 없음)'}`)
  console.log(`입력 폴더: ${INPUT_DIR}`)

  loadEnvLocal()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  // 비밀값은 출력하지 않고 "존재 여부"만 표시한다.
  console.log(
    `env: NEXT_PUBLIC_SUPABASE_URL ${url ? '✓' : '✗'}, ` +
      `SUPABASE_SERVICE_ROLE_KEY ${serviceKey ? '✓(값 비표시)' : '✗'}`,
  )

  if (!url || !serviceKey) {
    console.error(
      'FAIL: env 누락 — .env.local 에 NEXT_PUBLIC_SUPABASE_URL 과 SUPABASE_SERVICE_ROLE_KEY 가 필요합니다.',
    )
    console.error('      (service_role key 는 쓰기 권한용입니다. 값은 출력하지 않습니다.)')
    process.exitCode = 2
    return
  }

  // ── 입력 폴더 / 파일 확인 ──
  if (!existsSync(INPUT_DIR)) {
    console.log('')
    console.log(`입력 폴더가 없습니다: ${INPUT_DIR}`)
    console.log('폴더를 만들고 {slug}.webp 파일을 넣은 뒤 다시 실행하세요.')
    console.log('처리할 파일이 없어 종료합니다. (정상)')
    return
  }

  const webpFiles = readdirSync(INPUT_DIR).filter(
    (f) => extname(f).toLowerCase() === '.webp',
  )
  if (webpFiles.length === 0) {
    console.log('')
    console.log(`입력 폴더에 .webp 파일이 없습니다: ${INPUT_DIR}`)
    console.log('처리할 파일이 없어 종료합니다. (정상)')
    return
  }

  // ── Supabase 연결 + 기존 slug 일괄 조회(1회) ──
  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: slugRows, error: slugErr } = await supabase
    .from('restaurants')
    .select('slug')
  if (slugErr) {
    console.error(`FAIL: restaurants slug 조회 실패 — ${slugErr.code ?? '-'} ${slugErr.message}`)
    process.exitCode = 2
    return
  }
  const slugSet = new Set((slugRows ?? []).map((r) => r.slug))

  // ── 파일별 처리 ──
  const results = []
  for (const file of webpFiles) {
    const slug = basename(file, extname(file)) // {slug}.webp → slug
    const fullPath = join(INPUT_DIR, file)
    const rec = { file, slug, status: '', reason: '', url: '' }

    // 0바이트 체크
    let size = 0
    try {
      size = statSync(fullPath).size
    } catch {
      rec.status = 'fail'
      rec.reason = '파일 stat 실패'
      results.push(rec)
      continue
    }
    if (size === 0) {
      rec.status = 'fail'
      rec.reason = '파일 크기 0바이트'
      results.push(rec)
      continue
    }

    // slug 존재 확인
    if (!slugSet.has(slug)) {
      rec.status = 'fail'
      rec.reason = 'DB에 없는 slug (파일명 확인 필요)'
      results.push(rec)
      continue
    }

    const storagePath = `restaurants/${slug}/main.webp`
    const publicUrl = buildPublicUrl(url, slug)
    rec.url = publicUrl

    // dry-run: 계획만 기록
    if (!APPLY) {
      rec.status = 'planned'
      rec.reason = `업로드 예정: ${BUCKET}/${storagePath}`
      results.push(rec)
      continue
    }

    // ── 실제 업로드 ──
    let buf
    try {
      buf = readFileSync(fullPath)
    } catch (e) {
      rec.status = 'fail'
      rec.reason = `파일 읽기 실패: ${e?.message ?? e}`
      results.push(rec)
      continue
    }

    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buf, { upsert: true, contentType: 'image/webp' })
    if (upErr) {
      rec.status = 'fail'
      rec.reason = `Storage 업로드 실패: ${upErr.message}`
      results.push(rec)
      continue
    }

    const { error: updErr } = await supabase
      .from('restaurants')
      .update({ thumbnail: publicUrl })
      .eq('slug', slug)
    if (updErr) {
      rec.status = 'fail'
      rec.reason = `DB 업데이트 실패: ${updErr.message}`
      results.push(rec)
      continue
    }

    rec.status = 'success'
    results.push(rec)
  }

  // ── 요약 출력 ──
  const done = results.filter((r) => r.status === 'success' || r.status === 'planned')
  const fail = results.filter((r) => r.status === 'fail')

  console.log('')
  console.log('── 결과 요약 ──')
  console.log(`입력 .webp 파일: ${webpFiles.length}`)
  console.log(`${APPLY ? '성공' : '처리 예정(planned)'}: ${done.length}`)
  console.log(`실패/skip: ${fail.length}`)

  console.log('')
  console.log(`[${APPLY ? '성공' : '처리 예정'}] 식당`)
  if (done.length === 0) console.log('  - 없음')
  for (const r of done) console.log(`  - ${r.slug}  ←  ${r.file}`)

  console.log('')
  console.log('[실패/skip] 식당 + 이유')
  if (fail.length === 0) console.log('  - 없음')
  for (const r of fail) console.log(`  - ${r.slug} (${r.file}) → ${r.reason}`)

  console.log('')
  console.log(`[${APPLY ? '업데이트된' : '업데이트 예정'}] thumbnail URL`)
  if (done.length === 0) console.log('  - 없음')
  for (const r of done) console.log(`  - ${r.slug}: ${r.url}`)

  if (!APPLY) {
    console.log('')
    console.log('※ dry-run 입니다. 실제 업로드/DB 변경을 하려면 --apply 를 붙여 다시 실행하세요.')
  }
}

main().catch((err) => {
  console.error('FAIL: 예기치 못한 예외 —', err?.message ?? String(err))
  process.exitCode = 2
})
