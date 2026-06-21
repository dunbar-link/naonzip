/**
 * 우슐랭(우체국 추천 맛집가이드 2026) 후보 등록 자동화 — 기본 dry-run, 이중 안전장치 apply.
 *
 * 반복되는 우슐랭 등록 절차(CSV 로드 → Kakao/주소 확인 → slug → 사진 검증 → DB/Storage 중복 →
 * payload → 리포트 → apply)를 한 스크립트로 묶는다. 기본은 항상 dry-run(DB/Storage 무변경).
 * 실제 등록은 `--apply --confirm APPLY_POSTOFFICE_BATCH` 가 모두 있을 때만.
 *
 * 사용:
 *   node scripts/register-postoffice-candidates.mjs --names "윤가네산오징어,조방낙지 가야점"
 *   node scripts/register-postoffice-candidates.mjs --slugs "postoffice-bukgu-yungane-san-ojingeo"
 *   node scripts/register-postoffice-candidates.mjs --batch reports/postoffice-guide-audit/postoffice-register-sample.json
 *   node scripts/register-postoffice-candidates.mjs --names "..." --apply --confirm APPLY_POSTOFFICE_BATCH
 *
 * 안전: 비밀키 미출력. dry-run 은 DB/Storage/파일(리포트 제외) 무변경. apply 는 NEW_READY·image OK·
 *   충돌 0 후보만. source_type=guide(우슐랭/postoffice 신규 enum 금지). trust source_url=null·is_public=true.
 *   appearances 미생성. 우체국 PDF 사진 사용 금지(입력 폴더 파일만).
 */
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import { readFileSync, existsSync, statSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const ROOT = join(here, '..')

// ── 상수 ──
const BUCKET = 'restaurant-thumbnails'
const SOURCE_NAME = '우체국 추천 맛집가이드 2026'
const TRUST_LABEL = '부산지방우정청 추천'
const APPLY_TOKEN = 'APPLY_POSTOFFICE_BATCH'
const MIN_W = 400, MIN_H = 300
const NEAR_M = 120
const DEFAULT_IMAGE_DIR = 'C:\\work\\naonzip-thumbnail-input'
const DEFAULT_CSV = join(ROOT, 'reports', 'postoffice-guide-audit', 'postoffice-busan-2026.csv')
const DEFAULT_REPORT_DIR = join(ROOT, 'reports', 'postoffice-guide-audit')
// 구 → canonical area (AREA_TYPES). 매핑 없으면 '기타'. (category 는 자동 추정하지 않음 → REVIEW)
const GU_TO_AREA = {
  '수영구': '광안리', '연제구': '연제', '기장군': '기장', '북구': '기타', '부산진구': '서면',
  '중구': '남포동', '동래구': '동래', '사상구': '사상', '영도구': '영도', '남구': '남구',
  '해운대구': '해운대', '서구': '기타', '사하구': '기타', '금정구': '기타', '강서구': '기타', '동구': '기타',
}

// ── 옵션 파싱 ──
const argv = process.argv.slice(2)
function optVal(name) {
  const eq = argv.find((a) => a.startsWith(`--${name}=`))
  if (eq) return eq.slice(name.length + 3)
  const i = argv.indexOf(`--${name}`)
  if (i !== -1 && argv[i + 1] && !argv[i + 1].startsWith('--')) return argv[i + 1]
  return null
}
const hasFlag = (name) => argv.includes(`--${name}`)
const APPLY = hasFlag('apply')
const CONFIRM = optVal('confirm')
const DRY_RUN = !APPLY
const IMAGE_DIR = optVal('image-dir') || DEFAULT_IMAGE_DIR
const CSV_PATH = optVal('csv') || DEFAULT_CSV
const REPORT_DIR = optVal('report-dir') || DEFAULT_REPORT_DIR
const NAMES = (optVal('names') || '').split(',').map((s) => s.trim()).filter(Boolean)
const SLUGS = (optVal('slugs') || '').split(',').map((s) => s.trim()).filter(Boolean)
const BATCH = optVal('batch')

// ── 유틸 ──
function loadEnv() {
  let raw
  try { raw = readFileSync(join(ROOT, '.env.local'), 'utf8') } catch { return }
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!m) continue
    let v = m[2]
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
    if (!process.env[m[1]]) process.env[m[1]] = v
  }
}
const nname = (s) => String(s || '').replace(/[\s()·,.]/g, '').toLowerCase()
const nph = (p) => String(p || '').replace(/\D/g, '')
const gu = (a) => (String(a || '').match(/([가-힣]+[구군])/) || [])[1] || ''
const placeIdFromUrl = (u) => (String(u || '').match(/place\.map\.kakao\.com\/(\d+)/) || [])[1] || ''
function dist(la1, ln1, la2, ln2) {
  const R = 6371000, t = (x) => x * Math.PI / 180
  const dla = t(la2 - la1), dln = t(ln2 - ln1)
  const a = Math.sin(dla / 2) ** 2 + Math.cos(t(la1)) * Math.cos(t(la2)) * Math.sin(dln / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}
function ts() {
  const d = new Date(), p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
}
function today() { return new Date().toISOString().slice(0, 10) }

// 따옴표 지원 CSV 파서 (BOM 제거)
function parseCsv(text) {
  text = text.replace(/^﻿/, '')
  const rows = []; let row = [], cur = '', inQ = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQ) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++ } else inQ = false } else cur += c }
    else {
      if (c === '"') inQ = true
      else if (c === ',') { row.push(cur); cur = '' }
      else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = '' }
      else if (c === '\r') {}
      else cur += c
    }
  }
  if (cur !== '' || row.length) { row.push(cur); rows.push(row) }
  return rows
}

