/**
 * 나온집 검색 결과 검증 (read-only) — 우슐랭 필터 + 일반 검색에 식당명 노출 확인용 고정 명령.
 *
 * 반복되는 PowerShell foreach / Where-Object / Invoke-WebRequest script block 권한 프롬프트를
 * 이 고정 명령으로 대체한다.
 *   npm run search:check -- --base http://localhost:3000 --tab postoffice --items "황령산 보쌈,비안리안"
 *   npm run search:check -- --base https://naonzip.vercel.app --tab postoffice --items "..."
 *
 * 검증: 1) 필터 GET /search?tab=<tab> → 각 식당명 HTML 포함?
 *       2) 검색 GET /search?q=<식당명> → HTML 포함?
 * 판정: 전 식당명 filter✓&search✓=PASS / 누락·비200·연결실패·items없음=BLOCKED.
 * 안전: read-only HTTP GET(node:http/https, agent:false). 변경·리포트 생성 0. Node 내장만, 외부 패키지 0.
 * 종료코드: 0 PASS / 2 BLOCKED.
 *
 * 옵션:
 *   --base <url>    기본 http://localhost:3000 (끝 슬래시 무시)
 *   --tab <tab>     기본 postoffice
 *   --items <list>  콤마 구분 식당명 (필수)
 *   --timeout <ms>  요청 타임아웃 (기본 10000)
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
const TAB = String(opt('tab', 'postoffice'))
const TIMEOUT = parseInt(opt('timeout', '10000'), 10) || 10000
const ITEMS = String(opt('items', '') || '').split(',').map((s) => s.trim()).filter(Boolean)

if (!ITEMS.length) {
  console.error('BLOCKED: 검사 대상 없음 — --items "식당명1,식당명2" 필요')
  process.exit(2)
}

function getUrl(urlStr) {
  return new Promise((resolve) => {
    let u
    try { u = new URL(urlStr) } catch { return resolve({ error: 'BAD_URL' }) }
    const mod = u.protocol === 'https:' ? https : http
    const req = mod.request(u, { method: 'GET', agent: false, headers: { 'user-agent': 'naonzip-search-check' } }, (res) => {
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
const downLike = (e) => /ECONNREFUSED|ENOTFOUND|ECONNRESET|EAI_AGAIN|TIMEOUT|BAD_URL/i.test(String(e))

// 1) 필터 페이지 1회 GET
const filterUrl = `${BASE}/search?tab=${encodeURIComponent(TAB)}`
const pf = await getUrl(filterUrl)
if (pf.error || pf.status !== 200) {
  const reason = pf.error ? `연결 실패(${pf.error})` : `status=${pf.status}`
  console.log(`search:check base=${BASE} tab=${TAB} | BLOCKED | 필터 페이지 ${reason}`)
  if (pf.error && downLike(pf.error)) console.log('! 서버 미기동 의심(로컬은 npm start 후, 운영은 배포 완료 후 재시도)')
  process.exit(2)
}

// 2) 각 식당명: 필터 포함 + 검색 페이지 포함
const results = []
for (const name of ITEMS) {
  const inFilter = pf.body.includes(name)
  const sr = await getUrl(`${BASE}/search?q=${encodeURIComponent(name)}`)
  let inSearch = false, searchErr = null
  if (sr.error || sr.status !== 200) searchErr = sr.error ? sr.error : `status=${sr.status}`
  else inSearch = sr.body.includes(name)
  results.push({ name, inFilter, inSearch, searchErr, verdict: (inFilter && inSearch) ? 'PASS' : 'BLOCKED' })
}

const filterOk = results.filter((r) => r.inFilter).length
const searchOk = results.filter((r) => r.inSearch).length
const blocked = results.filter((r) => r.verdict === 'BLOCKED').length
const overall = blocked ? 'BLOCKED' : 'PASS'

console.log(`search:check base=${BASE} tab=${TAB} | ${overall} | filter ${filterOk}/${results.length} search ${searchOk}/${results.length}`)
for (const r of results) {
  const f = r.inFilter ? 'filter✓' : 'filter✗'
  const s = r.inSearch ? 'search✓' : (r.searchErr ? `search✗(${r.searchErr})` : 'search✗')
  console.log(`  [${r.verdict}] ${r.name} ${f} ${s}`)
}

process.exit(blocked ? 2 : 0)
