-- ============================================================
-- 나온집 대표사진(thumbnail) 업데이트 SQL "템플릿" — 실행 전 필독
-- ============================================================
--
-- ⚠️ 이 파일은 그대로 실행하지 말 것. (템플릿/placeholder 포함)
--
-- 실행 전 반드시:
--   1) 아래 <PROJECT_REF> 를 본인 Supabase 프로젝트 참조값으로 전체 치환한다.
--      (Supabase 대시보드 → Project Settings → API → Project URL 의 서브도메인)
--   2) Storage 'restaurant-thumbnails' bucket(Public)에 해당 식당 사진을
--      restaurants/{slug}/main.webp 경로로 "먼저 업로드"한다.
--   3) 업로드를 마친 식당의 UPDATE 문만 골라 Supabase SQL Editor 에서 실행한다.
--      (업로드 안 한 식당을 실행하면 404 URL 이 저장되어 화면엔 fallback 만 뜬다 — 의미 없음)
--
-- 경로/URL 규칙:
--   https://<PROJECT_REF>.supabase.co/storage/v1/object/public/restaurant-thumbnails/restaurants/{slug}/main.webp
--
-- 안전장치: thumbnail URL 이 잘못되어도 RestaurantImage 의 onError 가
--          그라데이션+이모지 fallback 으로 전환하므로 페이지가 깨지지는 않는다.
--          단, "보강 완료"가 아니므로 URL 은 반드시 업로드 후에만 넣는다.
--
-- slug 출처: 운영 DB 스냅샷 리포트(reports/restaurant-fix-priority.md,
--           reports/restaurant-data-quality-audit.md)에서 확인한 실제 slug.
-- 자세한 절차: docs/restaurant-thumbnail-storage-guide.md
-- ============================================================


-- ── (선택) 적용 전 누락 확인 — 읽기 전용 ─────────────────────
-- SELECT slug, name
-- FROM restaurants
-- WHERE is_published = true
--   AND (thumbnail IS NULL OR btrim(thumbnail) = '')
-- ORDER BY slug;


-- ── 우선 보강 대상 15곳 (Phase IMG-A 우선순위) ──────────────
-- 사용법: 사진 업로드를 끝낸 식당의 블록만 골라 실행.

-- 1. 원조가야밀면
UPDATE restaurants
SET thumbnail = 'https://<PROJECT_REF>.supabase.co/storage/v1/object/public/restaurant-thumbnails/restaurants/wonjo-gaya-milmyeon/main.webp'
WHERE slug = 'wonjo-gaya-milmyeon';

-- 2. 스시바시쿠
UPDATE restaurants
SET thumbnail = 'https://<PROJECT_REF>.supabase.co/storage/v1/object/public/restaurant-thumbnails/restaurants/saengdal-suyeong-sushibashiku/main.webp'
WHERE slug = 'saengdal-suyeong-sushibashiku';

-- 3. 피넛빵앗간
UPDATE restaurants
SET thumbnail = 'https://<PROJECT_REF>.supabase.co/storage/v1/object/public/restaurant-thumbnails/restaurants/saengdal-sasang-peanut-bbangatgan/main.webp'
WHERE slug = 'saengdal-sasang-peanut-bbangatgan';

-- 4. 마산식당
UPDATE restaurants
SET thumbnail = 'https://<PROJECT_REF>.supabase.co/storage/v1/object/public/restaurant-thumbnails/restaurants/baekban-seomyeon-masan-sikdang/main.webp'
WHERE slug = 'baekban-seomyeon-masan-sikdang';

-- 5. 가마솥돼지국밥 영도점
UPDATE restaurants
SET thumbnail = 'https://<PROJECT_REF>.supabase.co/storage/v1/object/public/restaurant-thumbnails/restaurants/baekban-yeongdo-gamasot-doejigukbap/main.webp'
WHERE slug = 'baekban-yeongdo-gamasot-doejigukbap';

-- 6. 궁중해물탕 조씨집 대연본점
UPDATE restaurants
SET thumbnail = 'https://<PROJECT_REF>.supabase.co/storage/v1/object/public/restaurant-thumbnails/restaurants/baekban-namgu-chossijib/main.webp'
WHERE slug = 'baekban-namgu-chossijib';