function loadCsv() {
  if (!existsSync(CSV_PATH)) return { error: `CSV 없음: ${CSV_PATH}` }
  const rows = parseCsv(readFileSync(CSV_PATH, 'utf8')).filter((r) => r.some((c) => c.trim()))
  if (!rows.length) return { error: 'CSV 비어있음' }
  const header = rows[0].map((h) => h.trim())
  // 실제 헤더 기준 매핑(하드코딩 금지). 필수 컬럼 확인.
  const need = ['official_restaurant_name', 'post_office', 'address', 'phone', 'main_menu', 'price_text',
    'kakao_place_id', 'kakao_url', 'lat', 'lng', 'classification', 'proposed_slug', 'selected_years', 'pdf_page', 'business_hours']
  const missing = need.filter((c) => !header.includes(c))
  if (missing.length) return { error: `CSV 필수 컬럼 누락: ${missing.join(', ')}` }
  const idx = Object.fromEntries(header.map((h, i) => [h, i]))
  const data = rows.slice(1).map((r) => Object.fromEntries(header.map((h) => [h, (r[idx[h]] ?? '').trim()])))
  return { data, header }
}

function verifyImage(slug, imageName) {
  const file = imageName || `${slug}.jpg`
  const full = join(IMAGE_DIR, file)
  if (!existsSync(full)) return { status: 'IMAGE_PENDING', file, note: '파일 없음' }
  try {
    const size = statSync(full).size
    if (size === 0) return { status: 'IMAGE_INVALID', file, note: '0바이트' }
    return { full, file, size, status: 'PENDING_META' }
  } catch (e) { return { status: 'IMAGE_INVALID', file, note: String(e?.message || e) } }
}
async function verifyImageMeta(img) {
  if (img.status !== 'PENDING_META') return img
  try {
    const m = await sharp(img.full).metadata()
    if ((m.width ?? 0) < MIN_W || (m.height ?? 0) < MIN_H)
      return { ...img, status: 'IMAGE_INVALID', width: m.width, height: m.height, note: `작은 이미지 ${m.width}x${m.height}` }
    return { ...img, status: 'IMAGE_OK', width: m.width, height: m.height }
  } catch (e) { return { ...img, status: 'IMAGE_INVALID', note: `열기 실패 ${e?.message || e}` } }
}

function matchCsv(data, { name, slug }) {
  // 1) slug 매칭(proposed_slug)
  if (slug) {
    const bySlug = data.filter((r) => r.proposed_slug === slug)
    if (bySlug.length === 1) return { row: bySlug[0], by: 'slug' }
    if (bySlug.length > 1) return { error: `slug 모호(${bySlug.length})` }
  }
  if (name) {
    const exact = data.filter((r) => r.official_restaurant_name === name)
    if (exact.length === 1) return { row: exact[0], by: 'name_exact' }
    if (exact.length > 1) return { error: `name 중복(${exact.length})` }
    const norm = data.filter((r) => nname(r.official_restaurant_name) === nname(name))
    if (norm.length === 1) return { row: norm[0], by: 'name_norm' }
    if (norm.length > 1) return { error: `정규화명 모호(${norm.length})` }
    const fuzzy = data.filter((r) => nname(r.official_restaurant_name).includes(nname(name)) || nname(name).includes(nname(r.official_restaurant_name)))
    if (fuzzy.length === 1) return { row: fuzzy[0], by: 'fuzzy' }
    if (fuzzy.length > 1) return { error: `fuzzy 다수(${fuzzy.length}) → 임의 선택 금지`, fuzzy: fuzzy.map((r) => r.official_restaurant_name) }
  }
  return { error: 'NOT_FOUND' }
}

