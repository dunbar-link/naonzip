# 나온집 데이터 입력 가이드

부산 방송맛집 실제 데이터를 Supabase에 안전하게 추가하기 위한 운영 문서.

대상 사용자: 운영자(=프로젝트 오너) 본인.
대상 환경: Supabase Table Editor (운영 DB).

---

## 1. 목적

- 나온집 실제 맛집 데이터 추가용 운영 가이드.
- 데이터 추가 시 검색·지도·SEO·공유 카드가 깨지지 않도록 입력 기준을 통일.
- Supabase Table Editor 기준 절차를 표준화해서 이후 다른 사람이 입력해도 동일한 결과가 나오게 한다.

## 2. 기본 원칙

- **운영 데이터의 단일 소스는 Supabase `public.restaurants` 테이블이다.**
- `src/data/mock-restaurants.ts`는 Supabase 미설정/장애 시 fallback 용도. **운영 데이터와 동기화할 의무는 없다.**
- **`slug`는 한 번 발행하면 변경하지 않는다.** 변경하면 공유된 URL과 Search Console 색인이 모두 깨진다.
- ISR(Incremental Static Regeneration) 캐시 때문에 **새 데이터는 최대 1시간 뒤 운영에 반영될 수 있다.** 즉시 반영이 필요하면 Vercel Dashboard에서 Redeploy.
- Search Console sitemap 재제출은 현재 보류 중. 캐시 해소 후 별도 작업으로 다시 다룬다.

---

## 3. 필수 입력 필드

Supabase 컬럼명(snake_case) 기준. 모두 NOT NULL.

| 컬럼 | 의미 | 예시 | 주의 | 검색 | SEO | 지도/길찾기 | 공유 |
|---|---|---|---|---|---|---|---|
| `slug` | URL 식별자 | `hibab-haeundae-amsogalbi` | UNIQUE 제약. 한 번 정하면 변경 금지. 5장 규칙 참조 | - | URL 식별 | - | URL |
| `name` | 가게명 | `해운대 암소갈비집` | 한글 그대로 입력 | ★ | title, desc, JSON-LD | 마커 라벨, T맵 goalname | OG 이미지 큰 글씨 |
| `area` | 지역(부산 내) | `해운대` | 다음 8개 중 하나: `해운대`, `서면`, `광안리`, `남포동`, `기장`, `동래`, `사상`, `기타` | ★ | title, desc, JSON-LD addressRegion | 필터 | OG 이미지 |
| `address` | 도로명 주소 | `부산 해운대구 구남로 30` | 도로명 권장. 정확하지 않으면 좌표와 어긋남 | - | desc, JSON-LD streetAddress | - | - |
| `lat` | 위도 | `35.1628` | 부산 범위 약 35.0 ~ 35.4. `(0, 0)`은 무효 처리됨 | - | JSON-LD geo | ★ 마커 위치, T맵 goaly | - |
| `lng` | 경도 | `129.1635` | 부산 범위 약 128.9 ~ 129.3. `(0, 0)`은 무효 처리됨 | - | JSON-LD geo | ★ 마커 위치, T맵 goalx | - |
| `category` | 분류 | `고기` | OG 이미지에는 영향 없으나 검색·필터 일관성을 위해 기존 값 재사용 권장. 자주 쓰는 값: `돼지국밥`, `고기`, `해산물`, `밀면`, `회`, `분식/길거리`, `한식`, `버거/양식`, `아시안`, `베이커리/디저트` | ★ | title, desc, JSON-LD servesCuisine | - | OG 이미지 |
| `main_menu` | 대표 메뉴 | `암소갈비` | 짧고 명확하게. "한 줄 요약"으로 생각 | ★ | desc, JSON-LD servesCuisine | - | OG 이미지 오렌지 텍스트 |
| `price_text` | 가격 표시 | `1인분 25,000원` | 자유 문구 가능 ("1인 9,000원", "200g 16,000원", "1마리 45,000원~" 등) | - | JSON-LD priceRange | - | - |
| `source_type` | 출처 종류 | `tv` | **반드시 다음 3개 중 하나**: `youtube`, `tv`, `sns`. CHECK 제약이 걸려있어 오타 시 INSERT 실패 | - | - | - | OG 이미지의 `TV` / `YOUTUBE` / `SNS` 배지, 상세 페이지 색상 분류 |
| `source_title` | 출처 표시명 | `생활의달인` 또는 `히밥` | `creator_name` 또는 `program_name`이 비어있을 때 화면의 fallback으로 사용된다. 대체로 둘 중 하나와 같은 값을 넣어도 된다 | - | - | - | 상세 페이지 fallback |
| `is_published` | 공개 여부 | `true` | **`false`면 사이트 어디에도 보이지 않고 sitemap에도 포함되지 않는다.** | 필터 | 필터 | 필터 | 필터 |

> id(uuid), created_at(timestamptz)는 DB가 자동 채워준다. 직접 입력하지 않는다.

---

## 4. 선택 입력 필드

비워도 INSERT는 성공한다. 하지만 채울수록 SEO·공유 카드·구조화 데이터가 풍부해진다.

