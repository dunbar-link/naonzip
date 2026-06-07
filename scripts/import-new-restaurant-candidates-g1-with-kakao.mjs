/**
 * DATA-G3 일회성: DATA-G1 후보 13곳을 Kakao REST 지오코딩 후 비공개 자동 등록.
 *
 * source: reports/new-restaurant-candidates-g1.csv (status ready/needs_geocoding 13곳)
 * 좌표: Kakao Local REST (1차 주소검색 → 2차 키워드검색). 부산 범위/권역 검증. 실패 시 등록 안 함.
 * INSERT: restaurants(is_published=false) + restaurant_appearances. 기본 dry-run, --apply 시에만.
 *
 * 옵션: --apply, --only slugA,slugB, --skip-existing
 * 안전: 비밀키 미출력. is_published=false 고정. 13 slug 외 INSERT 금지. 기존 row UPDATE/DELETE 금지.
 *       좌표 추정 금지(Kakao 공식 지오코딩 결과만). video_url 단독 중복은 약중복(note)로만.
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
const PRICE_DEFAULT = '가격 확인 필요'

const argv = process.argv.slice(2)
const APPLY = argv.includes('--apply')
function parseOnly() { const eq = argv.find((a) => a.startsWith('--only=')); if (eq) return eq.slice(7); const i = argv.indexOf('--only'); if (i !== -1 && argv[i + 1] && !argv[i + 1].startsWith('--')) return argv[i + 1]; return null }
const ONLY = parseOnly() ? new Set(parseOnly().split(',').map((s) => s.trim()).filter(Boolean)) : null
const MODE = APPLY ? 'APPLY' : 'DRY-RUN'

function loadEnv() { let raw; try { raw = readFileSync(join(here, '..', '.env.local'), 'utf8') } catch { return }; for (const line of raw.split(/\r?\n/)) { const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/); if (!m) continue; let v = m[2]; if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1); if (!process.env[m[1]]) process.env[m[1]] = v } }
function parseCsv(text) { const rows = []; let row = [], cur = '', inQ = false; for (let i = 0; i < text.length; i++) { const c = text[i]; if (inQ) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++ } else inQ = false } else cur += c } else { if (c === '"') inQ = true; else if (c === ',') { row.push(cur); cur = '' } else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = '' } else if (c === '\r') {} else cur += c } } if (cur !== '' || row.length) { row.push(cur); rows.push(row) } return rows }
const norm = (v) => String(v ?? '').trim().toLowerCase().replace(/\s+/g, '')
const trimOrNull = (v) => { const t = String(v ?? '').trim(); return t === '' ? null : t }
// broadcast_date 는 DATE 컬럼 → 완전한 YYYY-MM-DD 만 허용, 부분날짜(YYYY, YYYY-MM)는 null(추정 금지).
const fullDateOrNull = (v) => { const t = String(v ?? '').trim(); return /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(t) ? t : null }
const csvCell = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s }
const inBusan = (la, ln) => la >= 34.8 && la <= 35.5 && ln >= 128.7 && ln <= 129.5
const extractGu = (a) => { const m = String(a ?? '').match(/([가-힣]+[구군])/); return m ? m[1] : null }
const cleanAddr = (a) => { const m = String(a ?? '').match(/^(.*?(?:로|길)\s*\d+(?:-\d+)?)/); return m ? m[1].trim() : String(a ?? '').trim() }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function kakaoAddress(key, q) {
  const r = await fetch('https://dapi.kakao.com/v2/local/search/address.json?query=' + encodeURIComponent(q), { headers: { Authorization: 'KakaoAK ' + key } })
  if (!r.ok) return { http: r.status, docs: [] }
  const j = await r.json(); return { docs: j.documents || [] }
}
async function kakaoKeyword(key, q) {
  const r = await fetch('https://dapi.kakao.com/v2/local/search/keyword.json?query=' + encodeURIComponent(q), { headers: { Authorization: 'KakaoAK ' + key } })
  if (!r.ok) return { http: r.status, docs: [] }
  const j = await r.json(); return { docs: j.documents || [] }
}

// 후보 1건 지오코딩 → {lat,lng,method,confidence,kakao_url,status,reason}
async function geocode(key, r) {
  const gu = extractGu(r.address)
  // 1차: 주소검색(도로명 정리본 → 원본)
  for (const q of [cleanAddr(r.address), r.address].filter((v, i, a) => v && a.indexOf(v) === i)) {
    const { docs } = await kakaoAddress(key, q); await sleep(120)
    const d = docs[0]
    if (d && d.x && d.y) {
      const la = +d.y, ln = +d.x
      if (inBusan(la, ln)) return { lat: la, lng: ln, method: 'address', confidence: 'high', kakao_url: null, status: 'ok' }
    }
  }
  // 2차: 키워드검색(이름 + 구/부산)
  for (const q of [`${r.name} ${gu ?? '부산'}`, `${r.name} 부산`].filter((v, i, a) => a.indexOf(v) === i)) {
    const { docs } = await kakaoKeyword(key, q); await sleep(120)
    const d = docs.find((x) => { const la = +x.y, ln = +x.x; if (!inBusan(la, ln)) return false; const a = `${x.road_address_name || ''} ${x.address_name || ''}`; const nameOk = norm(x.place_name).includes(norm(r.name)) || norm(r.name).includes(norm(x.place_name)); const guOk = gu ? a.includes(gu) : true; return nameOk || guOk })
    if (d) {
      const la = +d.y, ln = +d.x
      const a = `${d.road_address_name || ''} ${d.address_name || ''}`
      const guMatch = gu ? a.includes(gu) : true
      const nameMatch = norm(d.place_name).includes(norm(r.name)) || norm(r.name).includes(norm(d.place_name))
      if (!guMatch && !nameMatch) return { status: 'ambiguous', reason: '키워드 결과 구/이름 불일치' }
      return { lat: la, lng: ln, method: 'keyword', confidence: nameMatch && guMatch ? 'high' : 'medium', kakao_url: d.place_url || null, status: 'ok' }
    }
  }
  return { status: 'failed', reason: '주소/키워드 검색 부산 결과 없음' }
}

async function main() {
  console.log('=== DATA-G3 Kakao 지오코딩 후 비공개 자동등록 ===')
  console.log(`모드: ${MODE}${APPLY ? '' : ' (검증/계획만 — DB 변경 없음)'}`)
  loadEnv()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY, kakaoKey = process.env.KAKAO_REST_API_KEY
  console.log(`env: SUPABASE_URL ${url ? '✓' : '✗'}, SERVICE_ROLE_KEY ${key ? '✓(값 비표시)' : '✗'}, KAKAO_REST_API_KEY ${kakaoKey ? '✓(값 비표시)' : '✗'}`)
  if (!url || !key) { console.error('FAIL: Supabase env 누락'); process.exitCode = 2; return }
  if (!kakaoKey) { console.error('FAIL: KAKAO_REST_API_KEY 없음 → 작업 중단(DB 변경 없음)'); process.exitCode = 2; return }

  const recs = (() => { const rows = parseCsv(readFileSync(CSV_PATH, 'utf8')); const h = rows[0]; return rows.slice(1).filter((r) => r.length >= h.length).map((r) => Object.fromEntries(h.map((c, i) => [c, r[i]]))) })()
  let targets = recs.filter((r) => TARGET_SLUGS.includes(r.slug) && ALLOWED_STATUS.has(r.status))
  if (ONLY) targets = targets.filter((r) => ONLY.has(r.slug))
  console.log(`대상 ${targets.length}개`)

  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
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
    const rec = { status: '', slug: r.slug, name: r.name, restaurant_id: '', is_published: '', area: r.area, category: r.category, address: r.address, lat: '', lng: '', kakao_map_url: '', geocode_method: '', geocode_confidence: '', appearance_status: '', duplicate_status: '', field_status: '', price_needs_review: 'false', note: '' }

    // 강중복(slug/name-norm/addr-exact). video_url 단독은 약중복 note.
    const strong = []
    if (bySlug.has(r.slug)) strong.push('slug')
    if (nameSet.has(norm(r.name))) strong.push('name')
    if (norm(r.address) && addrSet.has(norm(r.address))) strong.push('address')
    const weakVideo = trimOrNull(r.video_url) && videoSet.has(r.video_url)
    rec.duplicate_status = strong.length ? 'strong:' + strong.join('+') : (weakVideo ? 'weak:shared_video_url' : 'unique')
    if (weakVideo) rec.note = '기존 식당과 같은 기사/영상 URL 공유(약중복, 등록 허용)'
    if (bySlug.has(r.slug)) { rec.status = 'skipped_existing'; results.push(rec); continue }
    if (strong.length) { rec.status = 'skipped_duplicate'; rec.note = `강중복: ${strong.join(', ')}`; results.push(rec); continue }

    // 필수필드(좌표 제외 — 좌표는 지오코딩으로 확보). price 기본값.
    const missing = REQUIRED.filter((f) => !trimOrNull(r[f]))
    if (!VALID_SOURCE_TYPES.has(String(r.source_type).trim())) missing.push('source_type(유효값)')
    if (!trimOrNull(r.video_url)) missing.push('video_url')
    if (!trimOrNull(r.description)) missing.push('description')
    let priceText = trimOrNull(r.price_text)
    if (!priceText || /확인 필요/.test(priceText)) { priceText = PRICE_DEFAULT; rec.price_needs_review = 'true' }
    if (missing.length) { rec.status = 'skipped_missing_required'; rec.field_status = `누락: ${missing.join(', ')}`; rec.note = (rec.note ? rec.note + ' / ' : '') + rec.field_status; results.push(rec); continue }
    rec.field_status = 'ok'

    // 지오코딩
    const g = await geocode(kakaoKey, r)
    if (g.status !== 'ok') {
      rec.status = g.status === 'ambiguous' ? 'skipped_geocoding_ambiguous' : 'skipped_geocoding_failed'
      rec.note = (rec.note ? rec.note + ' / ' : '') + (g.reason || '지오코딩 실패')
      results.push(rec); continue
    }
    rec.lat = g.lat; rec.lng = g.lng; rec.geocode_method = g.method; rec.geocode_confidence = g.confidence
    rec.kakao_map_url = trimOrNull(r.kakao_map_url) || g.kakao_url || ''

    if (!APPLY) { rec.status = 'dry_run_planned'; rec.is_published = false; rec.appearance_status = 'planned'; results.push(rec); continue }

    // INSERT restaurants(is_published=false)
    const { data: ins, error: insErr } = await sb.from('restaurants').insert({
      slug: trimOrNull(r.slug), name: trimOrNull(r.name), area: trimOrNull(r.area), address: trimOrNull(r.address),
      lat: g.lat, lng: g.lng, category: trimOrNull(r.category), main_menu: trimOrNull(r.main_menu), price_text: priceText,
      source_type: String(r.source_type).trim(), source_title: trimOrNull(r.source_title),
      creator_name: null, program_name: trimOrNull(r.source_title), episode_title: trimOrNull(r.episode_title),
      broadcast_date: fullDateOrNull(r.broadcast_date), description: trimOrNull(r.description), video_url: trimOrNull(r.video_url),
      kakao_map_url: rec.kakao_map_url || null, is_published: false,
    }, { defaultToNull: false }).select('id').single()
    if (insErr || !ins) { rec.status = 'failed_insert'; rec.note = (rec.note ? rec.note + ' / ' : '') + `INSERT 실패: ${insErr?.message ?? '-'}`; results.push(rec); continue }
    rec.restaurant_id = ins.id; rec.is_published = false

    const { error: appErr } = await sb.from('restaurant_appearances').insert({
      restaurant_id: ins.id, source_type: String(r.source_type).trim(), source_title: trimOrNull(r.source_title),
      program_name: trimOrNull(r.source_title), creator_name: null, episode_title: trimOrNull(r.episode_title),
      broadcast_date: fullDateOrNull(r.broadcast_date), video_url: trimOrNull(r.video_url), candidate_id: null, note: 'DATA-G3 Kakao 지오코딩 자동등록',
    }, { defaultToNull: false })
    if (appErr) { await sb.from('restaurants').delete().eq('id', ins.id); rec.status = 'failed_appearance_insert'; rec.appearance_status = 'failed(rollback)'; rec.note = (rec.note ? rec.note + ' / ' : '') + `appearance 실패 롤백: ${appErr.message}`; results.push(rec); continue }
    rec.appearance_status = 'inserted'; rec.status = 'inserted_private'; results.push(rec)
  }

  const byStatus = {}; for (const r of results) byStatus[r.status] = (byStatus[r.status] || 0) + 1
  console.log('\n── 요약 ──'); for (const [k, v] of Object.entries(byStatus)) console.log(`  ${k}: ${v}`)
  const { count: pubAfter } = await sb.from('restaurants').select('*', { count: 'exact', head: true }).eq('is_published', true)
  const { count: totalAfter } = await sb.from('restaurants').select('*', { count: 'exact', head: true })
  console.log(`공개 ${pubBefore}→${pubAfter ?? '?'}, 전체 ${totalBefore}→${totalAfter ?? '?'}`)

  const reportsDir = join(here, '..', 'reports')
  const cols = ['status', 'slug', 'name', 'restaurant_id', 'is_published', 'area', 'category', 'address', 'lat', 'lng', 'kakao_map_url', 'geocode_method', 'geocode_confidence', 'appearance_status', 'duplicate_status', 'field_status', 'price_needs_review', 'note']
  writeFileSync(join(reportsDir, 'import-new-restaurant-candidates-g1-kakao.csv'), [cols.join(',')].concat(results.map((r) => cols.map((c) => csvCell(r[c])).join(','))).join('\n') + '\n')
  const md = ['# 나온집 DATA-G3 Kakao 지오코딩 자동등록 결과', '', `- 모드: ${MODE}`, `- 대상: ${targets.length}`, '- status: ' + (Object.entries(byStatus).map(([k, v]) => `${k}=${v}`).join(', ') || '없음'), `- 공개 ${pubBefore}→${pubAfter ?? '?'}, 전체 ${totalBefore}→${totalAfter ?? '?'}`, '',
    '| status | slug | 식당명 | lat | lng | method/conf | private | appearance | price재검토 | note |', '|---|---|---|---|---|---|---|---|---|---|',
    ...results.map((r) => `| ${r.status} | ${r.slug} | ${r.name} | ${r.lat} | ${r.lng} | ${r.geocode_method}/${r.geocode_confidence} | ${r.is_published} | ${r.appearance_status} | ${r.price_needs_review} | ${String(r.note).replace(/\|/g, '/')} |`), '', APPLY ? '' : '※ dry-run 입니다.'].join('\n')
  writeFileSync(join(reportsDir, 'import-new-restaurant-candidates-g1-kakao.md'), md)
  console.log('reports/import-new-restaurant-candidates-g1-kakao.{md,csv} 생성 완료.')
}
main().catch((e) => { console.error('FAIL: 예외 —', e?.message ?? String(e)); process.exitCode = 2 })
