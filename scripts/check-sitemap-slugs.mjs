/**
 * 나온집 sitemap slug 검증 (read-only) — sitemap.xml 에 지정 slug 포함·/restaurants/ URL 수 확인용 고정 명령.
 *
 * 반복되는 PowerShell Invoke-WebRequest + regex 권한 프롬프트를 이 고정 명령으로 대체한다.
 *   npm run sitemap:check -- --url http://localhost:3000/sitemap.xml --slugs postoffice-bukgu-chen-china,postoffice-suyeong-soba-jaewuujae
 *   npm run sitemap:check -- --url https://naonzip.vercel.app/sitemap.xml --slugs ...
 *
 * 동작: sitemap GET → HTTP status + /restaurants/ URL 개수 + 전달 slug 포함 여부.
 * 판정: 200 & 전 slug 포함=PASS / slug 누락=BLOCKED / 비200=BLOCKED / 연결 실패=BLOCKED(서버 미기동).
 * 안전: read-only HTTP GET(node:http/https, agent:false). 변경·리포트 생성 0. Node 내장만, 외부 패키지 0.
 * 종료코드: 0 PASS / 1 WARNING / 2 BLOCKED.
 *
 * 옵션:
 *   --url <url>     sitemap URL (기본 http://localhost:3000/sitemap.xml)
 *   --slugs <list>  "slugA,slugB" (필수)
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

const SITEMAP_URL = String(opt('url', 'http://localhost:3000/sitemap.xml'))
const TIMEOUT = parseInt(opt('timeout', '10000'), 10) || 10000
const SLUGS = String(opt('slugs', '') || '').split(',').map((s) => s.trim()).filter(Boolean)

if (!SLUGS.length) {
  console.error('BLOCKED: 검사 대상 없음 — --slugs "slugA,slugB" 필요')
  process.exit(2)
}

function getUrl(urlStr) {
  return new Promise((resolve) => {
    let u
    try { u = new URL(urlStr) } catch { return resolve({ error: 'BAD_URL' }) }
    const mod = u.protocol === 'https:' ? https : http
    const req = mod.request(u, { method: 'GET', agent: false, headers: { 'user-agent': 'naonzip-sitemap-check' } }, (res) => {
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

const r = await getUrl(SITEMAP_URL)
if (r.error) {
  console.log(`sitemap ${SITEMAP_URL} | BLOCKED | 연결 실패 (${r.error})`)
  if (/ECONNREFUSED|ENOTFOUND|ECONNRESET|EAI_AGAIN|TIMEOUT|BAD_URL/i.test(r.error)) {
    console.log('! 서버 미기동 의심(로컬은 npm start 후, 운영은 배포 완료 후 재시도)')
  }
  process.exit(2)
}
if (r.status !== 200) {
  console.log(`sitemap ${SITEMAP_URL} | BLOCKED | status=${r.status} (비200)`)
  process.exit(2)
}

const restCount = (r.body.match(/\/restaurants\//g) || []).length
const results = SLUGS.map((s) => ({ slug: s, found: r.body.includes(s) }))
const missing = results.filter((x) => !x.found)
const overall = missing.length ? 'BLOCKED' : 'PASS'

console.log(`sitemap ${SITEMAP_URL} | ${overall} | status=200 restaurantUrls=${restCount} slugs ${results.length - missing.length}/${results.length}`)
for (const x of results) console.log(`  [${x.found ? 'PASS' : 'BLOCKED'}] ${x.slug}${x.found ? '' : ' 누락'}`)

process.exit(missing.length ? 2 : 0)
