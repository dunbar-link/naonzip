# 내호냉면 주소·Kakao·좌표 정합화 — 2026-06-15

> 2026-06-15 주소·가격 상위 15곳 감사의 `ADDRESS_CORRECTION_CANDIDATE`(내호냉면)를 작업 시점에 Kakao Local API + 외부 출처로 재검증 후 정합화.
> **address·kakao_map_url·lat·lng 4필드만** 교정. phone·price_text·name·main_menu·category·area·slug·thumbnail·is_published 무변경.
> 변경 전 전체 row 백업: `reports/data-audit/naeho-before-2026-06-15.json`

## Summary

- 최종 판정: PASS (동일 업소 확정 — 7조건 충족)
- DB 수정: 1행 (restaurants)
- 영향행: 1 (id+slug+기존 address 3중 조건)
- 수정 필드: address · kakao_map_url · lat · lng
- 앱 코드/스키마 변경: 0

## Kakao 재검증 (Kakao Local API, 좌표 y=lat / x=lng, 확인일 2026-06-15)

| 항목 | 결과 |
|---|---|
| 검색어 | 내호냉면 / 내호냉면 우암동 / 우암번영로26번길 17 / 내호냉면 남구 |
| 후보 수 | 2 |
| selected place | 11023144 (내호냉면) |
| place ID | 11023144 |
| 이름 일치 | ✅ 내호냉면 |
| 도로명 주소 | ✅ 부산 남구 우암번영로26번길 17 |
| 지번 주소 | 부산 남구 우암동 189-671 |
| 전화 일치 | ✅ 051-646-6195 (Kakao = DB) |
| latitude (y) | 35.1264751024665 |
| longitude (x) | 129.070867880766 |
| 부산 범위 | ✅ (lat 34.8~35.5 / lng 128.7~129.5) |
| 탈락 후보 | 16973511 내호냉면 **사하구** 사리로27번길 75(괴정동, 전화 051-291-5193, 7.4km) — 별개 업소로 배제 |

- 외부 출처 교차(우암동 동일 업소 확인): 식신 · 다이닝코드 · 위키백과 · busan.go.kr(부산시) · 대한민국구석구석 — 모두 부산 남구 우암동 우암번영로26번길 17 / 051-646-6195 / 1919년 백년가게(영업중).
- DB 기존 좌표(35.129244, 129.068934)는 Kakao 공식 좌표와 약 355m 이격 → Kakao x/y로 교정(추정 아님).

## before / after

| 필드 | before | after |
|---|---|---|
| address | 부산광역시 남구 장고개로 11-5 | 부산 남구 우암번영로26번길 17 |
| kakao_map_url | map.kakao.com 검색링크(q=장고개로 11-5) | https://place.map.kakao.com/11023144 |
| lat | 35.129244 | 35.1264751024665 |
| lng | 129.068934 | 129.070867880766 |

## 유지 필드 (독립 SELECT 재검증 — 전부 before와 동일)

- phone: 051-646-6195
- price_text: 밀면 9,000원
- name: 내호냉면 / main_menu: 밀면 / category: 밀면 / area: 남구
- slug: naeho-naengmyeon / thumbnail: (유지) / is_published: true

## DB 전체 집계 (반영 후 독립 SELECT)

- 전체 restaurants: 107 (불변)
- 공개 restaurants: 90 (불변)
- 공개 thumbnail 보유: 90
- 공개 phone 누락: 13 (불변)
- 공개 kakao_map_url 누락: 1 (담미옥, 불변)
- placeholder 전화: 0

## 후속 작업 (별도 승인건)

- 담미옥: 개금→중구 이전(중구 해관로 82-1, place 1712286950) 주소·전화·Kakao·좌표·가격 통합 정합화
- 내호냉면 price_text(밀면 9,000원): 9,000 vs 일부 출처 6,000 충돌 — 공식 메뉴판 확인 후 별도 판단(이번 미변경)
- REVIEW(스시바시쿠·일광당) 가격: 공식 메뉴 확인 전까지 보류. 일광당 좌표 1.7km 별도 교정.
