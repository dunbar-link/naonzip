# Kakao 검색링크 신규 EXACT_MATCH 4곳 반영 결과 — 2026-06-16

> read-only 감사(`kakao-searchlink-remaining-6-audit-2026-06-16`)의 EXACT_MATCH 4곳에 대해 **kakao_map_url·lat·lng 3필드만** 운영 DB 반영.
> 각 UPDATE는 id+slug+기존 kakao_map_url 3중 조건, 영향행 정확히 1. 그 외 무변경. REVIEW 4곳(금죽헌·할매김밥·구로마쯔·토다공원) 미수정.
> 변경 전 전체 row 백업: `reports/data-audit/kakao-searchlink-remaining-exact-4-before-2026-06-16.json`

## Summary

- 대상: 4
- 성공(APPLIED): 4
- 실패: 0
- 수정 필드: kakao_map_url · lat · lng (3개)
- 보호 대상: 4 (금죽헌·할매김밥·구로마쯔·토다공원, 미변경)
- 앱 코드 변경: 0

## 식당별 변경

| 식당 | slug | URL before | URL after | 좌표 before | 좌표 after | 영향행 |
|---|---|---|---|---|---|---:|
| 회국수할매집 | hoeguksu-halmaejip | 검색링크(itemId=11260858) | https://place.map.kakao.com/11260858 | 35.160999 / 129.055556 | 35.1582241900753 / 129.057583103138 | 1 |
| 금신전선 상유십이 | live-today-suyeong-geumsin-jeonseon-sangyusibi | link/search | https://place.map.kakao.com/1905565479 | 35.1563 / 129.1148 | 35.1574229558888 / 129.114560618088 | 1 |
| 합천일류돼지국밥 | ddoganjip-hapcheon-ilryu-dwaeji-gukbap | kko.to 단축 | https://place.map.kakao.com/10928210 | 35.1633 / 128.9818 | 35.162262056483875 / 128.98007978034923 | 1 |
| 불백고수락 센텀본점 | saengdal-centum-bulbaek-gosurak | link/search | https://place.map.kakao.com/987828015 | 35.1739 / 129.1263 | 35.1754435363346 / 129.126430643978 | 1 |

- 4곳 모두 반영 전 검색링크/단축링크(place URL 아님) 확인(READY) → 감사 이후 미변경 검증.
- 독립 SELECT 재검증: 4곳 모두 kakao_map_url=place 상세 URL + lat/lng=Kakao 공식, 그 외 10필드(name·address·phone·area·category·main_menu·price_text·slug·thumbnail·is_published) 전부 유지(drift 0).
- 불백고수락: DB phone(0507 안심번호)·price_text(직전 가격감사 교정값)·주소 모두 유지 — URL·좌표만 반영.
- 합천일류: kko.to 단축링크 → 정식 place URL로 정상화.

## 보호 대상 (미변경 확인 — REVIEW 4곳)

| 식당 | slug | kakao_map_url(유지) | 사유 |
|---|---|---|---|
| 금죽헌 금정산성점 | 2tv-gumjeong-geumjukheon | link/search (검색링크 유지) | REVIEW — DB 0507 vs Kakao 0503 양쪽 안심번호 교차 미완 |
| 할매김밥 | live-today-donggu-halme-gimbap | link/search (검색링크 유지) | REVIEW — DB 0507 안심 vs Kakao 051-467-0547 + 동명 다수 |
| 구로마쯔 | 2tv-gwangan-kuromatsu | link/search (검색링크 유지) | REVIEW — DB 0507 안심 vs Kakao 051 지역번호 |
| 토다공원 | saengdal-jeonpo-toda-park | link/search (검색링크 유지) | REVIEW — DB 051-808-7736 vs Kakao 051-622-7736 실충돌 |

## 전체 검증 (반영 후 독립 SELECT)

- 전체 restaurants: 107 / 공개 restaurants: 90 (불변)
- 공개 kakao_map_url 누락: 0 (불변)
- 공개 검색링크 잔여(place URL 아님): 8 → **4** (이번 4곳 정비)
  - 잔여 4 = REVIEW 4곳: 금죽헌·할매김밥·구로마쯔·토다공원 (전부 phone 실번호 확인 후 판정 대상)
- 공개 phone 누락: 12 (불변) / placeholder 전화: 0

## 후속 작업

- 검색링크 잔여 4곳(REVIEW)은 phone 실번호 확인이 공통 관건 → 묶어서 별도 처리
- 사또분식 주소 번지(37/39), 일광당 좌표 1.7km, REVIEW 가격(스시바시쿠·일광당)
- 위 정리 후 데이터 정합성 감사 종료 검토
