/**
 * 미쉐린 비공개 trust_sources 표적 공개 전환 (TRUST-H8 staged import 운영자 확인).
 *
 * 대상: source_name 에 '미쉐린' + is_public=false + source_url 도메인 guide.michelin.com 인 행.
 *   - 백일평냉 / 담미옥 / 해운대 암소갈비집 (개별 식당 공식 페이지 URL 정합 확인).
 * 안전:
 *   - restaurant_trust_sources 의 is_public 만 UPDATE. 다른 컬럼·restaurants 무수정.
 *   - source_url 도메인 가드(guide.michelin.com)로 오대상 차단.
 *   - idempotent: 이미 is_public=true 면 영향 0.
 *
 * 실행:
 *   node scripts/publish-michelin-trust-sources.mjs            # dry-run
 *   node scripts/publish-michelin-trust-sources.mjs --apply    # 공개 전환
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

function loadEnv() {
  const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!m) continue
    let v = m[2]
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
    if (!process.env[m[1]]) process.env[m[1]] = v
  }
}
const APPLY = process.argv.slice(2).includes('--apply')

async function main() {
  loadEnv()
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } })

  // 후보: 미쉐린 + 비공개. source_url 도메인 가드는 코드에서 한 번 더 검사.
  const { data: cands, error } = await sb
    .from('restaurant_trust_sources')
    .select('id,restaurant_id,source_name,source_url,trust_label,is_public')
    .ilike('source_name', '%미쉐린%')
    .eq('is_public', false)
  if (error) { console.error('FAIL 조회', error.code, error.message); process.exitCode = 2; return }

  const ids = [...new Set(cands.map((c) => c.restaurant_id))]
  const { data: rs } = await sb.from('restaurants').select('id,name,slug').in('id', ids)
  const byId = new Map(rs.map((r) => [r.id, r]))

  const eligible = cands.filter((c) => String(c.source_url ?? '').includes('guide.michelin.com'))
  const rejected = cands.filter((c) => !String(c.source_url ?? '').includes('guide.michelin.com'))

  console.log(`=== 미쉐린 trust 공개 전환 (${APPLY ? 'APPLY' : 'DRY-RUN'}) ===`)
  console.log(`비공개 미쉐린 후보: ${cands.length} / 공식URL 정합(공개 전환 대상): ${eligible.length} / REVIEW(URL 부적합): ${rejected.length}`)
  for (const c of eligible) {
    const r = byId.get(c.restaurant_id)
    console.log(`  [전환예정] ${r?.name} (${r?.slug}) | ${c.trust_label} | ${c.source_url}`)
  }
  for (const c of rejected) {
    const r = byId.get(c.restaurant_id)
    console.log(`  [REVIEW] ${r?.name} | url 도메인 부적합: ${c.source_url}`)
  }

  if (APPLY) {
    let updated = 0
    for (const c of eligible) {
      const { data, error: uErr } = await sb
        .from('restaurant_trust_sources')
        .update({ is_public: true })
        .eq('id', c.id)
        .eq('is_public', false)
        .select('id')
      if (uErr) { console.error(`  FAIL UPDATE ${c.id}: ${uErr.message}`); continue }
      updated += data?.length ?? 0
    }
    console.log(`\nUPDATE 완료(is_public→true): ${updated}`)
  }
}
main().catch((e) => { console.error('FAIL 예외', e?.message ?? String(e)); process.exitCode = 2 })
