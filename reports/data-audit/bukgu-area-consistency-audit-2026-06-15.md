# AREA_TYPES 미지원 북구 식당 점검 — 2026-06-15 (read-only)

> 운영 DB에 area="북구"인 공개 식당 1곳(슌사이쿠보 화명)이 있으나 앱 `AREA_TYPES`(11종)에는 북구가 없다. 사용자 영향과 최소 수정안을 **조사·보고만** 한다. DB·앱 코드 수정 없음.

## Summary

- 대상 식당: 슌사이쿠보 화명 (saengdal-bukgu-shunsaikubo)
- DB area: 북구
- AREA_TYPES 지원: ❌ (북구는 공식 area 11종에 없음 — 전제 검증 완료)
- 상세 노출: ✅ 200 ("북구 · 아시안" 표시)
- 목록 노출: ✅ (/restaurants 포함)
- 검색 노출: ✅ ("북구"·"슌사이쿠보"·"히츠마부시"·"화명" 매칭)
- 지도 노출: ✅ ('전체'에서 마커 노출)
- 지역 필터 노출: ⚠ 목록 필터에 "북구" **단독 칩** 표시(availableAreas=DB area 고유값 기반)
- 지역 랜딩: /area/bukgu = **404** (단 1곳=3건 미만이라 "기타"여도 랜딩 없음 — 동일)
- sitemap: 상세 URL 포함 ✅ / 북구 area 랜딩 URL 없음 (getAreaSlugs 제외)
- 사용자 영향: **노출 누락 0** (모든 핵심 화면 정상). 단 분류 일관성 결함
- 최종 판정: **CANONICAL_REMAP_READY** (canonical = 기타)
- DB 수정: 0 (이번 read-only)
- 앱 코드 변경: 0

## 대상 row

- name: 슌사이쿠보 화명
- slug: saengdal-bukgu-shunsaikubo
- address: 부산 북구 양달로4번길 17 금샘빌딩 1층 (화명동)
- area: 북구
- category: 아시안 / main_menu: 히츠마부시 / price_text: 메뉴별 상이 (가격 확인 필요)
- Kakao: https://place.map.kakao.com/1645649718 (place 1645649718) / lat 35.2409591 lng 129.0145566
- 공개 여부: is_published = true (중복 0, 북구 소재 공개 식당은 이 1곳뿐)

## area 구조 (코드 read-only)

- canonical area 값 (src/types/restaurant.ts `AREA_TYPES`, 11종): 해운대·서면·광안리·남포동·기장·동래·사상·영도·남구·연제·**기타**. "북구" 없음.
- slug 매핑 (src/lib/areas.ts `AREA_SLUGS`): 11종만. `getAreaSlugFromName("북구")` → 매핑 없음 → **null**. "기타"도 의도적으로 null(SEO 가치 없음).
- 알 수 없는 area fallback: `rowToRestaurant`(restaurants.ts:165)가 `row.area as AreaType`로 **캐스팅만**(런타임 검증 없음) → "북구" 문자열 그대로 통과. 목록·지도·검색·상세는 area 값과 무관하게 동작하므로 **노출은 정상**.
- 지역 랜딩 (restaurants.ts `getAreaSlugs`): area→slug(북구는 null로 제외) + **count ≥ 3** 필터. 북구 1곳이라 이중으로 제외 → `/area/bukgu` 미생성(404). `getRestaurantsByAreaSlug("bukgu")` → name null + 3건 미만 → notFound.
- 필터 생성: 목록(RestaurantsClient.tsx:20) `new Set(restaurants.map(r=>r.area))` = **DB area 고유값** → "북구" 칩 표시. 지도(KakaoMapView.tsx:13) `AREA_FILTERS`는 AreaType 고정 배열 → "북구" 칩 없음(전체에서만 노출). 홈은 area 필터 없음(최근 5개만).
- sitemap (sitemap.ts): 상세=getRestaurantSlugs(공개 90 전체, 슌사이쿠보 포함) / area=getAreaSlugs(북구 제외).

