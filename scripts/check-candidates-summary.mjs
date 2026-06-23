/**
 * 나온집 우슐랭 후보 현황 요약 (read-only) — CSV 마스터 92곳 ↔ DB 등록 우슐랭 대조.
 *
 * 매 차수 등록 계획 때 메모리·CSV 수동 대조를 줄이기 위한 고정 요약 명령.
 *   npm run candidates:summary
 *
 * 동작: CSV(postoffice-busan-2026.csv) 로드 + DB restaurants(source_title="우체국 추천 맛집가이드 2026") 조회 →
 *       place_id 매칭으로 등록/미등록 분류 + 등록 category 분포 + 미등록 CSV분류(READY/REVIEW) + 우체국별 잔여.
 * 안전: read-only(CSV 읽기 + DB select 만). DB/Storage/파일 write 0. 비밀키 미출력(존재 여부도 안 찍음).
 * 종료코드: 0 정상 / 2 오류(CSV·env·조회 실패).
 * 주의: process.exit() 미사용 — supabase(undici) keep-alive ↔ Windows process.exit 경합(libuv assert) 회피.
 *       process.exitCode 만 설정하고 자연 종료(register-postoffice-batchN.mjs 와 동일 패턴).
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const ROOT = join(here, '..')
const CSV_PATH = join(ROOT, 'reports', 'postoffice-guide-audit', 'postoffice-busan-2026.csv')
const SOURCE_NAME = '우체국 추천 맛집가이드 2026'

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

// 따옴표 지원 CSV 파서 (register-postoffice-candidates.mjs 와 동일 로직, BOM 제거)
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
      else if (c === '\r') { /* skip */ }
      else cur += c
    }
  }
  if (cur !== '' || row.length) { row.push(cur); rows.push(row) }
  return rows
}
const placeIdFromUrl = (u) => (String(u || '').match(/place\.map\.kakao\.com\/(\d+)/) || [])[1] || ''

async function main() {
  loadEnv()

  // ── CSV 마스터 ──
  let rows
  try { rows = parseCsv(readFileSync(CSV_PATH, 'utf8')).filter((r) => r.some((c) => c.trim())) }
  catch (e) { console.error(`FAIL: CSV 로드 실패 — ${e?.message || e}`); process.exitCode = 2; return }
  if (!rows.length) { console.error('FAIL: CSV 비어있음'); process.exitCode = 2; return }
  const header = rows[0].map((h) => h.trim())
  const idx = Object.fromEntries(header.map((h, i) => [h, i]))
  const need = ['official_restaurant_name', 'kakao_place_id', 'classification', 'post_office']
  const missing = need.filter((c) => !(c in idx))
  if (missing.length) { console.error(`FAIL: CSV 필수 컬럼 누락: ${missing.join(', ')}`); process.exitCode = 2; return }
  const csv = rows.slice(1).map((r) => ({
    name: (r[idx.official_restaurant_name] || '').trim(),
    place: (r[idx.kakao_place_id] || '').trim(),
    classification: (r[idx.classification] || '').trim(),
    post_office: (r[idx.post_office] || '').trim(),
  }))

  // ── DB 등록 우슐랭 ──
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) { console.error('FAIL: Supabase env 누락(.env.local)'); process.exitCode = 2; return }
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data: db, error } = await sb.from('restaurants').select('slug,name,kakao_map_url,category,source_title,is_published')
  if (error) { console.error(`FAIL: restaurants 조회 — ${error.code ?? '-'} ${error.message}`); process.exitCode = 2; return }

  const guide = (db || []).filter((r) => r.source_title === SOURCE_NAME)
  const pubGuide = guide.filter((r) => r.is_published)
  const guidePlaces = new Set(guide.map((r) => placeIdFromUrl(r.kakao_map_url)).filter(Boolean))

  // ── CSV ↔ DB 대조 (place_id) ──
  const registered = csv.filter((c) => c.place && guidePlaces.has(c.place))
  const unregistered = csv.filter((c) => !(c.place && guidePlaces.has(c.place)))

  // 등록 공개 우슐랭 category 분포
  const catTally = {}
  for (const r of pubGuide) catTally[r.category || '(미상)'] = (catTally[r.category || '(미상)'] || 0) + 1
  const catStr = Object.entries(catTally).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}${v}`).join(' ') || '(없음)'

  // 미등록 CSV classification 분포
  const ready = unregistered.filter((c) => c.classification === 'READY_FOR_IMAGE')
  const review = unregistered.filter((c) => c.classification === 'REVIEW')
  const other = unregistered.filter((c) => c.classification !== 'READY_FOR_IMAGE' && c.classification !== 'REVIEW')

  // 미등록 READY 우체국별
  const byPost = {}
  for (const c of ready) byPost[c.post_office] = (byPost[c.post_office] || 0) + 1
  const postStr = Object.entries(byPost).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}`).join(' / ') || '(없음)'

  // ── 출력 (ops:summary 스타일) ──
  console.log(`candidates:summary | CSV ${csv.length} | 등록 ${registered.length} / 미등록 ${unregistered.length} (공개 우슐랭 ${pubGuide.length})`)
  console.log(`등록 category: ${catStr}`)
  console.log(`미등록 CSV분류: READY_FOR_IMAGE ${ready.length} / REVIEW ${review.length}${other.length ? ` / 기타 ${other.length}` : ''}`)
  console.log(`  ※ READY 중 카페·베이커리·디저트(SKIP 후보)·좌표 120m 근접은 등록 시 별도 판단(REVIEW 전환 가능)`)
  console.log(`미등록 READY 우체국별: ${postStr}`)
}
main().catch((e) => { console.error('FAIL 예외:', e?.message ?? String(e)); process.exitCode = 2 })