| 컬럼 | 넣으면 좋은 이유 | 비워도 되나 | 영향 |
|---|---|---|---|
| `phone` | 길찾기 직전에 전화 확인 가능 | OK | JSON-LD `telephone`, 상세 페이지 전화 링크 |
| `thumbnail` | (현재) JSON-LD `image`로만 사용됨. **OG 이미지는 동적 생성이라 thumbnail 영향 없음** | OK | JSON-LD `image` 절대 URL로 자동 변환 |
| `creator_name` | YouTube 출처면 강력 추천 | OK | 검색, SEO title (`(히밥)`), JSON-LD subjectOf, OG 이미지 상단 출처 라벨 |
| `program_name` | TV 출처면 강력 추천 | OK | 검색, SEO title, JSON-LD subjectOf, OG 이미지 fallback |
| `episode_title` | 한 줄 요약처럼 동작 | OK | SEO desc, JSON-LD subjectOf.name, OG 이미지 부제 |
| `broadcast_date` | **★ 정렬 1순위.** 비워두면 목록 뒤로 밀린다 | OK이지만 권장 입력 | 형식 `YYYY-MM-DD`. JSON-LD `datePublished`, getRestaurants 정렬 1순위 |
| `description` | 1~2문장 가게 소개 | OK | SEO desc(우선 사용), JSON-LD description, 상세 페이지 본문 |
| `video_url` | YouTube면 강력 추천 | OK | 상세 페이지 "유튜브에서 보기" 링크, JSON-LD `VideoObject` + `sameAs` |
| `kakao_map_url` | 가게의 카카오맵 공식 페이지가 있으면 입력 | OK | 비우면 좌표·이름으로 카카오맵 검색 URL 자동 생성 |
| `naver_map_url` | 네이버지도 공식 페이지가 있으면 입력 | OK | 비우면 가게명·주소로 네이버지도 검색 URL 자동 생성 |
| `tmap_url` | 보통 **비워두는 것이 안전**. 비우면 `tmap://route` 앱 스킴이 자동 생성됨 | OK | 직접 넣을 경우 SK OpenAPI(`apis.openapi.sk.com`) URL은 방어 코드가 차단함 |

---

## 5. slug 규칙

### 형식
- 영문 소문자 + 숫자 + 하이픈(`-`)만 사용.
- 한글/공백/대문자/특수문자 금지.
- 30자 이내 권장.

### 패턴
`{출처약자}-{지역}-{메뉴|가게명}` 조합 권장.

### 예시
- `hibab-gwangalli-jogae-gui-pocha` — 히밥 · 광안리 · 조개구이 포차
- `saengdal-ssangdungyi-doejigukbap` — 생활의달인 · 쌍둥이 · 돼지국밥
- `sungsik-seomyeon-yanggopchang` — 성시경 · 서면 · 양곱창

### 운영 규칙
- 한 번 입력한 `slug`는 **변경하지 않는다**. 변경 = 카카오톡 공유 링크 깨짐 + Search Console 색인 손실.
- 새 데이터 입력 전 반드시 중복 확인.

### 중복 확인
Supabase SQL Editor에서:
```sql
SELECT slug FROM restaurants WHERE slug = '확인할-슬러그';
```
결과가 0행이면 사용 가능. INSERT 시 중복이면 UNIQUE 제약이 막아주지만, 사전 확인이 안전하다.

---

## 6. source_type 규칙

`supabase/schema.sql`의 CHECK 제약 기준:

```
source_type IN ('youtube', 'tv', 'sns')
```

- 정확히 이 3개 중 하나. 다른 값은 INSERT가 거부된다.
- 표기는 모두 **소문자**.
- 의미:
  - `youtube` — YouTube 영상에 나온 경우
  - `tv` — TV 방송에 나온 경우 (예: 생활의달인, 맛있는녀석들)
  - `sns` — 인스타그램·블로그 등 (현재 사용 사례 거의 없음)

---

## 7. is_published 운영 정책

| 단계 | 권장 값 |
|---|---|
| 데이터 입력 중, 필수 필드 미완 | `false` |
| 좌표 확인 + 필수 13개 + 권장 필드 채움 | `true` |
| MVP에서 바로 공개하기로 한 데이터 | `true` (바로 입력) |

주의:
- `false` 상태에서는 운영 페이지 어디에도 노출되지 않고 sitemap에도 들어가지 않는다.
- `false` → `true` 전환 후에도 ISR 캐시 때문에 최대 1시간 지연 가능.
- 별도 미리보기 환경이 없으므로 사실상 `true`로 바로 넣고 운영 페이지에서 확인해도 무방하다.

---

## 8. 데이터 추가 전 체크리스트