## 사용자 화면 영향

| 화면 | 상태 | 비고 |
|---|---|---|
| 상세 /restaurants/saengdal-bukgu-shunsaikubo | ✅ 200 | "북구 · 아시안" 표시. area 링크는 없음(getAreaSlugFromName null → 텍스트만, 기타 식당과 동일) |
| 전체 목록 /restaurants | ✅ 노출 | getRestaurants 전체 반환 |
| 검색 /search | ✅ 노출 | area가 검색 대상(CORE_FIELDS) — "북구"/"슌사이쿠보"/"히츠마부시" 매칭 |
| 지도 /map | ✅ 노출 | '전체'에서 마커. 지도 지역필터(AREA_FILTERS 고정)엔 "북구" 칩 없음 |
| 지역 필터(목록) | ⚠ | "북구" 단독 칩 노출 — 동급 구(동구·금정구 등)는 "기타"로 묶이는데 북구만 예외 |
| 지역 랜딩 /area/bukgu | 404 | 미생성(매핑 null + 3건 미만). "기타"여도 랜딩 없음(동일) |
| sitemap.xml | ✅ | 상세 URL 포함, 북구 랜딩 URL 없음, 전체 상세 90 유지 |

→ **구조적 노출 누락 없음**(ISR 캐시 지연 아님). 결함은 "북구"가 AreaType 외 값으로 목록 필터에 단독 칩으로 뜨고, 동급 구 분류 원칙(기타)과 어긋나는 점뿐.

## 비교 결과

- 북구 소재 공개 식당 수: **1곳**(슌사이쿠보 화명)
- "기타" 분류 9곳 = 전용 area 없는 구: 동구(할매김밥·신발원), 금정구(송스 베이커리·금죽헌), 사하구(원조가야밀면·쉐라미과자점), 서구(옛날국수집), 강서구(삼성갈미조개), 수영구 일부(금신전선 상유십이)
- 기존 운영 원칙: **주요 10개 권역 + 그 외 구는 모두 "기타"로 흡수**. 북구는 전용 area가 없는 구 → 원칙상 "기타"가 맞고, 슌사이쿠보만 예외적으로 "북구"로 입력된 데이터 불일치.
- 과설계 위험: 식당 1곳 때문에 AREA_TYPES에 "북구" 추가 + areas.ts 매핑 + intro 문구 + 랜딩 생성은 **명백한 과설계**(랜딩은 3건 미만이라 추가해도 미생성). 향후 북구 식당 확장 계획도 현재 없음.

## 권장안

- 추천 분류: **기타** (canonical 단일 확정, 동급 5개 구와 동일 원칙)
- 필요한 변경: `restaurants.area` 1필드 (북구 → 기타). **별도 승인 후** 소수 단위 반영.
- 앱 코드 변경 필요 여부: **불필요** (기타는 이미 9곳 운영 중인 canonical, 랜딩·필터·sitemap 모두 기존 동작)
- 예상 사용자 효과: 목록 지역필터의 "북구" 단독 칩 → "기타"로 흡수(일관성↑). 상세 "기타·아시안" 표시. (트레이드오프: "북구" 키워드 검색 매칭은 사라짐 — 단 "화명"·식당명·메뉴 검색은 유지, 영향 미미)
- 위험: 거의 없음. "기타"는 검증된 기존 분류값.
- 다음 작업 범위: DB area 1필드 교정(별도 승인) 또는 현행 유지(낮은 우선순위). 북구 AREA_TYPES 추가는 비권장.

## (별개) AreaType 캐스팅 안전성 메모

- `rowToRestaurant`의 `row.area as AreaType`는 DB에 AreaType 외 값이 들어와도 런타임에서 막지 않는다(타입 우회). 북구가 노출은 됐지만 타입 계약 위반. 근본 방지는 입력단(admin convert/edit의 area select=AREA_TYPES)에서 이미 강제되므로, 이번 1건은 과거 시드 데이터 잔존으로 추정. 향후 area canonical 일괄 점검 시 함께 검토 권장.
