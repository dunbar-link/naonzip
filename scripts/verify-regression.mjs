/**
 * 나온집 회귀검증 게이트 (verify:regression) — dependency-free.
 *
 * 기존 check 스크립트들을 하나로 묶어 핵심 기능 회귀를 1회 검증한다.
 * 수정 작업(데이터/스크립트/내용) 후 이 1개 명령으로 핵심 기능이 깨졌는지 자동 확인한다.
 *   실행: npm run verify:regression
 *   종료코드: 0 PASS / 1 FAIL.
 *
 * 검증 항목(순차):
 *   1) quality:audit:no-report → P0=0, trust source 0개=0 (회귀 핵심)
 *   2) ops:summary           → thumbMiss=0, slugDup=0, sitemap PASS
 *   3) sitemap:check         → sitemap restaurantUrls == 공개 식당 수(pub)
 *   4) restaurants:check     → 대표 상세 페이지 200 (운영 GET smoke)
 *   5) search:check          → 대표 식당 검색 노출 (운영 GET smoke)
 *   6) git diff --check      → 공백/충돌 마커 0
 *   7) git status            → reports/data-quality 의도 외 변경 없음(no-report 게이트)
 *
 * known warn(허용, FAIL 아님): 공개 phone 누락 4 / NAME_MATCH_REVIEW 1(도희네).
 * 안전: DB/Storage write 0. 운영 URL은 GET smoke만(destructive 없음). reports/data-quality 미생성(--no-report).
 *       Node 내장(child_process/process)만 사용, 외부 의존성 0.
 */
import { execFileSync } from 'node:child_process'
import process from 'node:process'

const BASE = 'https://naonzip.vercel.app'
const SITEMAP = `${BASE}/sitemap.xml`
const SAMPLE_SLUG = '2tv-haeundae-sundori-boribap'
// 대표 샘플: 신규등록·이전보정·false-positive 각 케이스 커버
const REST_ITEMS = '2tv-haeundae-sundori-boribap=순돌이 보리밥,baekban-haeundae-yangs-yanggopchang=양가네 양곱창,hibab-cheongsa-hoe-center=청사포 도희네 조개구이'
const SEARCH_ITEMS = '순돌이 보리밥,양가네 양곱창'
const TRUST_MISSING_KEYS = ['BROADCAST_SOURCE_MISSING', 'GUIDE_SOURCE_MISSING', 'LEGACY_MANUAL', 'SOURCE_NOT_REQUIRED_REVIEW']

function exec(file, args) {
  try { return { code: 0, out: execFileSync(file, args, { encoding: 'utf8', timeout: 120000 }) } }
  catch (e) { return { code: typeof e.status === 'number' ? e.status : 1, out: String(e.stdout || '') + String(e.stderr || '') } }
}
const num = (re, s, d = -1) => { const m = s.match(re); return m ? parseInt(m[1], 10) : d }
// 동기 대기(외부 의존 0).
function sleepSync(ms) { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms) }
// 운영/네트워크 fetch 단계용 1회 재시도 — transient(일시 fetch 실패) false FAIL 완화.
//   실패를 숨기지 않는다: 재시도 후에도 exit!=0 이면 그 결과를 그대로 반환해 FAIL 처리한다.
function execRetry(label, file, args, { retries = 1, waitMs = 1500 } = {}) {
  let r = exec(file, args)
  if (r.code === 0) return r
  for (let i = 0; i < retries; i++) {
    console.log(`    ↻ ${label}: first attempt failed (exit ${r.code}) — retrying once after ${waitMs}ms...`)
    sleepSync(waitMs)
    r = exec(file, args)
    console.log(`    ${r.code === 0 ? '✓' : '✗'} ${label}: ${r.code === 0 ? 'retry passed' : 'retry failed (exit ' + r.code + ')'}`)
    if (r.code === 0) return r
  }
  return r
}

