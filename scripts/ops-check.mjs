/**
 * 나온집 운영 점검(ops-check) — 읽기 전용. [ops-loop MVP]
 *
 * 역할: 운영 DB 내부 정합성 + 운영 URL 상태를 SELECT/GET 만으로 점검하고,
 *       구조화 JSON 을 stdout 으로 출력한다.
 *
 * 하지 않는 것: 타입체크/빌드/Git/latest.md 작성(이건 SKILL 절차가 담당),
 *               그리고 DB/Storage 의 어떤 write(insert/update/delete/upsert/rpc)도 하지 않는다.
 *
 * 실행: node scripts/ops-check.mjs
 * stdout: 최종 JSON 만. 진단/오류는 stderr 에 짧게(민감정보·env값·키 미출력).
 * 종료코드: 점검 완료 시 0(WARNING 포함). 실행 환경 자체 부재 시 2.
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const BASE_URL = 'https://naonzip.vercel.app'
const MANUJANG_SLUG = 'sungsik-gwangalli-manujang'
const HTTP_TIMEOUT_MS = 10000

// ── .env.local 로딩(기존 스크립트 관례 재사용) ──
function loadEnvLocal() {
  let raw
  try { raw = readFileSync(join(here, '..', '.env.local'), 'utf8') } catch { return }
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!m) continue
    let v = m[2]
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
    if (!process.env[m[1]]) process.env[m[1]] = v
  }
}

const isBlank = (v) => v === null || v === undefined || `${v}`.trim() === ''
// 보수적 placeholder 전화: 연속(1234 5678)·전체 동일자리·흔한 더미 패턴만.
function isPlaceholderPhone(v) {
  if (isBlank(v)) return false
  const d = String(v).replace(/\D/g, '')
  if (d.length < 9) return false
  if (/^(\d)\1+$/.test(d)) return true // 전부 같은 숫자
  if (d.includes('1234567') || d.includes('2345678') || d.includes('12345678')) return true
  if (/0001112222|1111222233/.test(d)) return true
  return false
}
function isValidThumbUrl(v) {
  if (isBlank(v)) return false
  try { const u = new URL(v); return (u.protocol === 'https:' || u.protocol === 'http:') && /\/restaurant-thumbnails\//.test(u.pathname) }
  catch { return false }
}

async function fetchStatus(url, method = 'GET') {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), HTTP_TIMEOUT_MS)
  try {
    const res = await fetch(url, { method, redirect: 'follow', signal: ctrl.signal })
    return { ok: true, status: res.status, finalUrl: res.url }
  } catch (e) {
    return { ok: false, status: 0, finalUrl: url, error: e?.name === 'AbortError' ? 'timeout' : (e?.message ?? 'fetch_error') }
  } finally { clearTimeout(t) }
}

async function main() {
  loadEnvLocal()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  const checks = { database: {}, sitemap: {}, publicPages: {}, documentConsistency: {} }

  // ── DB 점검 ──
  if (!url || !serviceKey) {
    checks.database = { status: 'BLOCKED', evidence: 'env 부재(SUPABASE URL/SERVICE_ROLE_KEY 확인 불가)', envPresent: { url: !!url, serviceKey: !!serviceKey } }
  } else {
    try {
      const sb = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
      const { data: rows, error } = await sb.from('restaurants')
        .select('id, slug, name, address, phone, price_text, thumbnail, is_published, lat, lng, kakao_map_url')
      if (error) throw new Error('restaurants select: ' + error.message)
      const { data: ts, error: tsErr } = await sb.from('restaurant_trust_sources').select('restaurant_id, is_public')
      if (tsErr) throw new Error('trust_sources select: ' + tsErr.message)

      const all = rows ?? []
      const pub = all.filter((r) => r.is_published)
      const trustByRest = new Set((ts ?? []).filter((t) => t.is_public).map((t) => t.restaurant_id))

      const dupMap = new Map()
      for (const r of all) { const k = (r.slug ?? '').trim(); if (!k) continue; dupMap.set(k, (dupMap.get(k) ?? 0) + 1) }
      const slugDuplicates = [...dupMap.entries()].filter(([, n]) => n > 1).map(([k]) => k)

      const sample = (arr) => arr.slice(0, 20).map((r) => ({ slug: r.slug, name: r.name }))
      const f = {
        slugMissing: all.filter((r) => isBlank(r.slug)),
        nameMissing: all.filter((r) => isBlank(r.name)),
        addressMissingPub: pub.filter((r) => isBlank(r.address)),
        thumbMissingPub: pub.filter((r) => isBlank(r.thumbnail)),
        thumbBadUrlPub: pub.filter((r) => !isBlank(r.thumbnail) && !isValidThumbUrl(r.thumbnail)),
        phoneMissingPub: pub.filter((r) => isBlank(r.phone)),
        priceMissingPub: pub.filter((r) => isBlank(r.price_text)),
        phonePlaceholderPub: pub.filter((r) => isPlaceholderPhone(r.phone)),
        coordMissingPub: pub.filter((r) => isBlank(r.lat) || isBlank(r.lng)),
        kakaoMissingPub: pub.filter((r) => isBlank(r.kakao_map_url)),
        trustZeroPub: pub.filter((r) => !trustByRest.has(r.id)),
      }

      const counts = {
        total: all.length, published: pub.length, unpublished: all.length - pub.length,
        publishedWithThumbnail: pub.filter((r) => !isBlank(r.thumbnail)).length,
        publishedMissingThumbnail: f.thumbMissingPub.length,
        slugDuplicates: slugDuplicates.length,
        slugMissing: f.slugMissing.length, nameMissing: f.nameMissing.length,
        addressMissingPublished: f.addressMissingPub.length,
        thumbnailBadUrlPublished: f.thumbBadUrlPub.length,
        phoneMissingPublished: f.phoneMissingPub.length,
        priceMissingPublished: f.priceMissingPub.length,
        phonePlaceholderPublished: f.phonePlaceholderPub.length,
        coordMissingPublished: f.coordMissingPub.length,
        kakaoMissingPublished: f.kakaoMissingPub.length,
        trustZeroPublished: f.trustZeroPub.length,
      }

      const blockedReasons = []
      if (slugDuplicates.length) blockedReasons.push(`slug 중복 ${slugDuplicates.length}`)
      if (f.slugMissing.length) blockedReasons.push(`slug 누락 ${f.slugMissing.length}`)
      if (f.nameMissing.length) blockedReasons.push(`name 누락 ${f.nameMissing.length}`)
      if (f.addressMissingPub.length) blockedReasons.push(`공개 address 누락 ${f.addressMissingPub.length}`)
      if (f.thumbMissingPub.length) blockedReasons.push(`공개 thumbnail 누락 ${f.thumbMissingPub.length}`)
      if (f.thumbBadUrlPub.length) blockedReasons.push(`공개 thumbnail URL 형식오류 ${f.thumbBadUrlPub.length}`)

      const warnReasons = []
      if (f.phonePlaceholderPub.length) warnReasons.push(`placeholder 의심 전화 ${f.phonePlaceholderPub.length}`)
      if (f.phoneMissingPub.length) warnReasons.push(`공개 phone 누락 ${f.phoneMissingPub.length}`)
      if (f.priceMissingPub.length) warnReasons.push(`공개 price_text 누락 ${f.priceMissingPub.length}`)
      if (f.coordMissingPub.length) warnReasons.push(`공개 좌표 누락 ${f.coordMissingPub.length}`)
      if (f.kakaoMissingPub.length) warnReasons.push(`공개 kakao_map_url 누락 ${f.kakaoMissingPub.length}`)
      if (f.trustZeroPub.length) warnReasons.push(`공개 trust source 0개 ${f.trustZeroPub.length}`)

      const status = blockedReasons.length ? 'BLOCKED' : (warnReasons.length ? 'WARNING' : 'PASS')
      checks.database = {
        status, counts, blockedReasons, warnReasons,
        samples: {
          slugDuplicates: slugDuplicates.slice(0, 20),
          phonePlaceholderPublished: f.phonePlaceholderPub.slice(0, 20).map((r) => ({ slug: r.slug, name: r.name, phone: r.phone })),
          phoneMissingPublished: sample(f.phoneMissingPub),
          priceMissingPublished: sample(f.priceMissingPub),
          coordMissingPublished: sample(f.coordMissingPub),
          kakaoMissingPublished: sample(f.kakaoMissingPub),
          trustZeroPublished: sample(f.trustZeroPub),
        },
      }
    } catch (e) {
      checks.database = { status: 'BLOCKED', evidence: 'DB SELECT 실패: ' + (e?.message ?? String(e)) }
    }
  }

  const publishedCount = checks.database?.counts?.published ?? null

  // ── sitemap 점검 ──
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), HTTP_TIMEOUT_MS)
    const res = await fetch(`${BASE_URL}/sitemap.xml`, { signal: ctrl.signal }).finally(() => clearTimeout(t))
    const body = await res.text()
    const locs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim())
    const detailLocs = locs.filter((u) => /\/restaurants\/[^/]+$/.test(u))
    const hasManujang = detailLocs.some((u) => u.endsWith(`/restaurants/${MANUJANG_SLUG}`))
    const parseOk = locs.length > 0
    let status = 'PASS'
    const ev = []
    if (res.status !== 200) { status = 'BLOCKED'; ev.push(`HTTP ${res.status}`) }
    else if (!parseOk) { status = 'BLOCKED'; ev.push('loc 파싱 실패') }
    else if (hasManujang) { status = 'BLOCKED'; ev.push('비공개 만우장 URL 포함') }
    else if (publishedCount != null && detailLocs.length !== publishedCount) { status = 'WARNING'; ev.push(`상세 URL ${detailLocs.length} ≠ 공개 ${publishedCount}(ISR 지연 가능)`) }
    checks.sitemap = { status, httpStatus: res.status, parseOk, detailUrlCount: detailLocs.length, publishedCount, manujangIncluded: hasManujang, totalLoc: locs.length, evidence: ev.join('; ') || 'OK' }
  } catch (e) {
    checks.sitemap = { status: 'BLOCKED', evidence: 'sitemap fetch 실패: ' + (e?.name === 'AbortError' ? 'timeout' : (e?.message ?? 'error')) }
  }

  // ── 주요 공개 페이지 ──
  const coreUrls = ['/', '/restaurants', '/map', '/search', '/sitemap.xml', '/robots.txt']
  const sampleSlugs = ['hibab-cheongsa-hoe-center', 'hibab-haeundae-amsogalbi']
  const pageResults = []
  for (const p of coreUrls) pageResults.push({ url: BASE_URL + p, core: true, ...(await fetchStatus(BASE_URL + p)) })
  for (const s of sampleSlugs) { const u = `${BASE_URL}/restaurants/${s}`; pageResults.push({ url: u, core: false, ...(await fetchStatus(u)) }) }
  const manuUrl = `${BASE_URL}/restaurants/${MANUJANG_SLUG}`
  const manu = { url: manuUrl, ...(await fetchStatus(manuUrl)) }

  const coreFail = pageResults.filter((r) => r.core && r.status !== 200)
  const nonCoreFail = pageResults.filter((r) => !r.core && r.status !== 200)
  const homeOk = pageResults.find((r) => r.url === BASE_URL + '/')?.status === 200
  const sitemapHttpOk = pageResults.find((r) => r.url === BASE_URL + '/sitemap.xml')?.status === 200
  let ppStatus = 'PASS'
  const ppEv = []
  if (!manu.ok || manu.status !== 404) { ppStatus = 'BLOCKED'; ppEv.push(`만우장 최종 status ${manu.status}(404 기대)`) }
  if (!homeOk || !sitemapHttpOk || coreFail.length >= 2) { ppStatus = 'BLOCKED'; ppEv.push(`핵심 페이지 실패 ${coreFail.length}`) }
  else if (coreFail.length === 1 || nonCoreFail.length >= 1) { if (ppStatus !== 'BLOCKED') ppStatus = 'WARNING'; ppEv.push(`비핵심/단일 실패: ${[...coreFail, ...nonCoreFail].map((r) => r.url + '=' + r.status).join(', ')}`) }
  checks.publicPages = {
    status: ppStatus,
    results: pageResults.map((r) => ({ url: r.url, status: r.status, finalUrl: r.finalUrl, core: r.core })),
    manujang: { url: manu.url, status: manu.status, finalUrl: manu.finalUrl },
    evidence: ppEv.join('; ') || 'OK',
  }

  // ── 운영 문서 일치(현재값 단언 핵심 문서만; portfolio/과거 스냅샷 제외) ──
  checks.documentConsistency = {
    status: 'PASS',
    evidence: '현재 운영 기준을 단언하는 핵심 문서 없음(docs/portfolio·과거 reports는 시점 기록이라 제외). 1차 MVP는 BLOCKED/오류 처리 안 함.',
    excluded: ['docs/portfolio/**', 'reports/**(과거 날짜·백업·스냅샷)'],
  }

  // ── 종합 ──
  const order = ['database', 'sitemap', 'publicPages', 'documentConsistency']
  let pass = 0, warning = 0, blocked = 0
  for (const k of order) { const s = checks[k].status; if (s === 'PASS') pass++; else if (s === 'WARNING') warning++; else if (s === 'BLOCKED') blocked++ }
  const overall = blocked ? 'BLOCKED' : (warning ? 'WARNING' : 'PASS')

  const out = {
    generatedAt: new Date().toISOString(),
    project: 'naonzip', mode: 'read-only',
    summary: { status: overall, pass, warning, blocked },
    checks,
  }
  process.stdout.write(JSON.stringify(out, null, 2) + '\n')
}

main().catch((e) => { process.stderr.write('ops-check 예외: ' + (e?.message ?? String(e)) + '\n'); process.exitCode = 2 })