function validSlug(s) { return /^[a-z0-9-]+$/.test(s) }

async function main() {
  loadEnv()
  const mode = APPLY ? 'APPLY' : 'DRY-RUN'
  console.log(`=== 우슐랭 후보 등록 자동화 (${mode}) ===`)
  console.log(`입력: names=${NAMES.length} slugs=${SLUGS.length} batch=${BATCH || '-'} | image-dir=${IMAGE_DIR}`)

  // apply 이중 안전장치
  if (APPLY && CONFIRM !== APPLY_TOKEN) {
    console.error(`FAIL: --apply 에는 --confirm ${APPLY_TOKEN} 필요. 중단.`)
    process.exitCode = 2; return
  }

  // 후보 입력 수집
  let inputs = []
  if (BATCH) {
    if (!existsSync(BATCH)) { console.error(`FAIL: batch 파일 없음: ${BATCH}`); process.exitCode = 2; return }
    let j
    try { j = JSON.parse(readFileSync(BATCH, 'utf8')) } catch (e) { console.error(`FAIL: batch JSON 파싱: ${e?.message}`); process.exitCode = 2; return }
    inputs = (j.candidates || []).map((c) => ({ name: c.name || null, slug: c.slug || null, image: c.image || null, area: c.area || null, category: c.category || null }))
  }
  for (const n of NAMES) inputs.push({ name: n, slug: null, image: null })
  for (const s of SLUGS) inputs.push({ name: null, slug: s, image: null })
  if (!inputs.length) { console.error('FAIL: 후보 입력 없음(--names/--slugs/--batch)'); process.exitCode = 2; return }

  const { data: csv, error: csvErr } = loadCsv()
  if (csvErr) { console.error(`FAIL: ${csvErr}`); process.exitCode = 2; return }

  // DB read-only
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) { console.error('FAIL: Supabase env 누락'); process.exitCode = 2; return }
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data: dbAll, error: dbErr } = await sb.from('restaurants').select('id,slug,name,address,phone,kakao_map_url,lat,lng,source_type,thumbnail,is_published')
  if (dbErr) { console.error(`FAIL: restaurants 조회: ${dbErr.message}`); process.exitCode = 2; return }

  const results = []
  for (const inp of inputs) {
    const rec = { input: inp.name || inp.slug, csvRow: null, slug: null, image: null, imageStatus: null,
      area: null, category: inp.category || null, dup: {}, storage: null, status: null, reasons: [], payload: null, trust: null }

    const m = matchCsv(csv, inp)
    if (m.error) { rec.status = 'BLOCKED'; rec.reasons.push(m.error === 'NOT_FOUND' ? 'CSV 매칭 없음(NOT_FOUND)' : m.error); if (m.fuzzy) rec.reasons.push('후보: ' + m.fuzzy.join(' / ')); results.push(rec); continue }
    const row = m.csvRow = m.row
    rec.csvRow = { name: row.official_restaurant_name, post_office: row.post_office, rec_no: row.recommendation_number, address: row.address, phone: row.phone, place: row.kakao_place_id, lat: row.lat, lng: row.lng, classification: row.classification, pdf_page: row.pdf_page }
    rec.matchedBy = m.by

    // slug
    const slug = inp.slug || row.proposed_slug
    rec.slug = slug
    rec.slugConfirmed = !!inp.slug // CLI/batch 명시값만 '확정'. CSV proposed 는 placeholder(제안).
    if (!slug || !validSlug(slug)) { rec.status = 'BLOCKED'; rec.reasons.push(`slug 형식 오류: ${slug}`); results.push(rec); continue }
    if (!rec.slugConfirmed && /-\d+$/.test(slug)) rec.reasons.push('slug 미확정: CSV proposed 는 placeholder(postoffice-구-NN) → CLI/batch 로 확정 slug(romanize) 지정 필요')

    // 이미지(메타는 뒤에서 일괄 await)
    rec.imageRaw = verifyImage(slug, inp.image)

    // area 제안(구 매핑), category 는 batch 값 없으면 수동 확정 필요
    const g = gu(row.address)
    rec.area = inp.area || GU_TO_AREA[g] || '기타'
    if (!rec.category) rec.reasons.push('category 미확정(수동 확정 필요)')

    // DB 중복
    const dupSlug = dbAll.filter((r) => r.slug === slug)
    const dupName = dbAll.filter((r) => nname(r.name) === nname(row.official_restaurant_name))
    const dupPhone = dbAll.filter((r) => nph(r.phone) && nph(r.phone) === nph(row.phone))
    const dupPlace = dbAll.filter((r) => placeIdFromUrl(r.kakao_map_url) === row.kakao_place_id)
    const la = parseFloat(row.lat), ln = parseFloat(row.lng)
    const near = (la && ln) ? dbAll.filter((r) => r.lat && r.lng && dist(la, ln, r.lat, r.lng) < NEAR_M) : []
    rec.dup = { slug: dupSlug.length, name: dupName.length, phone: dupPhone.length, place: dupPlace.length, near: near.map((r) => `${r.name}(${Math.round(dist(la, ln, r.lat, r.lng))}m)`) }

    // Storage 충돌(read-only list)
    let storageExists = false
    try {
      const { data: list } = await sb.storage.from(BUCKET).list(`restaurants/${slug}`)
      storageExists = (list || []).some((o) => o.name === 'main.webp')
    } catch { /* list 실패는 충돌 아님으로 간주, note */ }
    rec.storage = { path: `restaurants/${slug}/main.webp`, exists: storageExists }

    results.push(rec)
  }

  // 이미지 메타 일괄
  for (const rec of results) {
    if (rec.imageRaw) { const m = await verifyImageMeta(rec.imageRaw); rec.image = m.file; rec.imageStatus = m.status; if (m.note) rec.reasons.push(`image: ${m.note}`) }
  }

  // 상태 판정
  for (const rec of results) {
    if (rec.status === 'BLOCKED') continue
    const d = rec.dup
    const already = d.slug > 0 || d.place > 0 || (d.phone > 0 && rec.dup.name > 0)
    if (already) { rec.status = 'ALREADY_REGISTERED'; rec.reasons.unshift('기존 등록(slug/place/phone+name 일치)') }
    else if (rec.imageStatus === 'IMAGE_INVALID' || rec.storage.exists) {
      rec.status = 'BLOCKED'
      if (rec.imageStatus === 'IMAGE_INVALID') rec.reasons.push('이미지 invalid')
      if (rec.storage.exists) rec.reasons.push('Storage main.webp 이미 존재(orphan 위험)')
    } else if (rec.csvRow.classification !== 'READY_FOR_IMAGE' || d.near.length) {
      rec.status = 'REVIEW'
      if (rec.csvRow.classification !== 'READY_FOR_IMAGE') rec.reasons.push(`CSV classification=${rec.csvRow.classification}`)
      if (d.near.length) rec.reasons.push(`좌표 ${NEAR_M}m 근접: ${d.near.join(', ')}`)
    } else {
      rec.status = 'NEW_READY'
    }
    // payload preview
    if (rec.status === 'NEW_READY' || rec.status === 'REVIEW') {
      rec.payload = {
        name: rec.csvRow.name, slug: rec.slug, area: rec.area, category: rec.category || '(수동 확정)',
        main_menu: '(CSV main_menu/대표 메뉴)', price_text: '(CSV price_text)', address: rec.csvRow.address,
        phone: rec.csvRow.phone, lat: rec.csvRow.lat, lng: rec.csvRow.lng,
        kakao_map_url: `https://place.map.kakao.com/${rec.csvRow.place}`, kakao_place_id: rec.csvRow.place,
        source_type: 'guide', source_title: SOURCE_NAME, thumbnail: `${BUCKET}/restaurants/${rec.slug}/main.webp`, is_published: true,
      }
      rec.trust = { source_kind: 'guide', source_name: SOURCE_NAME, source_url: null, is_public: true, trust_label: TRUST_LABEL, verified_at: today() }
    }
  }

  // ── 콘솔 요약 ──
  const cnt = (s) => results.filter((r) => r.status === s).length
  const imgCnt = (s) => results.filter((r) => r.imageStatus === s).length
  console.log(`\n후보 ${results.length} | NEW_READY ${cnt('NEW_READY')} / ALREADY ${cnt('ALREADY_REGISTERED')} / REVIEW ${cnt('REVIEW')} / BLOCKED ${cnt('BLOCKED')}`)
  console.log(`이미지 IMAGE_OK ${imgCnt('IMAGE_OK')} / IMAGE_PENDING ${imgCnt('IMAGE_PENDING')} / IMAGE_INVALID ${imgCnt('IMAGE_INVALID')}`)
  for (const r of results) console.log(`  [${r.status}] ${r.input} → ${r.slug || '-'} | img=${r.imageStatus || '-'} | ${r.reasons.join('; ') || 'ok'}`)

  // ── 리포트 ──
  const stamp = ts()
  mkdirSync(REPORT_DIR, { recursive: true })
  const jsonOut = { mode, generatedAt: today(), inputs: { names: NAMES, slugs: SLUGS, batch: BATCH || null },
    summary: { total: results.length, new_ready: cnt('NEW_READY'), already: cnt('ALREADY_REGISTERED'), review: cnt('REVIEW'), blocked: cnt('BLOCKED'), image_ok: imgCnt('IMAGE_OK'), image_pending: imgCnt('IMAGE_PENDING'), image_invalid: imgCnt('IMAGE_INVALID') },
    db_write: 0, storage_write: 0, candidates: results.map((r) => ({ input: r.input, status: r.status, slug: r.slug, matchedBy: r.matchedBy, csv: r.csvRow, image: r.image, imageStatus: r.imageStatus, area: r.area, category: r.category, dup: r.dup, storage: r.storage, reasons: r.reasons, payload: r.payload, trust: r.trust })) }
  writeFileSync(join(REPORT_DIR, `postoffice-register-run-${stamp}.json`), JSON.stringify(jsonOut, null, 1), 'utf8')
  const md = [
    `# 우슐랭 후보 등록 실행 리포트 (${mode})`, '',
    `- 생성: ${today()} (run ${stamp})`, `- 입력: names=${NAMES.join(',') || '-'} / slugs=${SLUGS.join(',') || '-'} / batch=${BATCH || '-'}`,
    `- DB write: 0 / Storage write: 0 (${mode === 'DRY-RUN' ? 'dry-run' : 'apply 결과는 실행부 참조'})`, '',
    `## 요약`,
    `| 상태 | 수 |`, `|---|---|`,
    `| NEW_READY | ${cnt('NEW_READY')} |`, `| ALREADY_REGISTERED | ${cnt('ALREADY_REGISTERED')} |`,
    `| REVIEW | ${cnt('REVIEW')} |`, `| BLOCKED | ${cnt('BLOCKED')} |`,
    `| IMAGE_OK | ${imgCnt('IMAGE_OK')} | `, `| IMAGE_PENDING | ${imgCnt('IMAGE_PENDING')} |`, `| IMAGE_INVALID | ${imgCnt('IMAGE_INVALID')} |`, '',
    `## 후보별`, '| 입력 | 상태 | slug | 이미지 | 사유 |', '|---|---|---|---|---|',
    ...results.map((r) => `| ${r.input} | ${r.status} | ${r.slug || '-'} | ${r.imageStatus || '-'} | ${(r.reasons.join('; ') || 'ok').replace(/\|/g, '/')} |`),
    '', `> dry-run 은 DB/Storage 무변경. apply 는 \`--apply --confirm ${APPLY_TOKEN}\` 필요.`,
  ].join('\n')
  writeFileSync(join(REPORT_DIR, `postoffice-register-run-${stamp}.md`), md, 'utf8')
  console.log(`\n리포트: reports/postoffice-guide-audit/postoffice-register-run-${stamp}.{md,json}`)

  // ── APPLY (이중 안전장치 통과 시에만; 이번 작업에선 호출하지 않음) ──
  if (APPLY) {
    const targets = results.filter((r) => r.status === 'NEW_READY')
    const blockers = results.filter((r) => r.status === 'BLOCKED')
    if (blockers.length) { console.error(`FAIL: BLOCKED ${blockers.length}건 존재 → apply 중단`); process.exitCode = 2; return }
    if (!targets.length) { console.log('apply 대상(NEW_READY) 없음. 변경 없음.'); return }
    if (targets.some((r) => r.imageStatus !== 'IMAGE_OK')) { console.error('FAIL: apply 대상 중 image OK 아님 → 중단'); process.exitCode = 2; return }
    if (targets.some((r) => !r.category)) { console.error('FAIL: apply 대상 중 category 미확정 → 중단(batch 에 category 지정)'); process.exitCode = 2; return }
    if (targets.some((r) => !r.slugConfirmed && /-\d+$/.test(r.slug))) { console.error('FAIL: apply 대상 중 slug 미확정(placeholder) → 중단(CLI/batch 확정 slug 필요)'); process.exitCode = 2; return }
    console.error('NOTE: apply 실제 INSERT/업로드 절차는 register-postoffice-batchN.mjs 패턴을 따른다. 본 자동화의 apply 경로는 별도 승인 작업에서 활성화한다.')
    // 안전을 위해 본 스크립트는 여기서 실제 write 를 수행하지 않는다(이번 범위: dry-run 자동화 + 안전장치).
  }
}
main().catch((e) => { console.error('FAIL 예외:', e?.message ?? String(e)); process.exitCode = 2 })