const results = []
const step = (label, ok, detail) => { results.push({ label, ok }); console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${label} — ${detail}`) }

console.log('=== 나온집 Regression Gate (verify:regression) ===\n')

// 1) quality:audit:no-report — P0=0, trust 0개=0
const qa = exec('node', ['scripts/audit-public-restaurant-quality.mjs', '--no-report'])
const p0 = num(/"P0":(\d+)/, qa.out, 0)
const trustMissing = TRUST_MISSING_KEYS.reduce((s, k) => s + num(new RegExp(`"${k}":(\\d+)`), qa.out, 0), 0)
step('quality:audit P0=0 / trust source 0개=0', qa.code === 0 && p0 === 0 && trustMissing === 0,
  `P0=${p0}, trust_missing=${trustMissing}, exit=${qa.code}`)

// 2) ops:summary — thumbMiss=0, slugDup=0, sitemap PASS
const ops = execRetry('ops:summary', 'node', ['scripts/ops-check-summary.mjs'])
const pub = num(/pub (\d+)/, ops.out)
const thumbMiss = num(/thumbMiss (\d+)/, ops.out)
const slugDup = num(/slugDup (\d+)/, ops.out)
const sitemapPass = /sitemap PASS/.test(ops.out)
step('ops thumbMiss=0 / slugDup=0 / sitemap PASS', ops.code === 0 && thumbMiss === 0 && slugDup === 0 && sitemapPass,
  `pub=${pub}, thumbMiss=${thumbMiss}, slugDup=${slugDup}, sitemapPASS=${sitemapPass}, exit=${ops.code}`)

// 3) sitemap:check — restaurantUrls == pub
const sm = execRetry('sitemap:check', 'node', ['scripts/check-sitemap-slugs.mjs', '--url', SITEMAP, '--slugs', SAMPLE_SLUG])
const restUrls = num(/restaurantUrls=(\d+)/, sm.out)
step('sitemap restaurantUrls == 공개 식당 수', sm.code === 0 && pub > 0 && restUrls === pub,
  `restaurantUrls=${restUrls}, pub=${pub}, exit=${sm.code}`)

// 4) restaurants:check — 대표 상세 200
const rc = execRetry('restaurants:check', 'node', ['scripts/check-restaurant-pages.mjs', '--base', BASE, '--items', REST_ITEMS])
step('대표 상세 페이지 200', rc.code === 0,
  rc.code === 0 ? '대표 식당 status=200' : `exit=${rc.code} — 운영(${BASE}) 네트워크/ISR 확인 필요`)

// 5) search:check — 대표 검색
const scr = execRetry('search:check', 'node', ['scripts/check-search-results.mjs', '--base', BASE, '--tab', 'broadcast', '--items', SEARCH_ITEMS])
step('대표 식당 검색 노출', scr.code === 0,
  scr.code === 0 ? '검색/필터 노출 확인' : `exit=${scr.code} — 운영(${BASE}) 네트워크 확인 필요`)

// 6) git diff --check
const gd = exec('git', ['diff', '--check'])
step('git diff --check (공백 이슈 0)', gd.code === 0, gd.code === 0 ? 'clean' : '공백/충돌 마커 존재')

// 7) git status — reports/data-quality 의도 외 변경 금지
const gs = exec('git', ['status', '--short'])
const dqDirty = /reports\/data-quality\//.test(gs.out)
step('reports/data-quality 미변경(no-report 게이트)', !dqDirty, dqDirty ? 'data-quality 변경 감지 → no-report 위반' : '미변경')

console.log('\n── known warn (허용, FAIL 아님) ──')
console.log('  · 공개 phone 누락 4 (외부 소스에 전화번호 없음)')
console.log('  · NAME_MATCH_REVIEW 1 = 도희네(hibab-cheongsa-hoe-center): DB 정확, audit 가시성 항목')

const passN = results.filter((r) => r.ok).length
const allOk = passN === results.length
console.log(`\n=== Regression Gate: ${allOk ? 'PASS' : 'FAIL'} (${passN}/${results.length}) ===`)
console.log('git status --short:')
process.stdout.write(gs.out && gs.out.trim() ? gs.out : '  (clean)\n')
process.exit(allOk ? 0 : 1)