-- 7. 5번 친구해녀할매집
UPDATE restaurants
SET thumbnail = 'https://<PROJECT_REF>.supabase.co/storage/v1/object/public/restaurant-thumbnails/restaurants/jeonhyun-gijang-haenyeo-halmaejib/main.webp'
WHERE slug = 'jeonhyun-gijang-haenyeo-halmaejib';

-- 8. 해운대원조할매국밥
UPDATE restaurants
SET thumbnail = 'https://<PROJECT_REF>.supabase.co/storage/v1/object/public/restaurant-thumbnails/restaurants/samdae-haeundae-wonjo-halmae-gukbap/main.webp'
WHERE slug = 'samdae-haeundae-wonjo-halmae-gukbap';

-- 9. 내호냉면
UPDATE restaurants
SET thumbnail = 'https://<PROJECT_REF>.supabase.co/storage/v1/object/public/restaurant-thumbnails/restaurants/naeho-naengmyeon/main.webp'
WHERE slug = 'naeho-naengmyeon';

-- 10. 송정3대국밥
UPDATE restaurants
SET thumbnail = 'https://<PROJECT_REF>.supabase.co/storage/v1/object/public/restaurant-thumbnails/restaurants/matnyuk-seomyeon-songjeong-3dae-gukbap/main.webp'
WHERE slug = 'matnyuk-seomyeon-songjeong-3dae-gukbap';

-- 11. 신발원
UPDATE restaurants
SET thumbnail = 'https://<PROJECT_REF>.supabase.co/storage/v1/object/public/restaurant-thumbnails/restaurants/samdaecheonwang-shinbalwon/main.webp'
WHERE slug = 'samdaecheonwang-shinbalwon';

-- 12. 18번완당집
UPDATE restaurants
SET thumbnail = 'https://<PROJECT_REF>.supabase.co/storage/v1/object/public/restaurant-thumbnails/restaurants/baekban-nampo-18-wandang/main.webp'
WHERE slug = 'baekban-nampo-18-wandang';

-- 13. 동래할매파전
UPDATE restaurants
SET thumbnail = 'https://<PROJECT_REF>.supabase.co/storage/v1/object/public/restaurant-thumbnails/restaurants/baekban-dongnae-pajeon/main.webp'
WHERE slug = 'baekban-dongnae-pajeon';

-- 14. 중앙곰탕
UPDATE restaurants
SET thumbnail = 'https://<PROJECT_REF>.supabase.co/storage/v1/object/public/restaurant-thumbnails/restaurants/sungsik-nampodong-jungang-gomtang/main.webp'
WHERE slug = 'sungsik-nampodong-jungang-gomtang';

-- 15. 김유순대구뽈찜전문점
UPDATE restaurants
SET thumbnail = 'https://<PROJECT_REF>.supabase.co/storage/v1/object/public/restaurant-thumbnails/restaurants/kimyusun-daegu-bbol-jjim/main.webp'
WHERE slug = 'kimyusun-daegu-bbol-jjim';


-- ── (선택) 적용 후 반영 확인 — 읽기 전용 ─────────────────────
-- SELECT slug, thumbnail
-- FROM restaurants
-- WHERE slug IN (
--   'wonjo-gaya-milmyeon','saengdal-suyeong-sushibashiku','saengdal-sasang-peanut-bbangatgan',
--   'baekban-seomyeon-masan-sikdang','baekban-yeongdo-gamasot-doejigukbap','baekban-namgu-chossijib',
--   'jeonhyun-gijang-haenyeo-halmaejib','samdae-haeundae-wonjo-halmae-gukbap','naeho-naengmyeon',
--   'matnyuk-seomyeon-songjeong-3dae-gukbap','samdaecheonwang-shinbalwon','baekban-nampo-18-wandang',
--   'baekban-dongnae-pajeon','sungsik-nampodong-jungang-gomtang','kimyusun-daegu-bbol-jjim'
-- )
-- ORDER BY slug;
