/**
 * 나온집 썸네일 입력 검증 (read-only) — 등록 직전 입력 폴더 사진 존재·크기 확인용 고정 명령.
 *
 * 반복되는 PowerShell Get-ChildItem / Test-Path 권한 프롬프트를 이 고정 명령으로 대체한다.
 *   npm run thumbs:check -- --names postoffice-bukgu-chen-china.jpg,postoffice-suyeong-soba-jaewuujae.jpg
 *   npm run thumbs:check -- --contains chen-china,soba-jaewuujae
 *   node scripts/check-thumbnail-inputs.mjs --dir "C:\work\naonzip-thumbnail-input" --names ...
 *
 * 동작: --names(정확 파일명) 또는 --contains(키워드 포함) 으로 입력 폴더 이미지 존재·크기 확인.
 * 판정: 존재&크기>0=PASS / 0 byte=BLOCKED / 누락=BLOCKED / 비이미지 확장자=WARNING.
 * 안전: read-only(fs 읽기만). 변환·삭제·이동·복사·리포트 생성 0. Node 내장(fs/path/process)만, 외부 패키지 0.
 * 종료코드: 0 PASS(전부 통과) / 1 WARNING / 2 BLOCKED(누락·0byte·입력 없음·폴더 없음).
 *
 * 옵션:
 *   --dir <path>      입력 폴더 (기본 C:\work\naonzip-thumbnail-input)
 *   --names <list>    "a.jpg,b.jpg" 정확 파일명 존재·크기 확인
 *   --contains <list> "키워드,.." 키워드 포함 이미지 파일 1개 이상 확인
 */
import process from 'node:process'
import { existsSync, statSync, readdirSync } from 'node:fs'
import { join, extname } from 'node:path'

const argv = process.argv.slice(2)
function opt(name, def = null) {
  const eq = argv.find((a) => a.startsWith(`--${name}=`))
  if (eq) return eq.slice(name.length + 3)
  const i = argv.indexOf(`--${name}`)
  if (i !== -1 && argv[i + 1] && !argv[i + 1].startsWith('--')) return argv[i + 1]
  return def
}
const list = (v) => String(v || '').split(',').map((s) => s.trim()).filter(Boolean)

const IMG_EXT = ['.jpg', '.jpeg', '.png', '.webp']
const DIR = opt('dir', 'C:\\work\\naonzip-thumbnail-input')
const NAMES = list(opt('names', ''))
const CONTAINS = list(opt('contains', ''))

if (!NAMES.length && !CONTAINS.length) {
  console.error('BLOCKED: 검사 대상 없음 — --names "a.jpg,b.jpg" 또는 --contains "키워드,.." 필요')
  process.exit(2)
}
if (!existsSync(DIR)) {
  console.error(`BLOCKED: 입력 폴더 없음 — ${DIR}`)
  process.exit(2)
}

const sizeOf = (full) => { try { return statSync(full).size } catch { return -1 } }
const files = readdirSync(DIR).filter((f) => IMG_EXT.includes(extname(f).toLowerCase()))

const results = []
// --names: 정확 파일명 존재·크기
for (const nm of NAMES) {
  const full = join(DIR, nm)
  if (!existsSync(full)) { results.push({ label: nm, verdict: 'BLOCKED', note: '없음' }); continue }
  const size = sizeOf(full)
  const ext = extname(nm).toLowerCase()
  if (size === 0) { results.push({ label: nm, verdict: 'BLOCKED', note: '0 byte' }); continue }
  if (!IMG_EXT.includes(ext)) { results.push({ label: nm, verdict: 'WARNING', note: `비이미지 확장자 ${ext || '(없음)'} size=${size}` }); continue }
  results.push({ label: nm, verdict: 'PASS', note: `size=${size} ${ext}` })
}
// --contains: 키워드 포함 이미지 1개 이상
for (const kw of CONTAINS) {
  const matched = files.filter((f) => f.includes(kw))
  if (!matched.length) { results.push({ label: kw, verdict: 'BLOCKED', note: '매칭 이미지 없음' }); continue }
  const sized = matched.map((f) => ({ f, size: sizeOf(join(DIR, f)) }))
  const good = sized.find((x) => x.size > 0)
  if (!good) { results.push({ label: kw, verdict: 'BLOCKED', note: `매칭 ${matched.length} 전부 0 byte` }); continue }
  results.push({ label: kw, verdict: 'PASS', note: `매칭 ${matched.length} (${good.f} size=${good.size})` })
}

const pass = results.filter((r) => r.verdict === 'PASS').length
const warn = results.filter((r) => r.verdict === 'WARNING').length
const blocked = results.filter((r) => r.verdict === 'BLOCKED').length
const overall = blocked ? 'BLOCKED' : warn ? 'WARNING' : 'PASS'

console.log(`input ${DIR} | ${overall} | pass ${pass} warn ${warn} blocked ${blocked} (총 ${results.length})`)
for (const r of results) console.log(`  [${r.verdict}] ${r.label} ${r.note}`)

process.exit(blocked ? 2 : warn ? 1 : 0)
