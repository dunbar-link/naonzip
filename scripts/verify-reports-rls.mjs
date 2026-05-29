/**
 * restaurant_reports RLS 검증 스크립트 (1회용).
 * - anon 키로 INSERT/SELECT/잘못된 값 차단 동작을 확인한다.
 * - 키는 절대 출력하지 않는다.
 *
 * 실행: node scripts/verify-reports-rls.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

// .env.local 파싱 (값은 출력 금지)
const env = Object.fromEntries(
  readFileSync('.env.local', 'utf-8')
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]
    }),
)

const url = env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!url || !anonKey) {
  console.error('FAIL: env missing')
  process.exit(1)
}

const supabase = createClient(url, anonKey)

const TEST_SLUG = 'saengdal-ssangdungyi-doejigukbap'
const TEST_MARK = '___rls_verify_' + Date.now()

const results = []

function record(name, ok, detail) {
  results.push({ name, ok, detail })
  console.log(`[${ok ? 'PASS' : 'FAIL'}] ${name}${detail ? ' — ' + detail : ''}`)
}

// 1a) status 를 명시적으로 'pending' 으로 보낸 valid INSERT
{
  const { data, error } = await supabase
    .from('restaurant_reports')
    .insert({
      restaurant_slug: TEST_SLUG,
      reason: '폐업',
      message: TEST_MARK + '_explicit',
      status: 'pending',
    })
  if (error) {
    record('valid INSERT (status=pending explicit)', false, `${error.code} ${error.message}`)
  } else {
    record('valid INSERT (status=pending explicit)', true, `rows=${data?.length ?? 0}`)
  }
}

// 1b) status omit + defaultToNull:false (DB default 에 맡김)
{
  const { data, error } = await supabase
    .from('restaurant_reports')
    .insert(
      {
        restaurant_slug: TEST_SLUG,
        reason: '폐업',
        message: TEST_MARK + '_default',
      },
      { defaultToNull: false },
    )
  if (error) {
    record('valid INSERT (status omit, defaultToNull:false)', false, `${error.code} ${error.message}`)
  } else {
    record('valid INSERT (status omit, defaultToNull:false)', true, `rows=${data?.length ?? 0}`)
  }
}

// 2) anon SELECT should be blocked → 0 rows
{
  const { data, error } = await supabase
    .from('restaurant_reports')
    .select('id, restaurant_slug, message')
    .eq('message', TEST_MARK)
  if (error) {
    record('anon SELECT blocked', true, `error: ${error.code} ${error.message}`)
  } else {
    record('anon SELECT blocked', (data?.length ?? 0) === 0, `rows=${data?.length ?? 0}`)
  }
}

// 3) status='reviewed' INSERT should fail (WITH CHECK)
{
  const { error } = await supabase
    .from('restaurant_reports')
    .insert({
      restaurant_slug: TEST_SLUG,
      reason: '폐업',
      status: 'reviewed',
      message: TEST_MARK + '_bad_status',
    })
  if (error) {
    record('invalid status blocked', true, `${error.code} ${error.message}`)
  } else {
    record('invalid status blocked', false, 'INSERT succeeded — RLS WITH CHECK NOT effective')
  }
}

// 4) reason too long (>50 chars) blocked by WITH CHECK
{
  const longReason = 'x'.repeat(60)
  const { error } = await supabase
    .from('restaurant_reports')
    .insert({
      restaurant_slug: TEST_SLUG,
      reason: longReason,
      message: TEST_MARK + '_bad_reason',
    })
  if (error) {
    record('reason length>50 blocked', true, `${error.code} ${error.message}`)
  } else {
    record('reason length>50 blocked', false, 'INSERT succeeded — length check not effective')
  }
}

// 5) empty slug blocked
{
  const { error } = await supabase
    .from('restaurant_reports')
    .insert({
      restaurant_slug: '',
      reason: '폐업',
      message: TEST_MARK + '_empty_slug',
    })
  if (error) {
    record('empty slug blocked', true, `${error.code} ${error.message}`)
  } else {
    record('empty slug blocked', false, 'INSERT succeeded — length check not effective')
  }
}

// 6) anon DELETE blocked
{
  const { error, count } = await supabase
    .from('restaurant_reports')
    .delete({ count: 'exact' })
    .eq('message', TEST_MARK)
  if (error) {
    record('anon DELETE blocked', true, `${error.code} ${error.message}`)
  } else {
    record('anon DELETE blocked', count === 0 || count == null, `deleted=${count}`)
  }
}

// 7) anon UPDATE blocked
{
  const { error, count } = await supabase
    .from('restaurant_reports')
    .update({ status: 'reviewed' }, { count: 'exact' })
    .eq('message', TEST_MARK)
  if (error) {
    record('anon UPDATE blocked', true, `${error.code} ${error.message}`)
  } else {
    record('anon UPDATE blocked', count === 0 || count == null, `updated=${count}`)
  }
}

const failed = results.filter((r) => !r.ok)
console.log(`\nSummary: ${results.length - failed.length}/${results.length} passed`)
console.log(`Test marker: ${TEST_MARK}`)
console.log('Cleanup hint (run in Supabase SQL Editor):')
console.log(`  DELETE FROM public.restaurant_reports WHERE message LIKE '___rls_verify_%';`)
process.exit(failed.length === 0 ? 0 : 1)
