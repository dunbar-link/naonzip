# Kakao 검색링크 EXACT_MATCH 최종 3곳 반영 결과 — 2026-06-16

> 실번호 감사(`kakao-searchlink-review-4-phone-audit`)의 EXACT_MATCH 3곳에 대해 **kakao_map_url·lat·lng 3필드만** 운영 DB 반영.
> 각 UPDATE는 id+slug+기존 kakao_map_url 3중 조건, 영향행 정확히 1. 전화·주소·상호·가격 무변경. 금죽헌(REVIEW) 미수정.
> 변경 전 전체 row 백업: `reports/data-audit/kakao-searchlink-final-3-before-2026-06-16.json`

## Summary

- 대상: 3
- 성공(APPLIED): 3
- 실패: 0
- 수정 필드: kakao_map_url · lat · lng (3개)
- 보호 대상: 1 (금죽헌, 미변경)
- 앱 코드 변경: 0

## 식당별 변경

| 식당 | slug | URL before | URL after | 좌표 before | 좌표 after | 영향행 |
|---|---|---|---|---|---|---:|
| 구로마쯔 | 2tv-gwangan-kuromatsu | link/search/구로마쯔 광안점 | https://place.map.kakao.com/1553493687 | 35.1537 / 129.1185 | 35.1514786694312 / 129.116434385139 | 1 |
| 할매김밥 | live-today-donggu-halme-gimbap | link/search/할매김밥 고관로 106 | https://place.map.kakao.com/16286242 | 35.12985 / 129.04645 | 35.1282569731002 / 129.04640374595 | 1 |
| 토다공원 | saengdal-jeonpo-toda-park | link/search/토다공원 | https://place.map.kakao.com/536870603 | 35.1559 / 129.0648 | 35.1553485785214 / 129.067478259407 | 1 |

- 3곳 모두 반영 전 검색링크(place URL 아님) 확인(READY).
- 독립 SELECT 재검증: 3곳 모두 kakao_map_url=place 상세 URL + lat/lng=Kakao 공식, 그 외 10필드 전부 유지(drift 0).
- **전화 유지**: 구로마쯔 0507-1371-7816 / 할매김밥 0507-1349-0547 / 토다공원 051-808-7736 — 전부 변경 없음(안심번호 착신 또는 현행 실번호).
- 주소·상호·메뉴·가격도 무변경.

## 보호 대상 (미변경 — REVIEW)

- 금죽헌 금정산성점(2tv-gumjeong-geumjukheon): 검색링크·전화(0507-1347-5448) 유지, REVIEW 유지. 사유: DB 0507·Kakao 0503 양쪽 안심번호 실번호 미확보

## 전체 검증 (반영 후 독립 SELECT)

- 전체 restaurants: 107 / 공개 restaurants: 90 (불변)
- 공개 kakao_map_url 누락: 0 (불변)
- 공개 검색링크 잔여(place URL 아님): 4 → **1** (이번 3곳 정비)
  - 잔여 1 = 금죽헌 금정산성점 (REVIEW, 실번호 확인 후 판정)
- 공개 phone 누락: 12 (불변) / placeholder 전화: 0

## 후속 작업

- 금죽헌: 매장/공식 실 지역번호 확인 후 EXACT 승격 → 검색링크 0 달성 가능
- 사또분식 번지(37/39), 일광당 좌표 1.7km, REVIEW 가격(스시바시쿠·일광당)
- 위 정리 후 데이터 정합성 감사 종료 검토
