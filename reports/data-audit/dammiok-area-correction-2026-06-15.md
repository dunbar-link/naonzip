# 담미옥 area 지역 분류 정합화 (서면 → 남포동) — 2026-06-15

> 담미옥 이전(개금→중구 중앙동) 정합화 후 잔존하던 area="서면"(개금 기준)을, 현재 코드/DB의 canonical area 체계 조사 후 **area 1개 필드만** 교정.
> slug(saengdal-seomyeon-dammiok)·address·phone·Kakao·좌표·메뉴·가격 등 그 외 전부 무변경.
> 변경 전 전체 row 백업: `reports/data-audit/dammiok-area-before-2026-06-15.json`

## Summary

- 최종 판정: PASS (canonical area 단일 확정)
- canonical area: 남포동 (nampodong)
- DB 수정: 1행 (restaurants)
- 영향행: 1 (id+slug+기존 area=서면 3중 조건)
- 수정 필드: area (1개)
- 앱 코드/스키마 변경: 0
- 운영 점검: WARNING (BLOCKED 0)

## area 체계 조사 (read-only)

- **AREA_TYPES (src/types/restaurant.ts)**: 해운대·서면·광안리·**남포동**·기장·동래·사상·영도·남구·연제·기타 (11종). "중구"·"중앙동" 같은 값 없음 → 중구는 별도 area가 아니라 "남포동"으로 분류.
- **src/lib/areas.ts**: 남포동 ↔ slug `nampodong` (랜딩 `/area/nampodong` 지원).
- **src/lib/intros.ts**: "남포동은 **중구에 속한** 부산의 옛 중심 상권으로, 자갈치시장·국제시장과 이어지며…" — 중구 전체를 남포동 권역으로 규정.
- **DB 공개 식당 중구 분포**: 주소 "중구" 포함 14곳 중 **13곳 area=남포동** (물레방아·깡돼후·물꽁식당·수복센타·이가네떡볶이·중앙곰탕·백화양곱창·18번완당집·남포동 씨앗호떡·삼미집·밀양집·이재모피자·여송제), 담미옥만 area=서면(개금 잔존).
- **랜딩/검색/필터**: `/area/[slug]`(getRestaurantsByAreaSlug), AreaFilter, sitemap 모두 AreaType 기반 — 남포동 이미 지원. area 변경은 표시·필터·랜딩에만 영향, **slug·URL 불변**.
- 참고(이번 무관): DB에 AREA_TYPES 외 "북구" 1곳 존재(슌사이쿠보 화명) — 기존 데이터 이슈, 별도 항목.

### canonical area 결정 근거 (5조건 충족)
1. DB 공개 식당에서 사용 중 ✅ (남포동 13곳) 2. 랜딩/필터 지원 ✅ (nampodong) 3. 중구 해관로 82-1 권역 일치 ✅ (중구=남포동) 4. 다른 중구 식당과 동일 분류 ✅ (13/13) 5. 신규 타입/상수/페이지 불필요 ✅

## 변경 결과

| 필드 | before | after |
|---|---|---|
| area | 서면 | 남포동 |

- slug 유지: saengdal-seomyeon-dammiok (seomyeon은 URL 자산 — 불변)
- address 유지: 부산 중구 해관로 82-1
- phone 유지: 051-710-5318
- Kakao·좌표 유지: place 1712286950 / 35.106232308677 / 129.035599508124
- 메뉴·가격 유지: 평양냉면 / 평양냉면(물) 13,000원 / 녹두전 9,000원
- 기타 유지: name·category·thumbnail·is_published (독립 SELECT drift 0)

## 지역별 검증 (반영 후 독립 SELECT)

- 기존 지역(서면)에서 제외: ✅ 서면 12 → 11곳, 담미옥 미포함
- 새 지역(남포동)에서 포함: ✅ 남포동 13 → 14곳, 담미옥 포함
- 중복 노출: 없음 (담미옥 노출 1건)
- 전체 공개 식당: 90 (불변)
- 지역별 합계 총합: 90 (변화 없음, 서면 -1 / 남포동 +1)

## 후속 작업

- 담미옥 area 정합 완료 — 감사發 위치/분류 교정(내호냉면·담미옥) 종결
- kakao 검색링크→place URL 6곳(속씨원한·삼미집·한약방·구로마쯔·토다공원·깡돼후) 정비
- REVIEW(스시바시쿠 오마카세·일광당 5,500/6,000) 가격은 공식 메뉴판 확보 후 (일광당 좌표 1.7km 별도)
- (별개) DB area "북구" 1곳(슌사이쿠보)이 AREA_TYPES 미포함 — 분류 체계 일관성 점검 대상
