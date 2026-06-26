# sitemap.xml revalidate 미반영 — 코드 기준 진단 (read-only)

- 작성일: 2026-06-26
- 브랜치: docs/review-sundori-boribap-2026-06 (git clean)
- 증상: 순돌이 보리밥 publish(공개 139) 후 1시간 이상 지나도 운영 `/sitemap.xml`이 restaurantUrls **138**, `2tv-haeundae-sundori-boribap` 누락. cache-bust(?cb=)로도 138.
- 범위: 코드 read-only 점검. 수정·DB·배포 없음.

## 1. sitemap.ts 현재 구조 요약

| 항목 | 값 |
|---|---|
| 파일 | `src/app/sitemap.ts` |
| 캐시 설정 | `export const revalidate = 3600` (ISR 1시간) |
| dynamic 설정 | 없음 (기본값 = 정적/ISR 캐시) |
| 데이터 소스 | `getRestaurantSlugs()` 등 5개 (`@/lib/restaurants`) → Supabase anon 쿼리, 실패 시 mock fallback |
| 요청시각 API | `new Date()`만 사용(빌드타임에도 평가됨 → 동적 강제 효과 없음) |

데이터 계층:
- `src/lib/supabase.ts`: `createClient(url, anonKey)` — **fetch 캐시 옵션 없음**(기본 클라이언트)
- `src/lib/restaurants.ts`: `getRestaurantSlugs()`는 `.from('restaurants').select('*').eq('is_published', true)` — **unstable_cache / cacheTag / next:{tags} / revalidate 없음**
- `next.config.ts`: **비어있음** → `cacheComponents`(v16 신모델) 미사용 → "Previous Model"(fetch 기본 no-cache + route segment config) 적용

## 2. revalidate가 "안 먹는" 원인 후보

### (A) 주원인 — DB 변경에 대한 on-demand 무효화 경로가 없음 ★확정적
- `revalidate=3600`은 **시간 기반(stale-while-revalidate)** 재검증만 제공. "1시간마다 자동"이 아니라 "age>3600 상태에서 요청이 오면 백그라운드 재생성 → 그 다음 요청부터 새 값"의 lazy 모델.
- publish는 **앱 외부 node 스크립트**(`register-sundori-boribap.mjs --publish`)에서 DB만 UPDATE. 앱의 `revalidatePath('/sitemap.xml')`·`revalidateTag()` 를 호출할 방법이 없음.
- supabase 쿼리에 `cacheTag`/`unstable_cache({tags})`가 없어 `revalidateTag`로 무효화할 대상 태그 자체가 존재하지 않음.
- → sitemap 캐시는 **시간 경과로만** 깨질 수 있고, DB가 바뀐 사실을 알릴 채널이 없다.

### (B) 보조원인 — Vercel ISR/CDN 전파 타이밍
- time-based ISR은 첫 stale 요청이 백그라운드 재생성을 트리거하고, 그 요청 자체는 stale(138)을 반환. 재생성 완료·CDN 엣지 전파 전까지 다른 요청도 138을 볼 수 있음.
- `?cb=`는 route 캐시 키를 바꾸지 못함(sitemap route는 쿼리스트링 무시) → 우회 불가.

### (C) 상세페이지가 즉시 200이던 것과의 차이
- 상세 `/restaurants/[slug]`는 **신규 경로**라 캐시 미스 → dynamicParams on-demand 렌더로 즉시 생성(200).
- sitemap은 **기존 단일 경로**(이미 138로 캐시됨)라 미스가 없고, 시간 기반 재검증만 남음. → 같은 revalidate=3600이어도 체감 지연이 다름.

## 3. 추천 해결책

### 1순위 ★ — sitemap.ts를 동적 생성으로 전환
```
src/app/sitemap.ts
- export const revalidate = 3600   (제거)
+ export const dynamic = 'force-dynamic'
```
- 효과: 매 요청마다 DB 최신으로 sitemap 생성 → **publish 즉시 반영**. 별도 무효화 코드 불필요.
- 타당성: sitemap은 크롤러 전용(호출 빈도 낮음), URL ~154개 + Supabase 쿼리 1~2회 → 비용 무시 가능. Previous Model에서 fetch는 어차피 기본 no-cache라 force-dynamic과 자연 정합.
- `new Date()` lastModified도 매번 정확해지는 부수 이점.

### 2순위 — on-demand revalidation (과설계, 비권장)
- 데이터 함수 `unstable_cache(tags:['restaurants'])` + 보호된 `/api/revalidate` route 신설 + 등록 스크립트에서 호출.
- 단점: 이 1건 위해 API route·시크릿·스크립트 연동까지 필요 → MVP/ROI 위반. 캐시 이점이 꼭 필요할 때만.

### 3순위 — revalidate 단축(예: 60)
- `revalidate = 60` 으로 지연을 최대 1분으로 축소. 단 lazy ISR 타이밍 이슈는 일부 잔존. 절충안.

## 4. 위험도 / 영향

| 항목 | 내용 |
|---|---|
| 위험도 | **낮음** — `sitemap.xml` route 단일 영향. 다른 페이지·데이터·DB 무관 |
| 부작용 | sitemap의 ISR 캐시 이점 상실(크롤러 전용이라 체감 영향 없음), 요청당 DB 쿼리 1~2회 추가 |
| 수정 파일 | `src/app/sitemap.ts` (1줄 교체) |
| DB/Storage | 변경 없음 |
| 배포 필요 | **YES** — 코드 변경이라 Vercel 재배포해야 반영. (재배포 자체로도 빌드시점 최신 139가 즉시 반영되고, force-dynamic이면 이후 publish도 항상 즉시) |

> 참고: 코드 수정 없이 **재배포만** 해도 현재 138→139는 일시 해소되나, force-dynamic이 없으면 다음 publish에서 동일 지연 재발. 근본 해결은 1순위.

## 5. 다음 실행 지시문 초안

```
나온집 sitemap force-dynamic 수정 + 검증 + 배포(커밋/푸시).

수정 파일: src/app/sitemap.ts
- export const revalidate = 3600  삭제
- export const dynamic = 'force-dynamic'  추가

검증(로컬):
1. npx tsc --noEmit
2. npm run build  (sitemap이 동적 ƒ 표시 확인)
3. npm run dev 후 http://localhost:3000/sitemap.xml 에 2tv-haeundae-sundori-boribap 포함 확인

배포 후(운영):
4. npm run sitemap:check -- --url https://naonzip.vercel.app/sitemap.xml --slugs 2tv-haeundae-sundori-boribap  → PASS
5. restaurantUrls 139 + 순돌이 포함 확인
6. npm run ops:summary  → sitemap WARNING 해소(detail 139 = pub 139)

범위: sitemap.ts 1파일만. DB/Storage write 없음. 배포는 대장 승인 후.
```
