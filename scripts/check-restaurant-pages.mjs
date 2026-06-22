/**
 * 나온집 상세 페이지 검증 (read-only) — 신규 등록 후 200·식당명 노출 확인용 고정 명령.
 *
 * 반복되는 PowerShell foreach / Invoke-WebRequest / $() 권한 프롬프트를 이 고정 명령으로 대체한다.
 *   npm run restaurants:check -- --base http://localhost:3000 --items "slug=이름,slug2=이름2"
 *   node scripts/check-restaurant-pages.mjs --base https://naonzip.vercel.app --items "slug=이름"
 *
 * 동작: 각 slug 에 GET {base}/restaurants/{slug} → HTTP status + 응답 HTML 에 식당명 포함 검사.
 * 판정: 200 & 이름 포함=PASS / 200 & 이름 없음=WARNING / 200 아님=BLOCKED / 연결 실패=BLOCKED(서버 미기동).
 * 안전: read-only(HTTP GET 만). 파일·DB·Storage·배포·env·git 변경 0. Node 내장(http/https/url)만, 외부 패키지 0.
 *       agent:false 로 keep-alive 비활성(요청마다 소켓 닫음) → Windows process.exit 핸들 경합 방지.
 * 종료코드: 0 PASS(전부 통과), 1 WARNING(이름 누락 있음), 2 BLOCKED(비200/연결 실패/입력 없음).
 *
 * 옵션:
 *   --base <url>     기본 http://localhost:3000 (끝 슬래시 무시)
 *   --items <list>   "slug=이름,slug2=이름2" (이름 생략 시 slug 만, status 만 검사)
 *   --timeout <ms>   요청 타임아웃 (기본 10000)
 */
import process from 'node:process'
import http from 'node:http'
import https from 'node:https'
import { URL } from 'node:url'

const argv = process.argv.slice(2)
function opt(name, def = null) {
  const eq = argv.find((a) => a.startsWith(`--${name}=`))
  if (eq) return eq.slice(name.length + 3)
  const i = argv.indexOf(`--${name}`)
  if (i !== -1 && argv[i + 1] && !argv[i + 1].startsWith('--')) return argv[i + 1]
  return def
}

const BASE = String(opt('base', 'http://localhost:3000')).replace(/\/+$/, '')
const TIMEOUT = parseInt(opt('timeout', '10000'), 10) || 10000
const ITEMS_RAW = opt('items', '') || ''

const items = ITEMS_RAW.split(',').map((s) => s.trim()).filter(Boolean).map((pair) => {
  const eq = pair.indexOf('=')
  if (eq === -1) return { slug: pair, name: null }
  return { slug: pair.slice(0, eq).trim(), name: pair.slice(eq + 1).trim() || null }
})

if (!items.length) {
  console.error('BLOCKED: 검사 대상 없음 — --items "slug=이름,slug2=이름2" 필요')
  process.exit(2)
}

// Node 내장 http/https 로 GET (agent:false → 소켓 즉시 종료, 리다이렉트 비추적: 상세는 200 직접 응답)
function getPage(urlStr) {
  return new Promise((resolve) => {
    let u
    try { u = new URL(urlStr) } catch { return resolve({ error: 'BAD_URL' }) }
    const mod = u.protocol === 'https:' ? https : http
    const req = mod.request(u, { method: 'GET', agent: false, headers: { 'user-agent': 'naonzip-restaurants-check' } }, (res) => {
      let body = ''
      res.setEncoding('utf8')
      res.on('data', (c) => { body += c })
      res.on('end', () => resolve({ status: res.statusCode, body }))
    })
    req.on('error', (e) => resolve({ error: e?.code || e?.message || String(e) }))
    req.setTimeout(TIMEOUT, () => { req.destroy(); resolve({ error: 'TIMEOUT' }) })
    req.end()
  })
}

const results = []
let serverDown = false
for (const it of items) {
  const url = `${BASE}/restaurants/${it.slug}`
  const r = await getPage(url)
  if (r.error) {
    if (/ECONNREFUSED|ENOTFOUND|ECONNRESET|EAI_AGAIN|TIMEOUT|BAD_URL/i.test(r.error)) serverDown = true
    results.push({ slug: it.slug, name: it.name, status: 0, nameShown: null, verdict: 'BLOCKED', error: r.error })
    continue
  }
  const nameShown = it.name ? r.body.includes(it.name) : null
  let verdict
  if (r.status !== 200) verdict = 'BLOCKED'
  else if (it.name && !nameShown) verdict = 'WARNING'
  else verdict = 'PASS'
  results.push({ slug: it.slug, name: it.name, status: r.status, nameShown, verdict, error: null })
}

const pass = results.filter((r) => r.verdict === 'PASS').length
const warn = results.filter((r) => r.verdict === 'WARNING').length
const blocked = results.filter((r) => r.verdict === 'BLOCKED').length
const overall = blocked ? 'BLOCKED' : warn ? 'WARNING' : 'PASS'

console.log(`base ${BASE} | ${overall} | pass ${pass} warn ${warn} blocked ${blocked} (총 ${results.length})`)
if (serverDown) console.log('! 연결 실패 감지 — 대상 서버 미기동 의심(로컬은 npm start 후 재시도, 운영은 배포 완료 후 재시도)')
for (const r of results) {
  const nm = r.name === null ? 'name-' : r.nameShown ? 'name✓' : 'name✗'
  console.log(`  [${r.verdict}] ${r.slug} status=${r.status} ${nm}${r.error ? ` err=${r.error}` : ''}`)
}

process.exit(blocked ? 2 : warn ? 1 : 0)