- [ ] 같은 `slug`가 이미 있는지 SQL로 확인했다.
- [ ] `address`(도로명 권장)가 가게의 실제 주소다.
- [ ] `lat`, `lng`가 카카오맵 좌표와 일치한다.
- [ ] `lat`은 약 35.0 ~ 35.4 사이(부산 위도), `lng`는 약 128.9 ~ 129.3 사이(부산 경도)다.
- [ ] `area`가 정의된 8개 값(`해운대`, `서면`, `광안리`, `남포동`, `기장`, `동래`, `사상`, `기타`) 중 하나다.
- [ ] `source_type`이 `youtube`, `tv`, `sns` 중 하나다 (소문자 정확히).
- [ ] `broadcast_date`가 `YYYY-MM-DD` 형식이다 (예: `2025-03-16`).
- [ ] `video_url`, `kakao_map_url`, `naver_map_url`을 입력했다면 브라우저에서 열어서 정상 동작을 확인했다.
- [ ] `is_published` 값(`true`/`false`)을 의도대로 설정했다.

---

## 9. 데이터 추가 후 검증 절차

운영 URL(`https://naonzip.vercel.app`) 기준. ISR 캐시 때문에 최대 1시간 대기 필요할 수 있음.

| # | URL | 확인 항목 |
|---|---|---|
| 1 | `/restaurants` | 목록 페이지에 새 카드가 나오는지 |
| 2 | `/search?q={검색어}` | `name`/`mainMenu`/`creatorName`/`programName` 중 하나로 검색되는지 |
| 3 | `/map` | 지도 마커가 정확한 위치에 찍히는지 |
| 4 | `/restaurants/{slug}` | 상세 페이지가 200으로 열리는지 |
| 5 | 상세 페이지 내 길찾기 버튼 | 카카오맵 / 네이버지도 / T맵(앱 스킴) 모두 정상 작동 |
| 6 | `/restaurants/{slug}/opengraph-image` | PNG 1200×630이 응답되는지 |
| 7 | 카카오톡에 상세 URL 전송 | 미리보기 카드 + OG 이미지가 보이는지 |
| 8 | `/sitemap.xml` | 새 URL이 포함되었는지 |

---

## 10. 새 데이터가 바로 안 보일 때

1. **최대 1시간 대기** — ISR 캐시 만료 후 자동 갱신된다.
2. **그래도 안 보이면 Vercel Dashboard → Project → Redeploy** — 즉시 모든 페이지 재생성.
3. 추가 빈도가 잦아지면 **on-demand revalidation API route 도입을 검토**한다. (현재 미구현)
4. **Search Console sitemap 재제출은 현재 보류 중.** 별도 작업으로 캐시 해소 후 다시 다룬다.

---

## 11. 실제 입력 예시

기존 mock/seed에 들어있는 "쌍둥이돼지국밥"을 예로 든다. (Supabase Table Editor의 Insert row 화면에 그대로 채울 수 있는 값)

| 컬럼 | 값 |
|---|---|
| slug | `saengdal-ssangdungyi-doejigukbap` |
| name | `쌍둥이돼지국밥` |
| area | `서면` |
| address | `부산 부산진구 서면문화로 27` |
| lat | `35.1579` |
| lng | `129.0597` |
| category | `돼지국밥` |
| main_menu | `돼지국밥` |
| price_text | `1인 9,000원` |
| phone | `051-123-4567` |
| creator_name | (비움) |
| program_name | `생활의달인` |
| episode_title | `부산 돼지국밥 달인` |
| broadcast_date | `2025-03-16` |
| description | `50년 전통의 부산 돼지국밥 명가. 생활의달인이 선정한 진한 육수가 일품인 집.` |
| video_url | (비움) |
| kakao_map_url | (비움) |
| naver_map_url | (비움) |
| tmap_url | (비움) |
| thumbnail | (비움) |
| source_type | `tv` |
| source_title | `생활의달인` |
| is_published | `true` |

(id, created_at은 DB가 자동 채움. 입력란이 보여도 건드리지 않는다.)

---

## 12. 다음 단계

| Phase | 내용 | 조건 |
|---|---|---|
| 4-B | 실제 데이터 5건 추가 (Supabase Table Editor 직접 입력) | 이 가이드 확정 후 바로 |
| 4-C 후보 1 | `scripts/validate-restaurant-data.ts` Zod 기반 검증 스크립트 | 데이터 10건 이상으로 늘어나면 |
| 4-C 후보 2 | on-demand revalidation API route | 신규 추가 빈도가 주 2건 이상이면 |
| 4-D | 관리자 페이지 `/admin/restaurants` | 데이터 50건 이상이거나 다른 사람이 입력해야 할 때 |
| (별도) | Search Console sitemap 재제출 | 이전 캐시 해소 1~3일 뒤 |

---

## 부록 — 빠르게 체크할 SQL 한 줄

```sql
-- 발행된 데이터 개수
SELECT count(*) FROM restaurants WHERE is_published = true;

-- 좌표가 부산 범위 밖인 행 찾기
SELECT slug, name, lat, lng
FROM restaurants
WHERE lat NOT BETWEEN 35.0 AND 35.4
   OR lng NOT BETWEEN 128.9 AND 129.3;

-- broadcast_date가 비어있는 행 (정렬 후순위로 밀림)
SELECT slug, name FROM restaurants WHERE broadcast_date IS NULL;

-- slug 중복 확인
SELECT slug FROM restaurants WHERE slug = '확인할-슬러그';
```
