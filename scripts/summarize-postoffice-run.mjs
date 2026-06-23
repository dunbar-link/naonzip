/**
 * 나온집 우슐랭 dry-run 결과 요약 (read-only) — register-postoffice-candidates.mjs 의 run-*.json 후보별 요약.
 *
 * 반복되는 inline `node -e "require('./reports/.../run-*.json')..."` 권한 프롬프트를 이 고정 명령으로 대체한다.
 *   npm run candidates:run -- --latest
 *   npm run candidates:run -- --file reports/postoffice-guide-audit/postoffice-register-run-YYYYMMDD-HHMMSS.json
 *
 * 동작: dry-run JSON 읽어 후보별 status/area/category/place_id/slug/dup·near/image + 요약 출력.
 *       --latest = reports/postoffice-guide-audit 의 최신 postoffice-register-run-*.json.
 * 안전: read-only(JSON 읽기만). 파일·DB·Storage·배포·env·git 변경 0. Node 내장(fs/path/url)만, 외부 패키지 0.
 * 종료코드: 0 정상 / 2 (대상 없음·파일 없음·JSON 파싱 실패·candidates 없음).
 */
import process from 'node:process'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const RUN_DIR = join(here, '..', 'reports', 'postoffice-guide-audit')

const argv = process.argv.slice(2)
function opt(name, def = null) {
  const eq = argv.find((a) => a.startsWith(`--${name}=`))
  if (eq) return eq.slice(name.length + 3)
  const i = argv.indexOf(`--${name}`)
  if (i !== -1 && argv[i + 1] && !argv[i + 1].startsWith('--')) return argv[i + 1]
  return def
}
const LATEST = argv.includes('--latest')
const FILE = opt('file', null)

function fail(msg) { console.error('BLOCKED: ' + msg); process.exitCode = 2 }

function resolveTarget() {
  if (FILE) return (FILE.includes('\\') || FILE.includes('/')) ? FILE : join(RUN_DIR, FILE)
  if (LATEST) {
    if (!existsSync(RUN_DIR)) return null
    const runs = readdirSync(RUN_DIR).filter((f) => /^postoffice-register-run-.*\.json$/.test(f)).sort()
    return runs.length ? join(RUN_DIR, runs[runs.length - 1]) : null
  }
  return null
}

const target = resolveTarget()
if (!target) {
  fail('대상 JSON 없음 — --latest 또는 --file <path> 필요')
} else if (!existsSync(target)) {
  fail(`파일 없음 — ${target}`)
} else {
  let j = null
  try { j = JSON.parse(readFileSync(target, 'utf8')) } catch (e) { fail(`JSON 파싱 실패 — ${e?.message || e}`) }
  const cands = j && Array.isArray(j.candidates) ? j.candidates : null
  if (j && !cands) {
    fail('candidates 배열 없음(우슐랭 run JSON 아님?)')
  } else if (cands && !cands.length) {
    fail('candidates 비어있음')
  } else if (cands) {
    const s = j.summary || {}
    const fname = target.split(/[\\/]/).pop()
    console.log(`candidates:run | ${fname} | mode ${j.mode || '-'} | total ${cands.length}`)
    console.log(`NEW_READY ${s.new_ready ?? '-'} / ALREADY ${s.already ?? '-'} / REVIEW ${s.review ?? '-'} / BLOCKED ${s.blocked ?? '-'} | IMAGE ok${s.image_ok ?? '-'}/pend${s.image_pending ?? '-'}/inval${s.image_invalid ?? '-'}`)
    for (const c of cands) {
      const d = c.dup || {}
      const near = (d.near && d.near.length) ? d.near.join(',') : '-'
      console.log(`  [${c.status}] ${c.input} | ${c.area || '-'} | ${c.category || '(미정)'} | place=${c.csv?.place || '-'} | slug=${c.slug || '-'} | dup s${d.slug ?? 0}/n${d.name ?? 0}/p${d.phone ?? 0}/pl${d.place ?? 0} near=${near} | img=${c.imageStatus || '-'}`)
    }
  }
}
