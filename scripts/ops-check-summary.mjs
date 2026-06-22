/**
 * 나온집 운영 점검 요약 (read-only) — 반복 권한 프롬프트 줄이기용 고정 래핑.
 *
 * 긴 파이프 + inline `node -e` 대신 이 고정 명령으로 ops-check 요약을 본다:
 *   node scripts/ops-check-summary.mjs
 *   (package script 추가 시) npm run ops:summary
 *
 * 동작: 내부에서 `scripts/ops-check.mjs`(read-only)를 실행 → stdout JSON 파싱 → 사람이 보기 쉬운 요약만 출력.
 * 안전: 이 스크립트는 read-only다. DB/Storage write·파일 쓰기·git·배포·삭제·env 변경 없음.
 *       ops-check.mjs 도 read-only(DB select + stdout JSON)만 수행한다.
 * 종료코드: ops-check.mjs 의 종료코드를 그대로 전달. 실행/파싱 실패 시 2.
 */
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const opsCheck = join(here, 'ops-check.mjs')

let raw = ''
let code = 0
try {
  raw = execFileSync(process.execPath, [opsCheck], { encoding: 'utf8', cwd: join(here, '..'), maxBuffer: 16 * 1024 * 1024 })
} catch (e) {
  // ops-check 가 non-zero 로 끝나도 stdout JSON 은 살아있을 수 있다.
  raw = (e && e.stdout) ? String(e.stdout) : ''
  code = (e && typeof e.status === 'number') ? e.status : 1
  if (!raw.trim()) {
    console.error('FAIL: ops-check.mjs 실행 실패 —', (e && e.message) ? e.message : String(e))
    process.exit(2)
  }
}

let j
try {
  j = JSON.parse(raw)
} catch {
  console.error('FAIL: ops-check 출력 JSON 파싱 실패. 원본 출력(앞 600자):')
  console.error(raw.slice(0, 600))
  process.exit(2)
}

const s = j.summary || {}
const db = (j.checks && j.checks.database && j.checks.database.counts) || {}
const dbWarn = (j.checks && j.checks.database && j.checks.database.warnReasons) || []
const sm = (j.checks && j.checks.sitemap) || {}
const pp = (j.checks && j.checks.publicPages) || {}
const doc = (j.checks && j.checks.documentConsistency) || {}

console.log(`status ${s.status} | pass ${s.pass} warn ${s.warning} blocked ${s.blocked}`)
console.log(`DB total ${db.total} pub ${db.published} thumbMiss ${db.publishedMissingThumbnail} slugDup ${db.slugDuplicates}`)
console.log(`sitemap ${sm.status} detail ${sm.detailUrlCount} pub ${sm.publishedCount} | ${sm.evidence ?? '-'}`)
console.log(`publicPages ${pp.status} | docs ${doc.status}`)
if (dbWarn.length) console.log(`DB warn: ${dbWarn.join(' / ')}`)

process.exit(code)
