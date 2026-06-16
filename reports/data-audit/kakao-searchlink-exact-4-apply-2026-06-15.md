# Kakao 검색링크 EXACT_MATCH 4곳 반영 결과 — 2026-06-15

> read-only 감사(`kakao-searchlink-6-audit`)의 EXACT_MATCH 4곳에 대해 **kakao_map_url·lat·lng 3필드만** 운영 DB 반영.
> 각 UPDATE는 id+slug+기존 kakao_map_url 3중 조건, 영향행 정확히 1. 그 외 필드 무변경. 보호 2곳(구로마쯔·토다공원) 미수정.
> 변경 전 전체 row 백업: `reports/data-audit/kakao-searchlink-exact-4-before-2026-06-15.json`

## Summary

- 대상: 4
- 성공(APPLIED): 4
- 실패: 0
- 수정 필드: kakao_map_url · lat · lng (3개)
- 보호 대상: 2 (구로마쯔·토다공원, 미변경)
- 앱 코드 변경: 0

## 식당별 변경

| 식당 | slug | URL before | URL after | 좌표 before | 좌표 after | 영향행 |
|---|---|---|---|---|---|---:|
| 속씨원한 대구탕 해운대 본점 | sokssiwonhan-daegutang-haeundae | 검색링크(itemId=13299874) | https://place.map.kakao.com/13299874 | 35.163622 / 129.153411 | 35.16084233038125 / 129.1554279612453 | 1 |
| 삼미집 | oneuln-nampo-sammi-jip | link/search/삼미집 | https://place.map.kakao.com/16214505 | 35.0998 / 129.0308 | 35.10197482606437 / 129.0289559350778 | 1 |
| 한약방돼지국밥 형제식품 | hanyakbang-gukbap-hyeongje-food | link/search/한약방… | https://place.map.kakao.com/2017689767 | 35.141445 / 129.062135 | 35.1418955972729 / 129.062005706056 | 1 |
| 깡돼후 | 2tv-bupyeong-kkang-dwaehu | link/search/깡돼후… | https://place.map.kakao.com/213124109 | 35.1011 / 129.0279 | 35.102069493716535 / 129.02577496381926 | 1 |

- 4곳 모두 반영 전 검색링크(place URL 아님) 확인(READY) → 감사 이후 미변경 검증.
- 독립 SELECT 재검증: 4곳 모두 kakao_map_url=place 상세 URL + lat/lng=Kakao 공식, 그 외 10필드(name·address·phone·area·category·main_menu·price_text·slug·thumbnail·is_published) 전부 유지(drift 0).
- 한약방: phone(null)·address(지번 범천동 839-407) 유지 — URL·좌표만 반영.
- 깡돼후: name '깡돼후' 유지 (Kakao 정식명 '깡돼후야시장' 미반영).

## 보호 대상 (미변경 확인)

| 식당 | slug | kakao_map_url(유지) | 사유 |
|---|---|---|---|
| 구로마쯔 | 2tv-gwangan-kuromatsu | link/search/구로마쯔 광안점 (검색링크 유지) | REVIEW — DB 0507 안심번호 vs Kakao 051 지역번호 교차 미완 |
| 토다공원 | saengdal-jeonpo-toda-park | link/search/토다공원 (검색링크 유지) | REVIEW — DB 051-808-7736 vs Kakao 051-622-7736 지역번호 실충돌 |

## 전체 검증 (반영 후 독립 SELECT)

- 전체 restaurants: 107 / 공개 restaurants: 90 (불변)
- 공개 kakao_map_url 누락: 0 (불변)
- 공개 phone 누락: 12 (불변) / placeholder 전화: 0
- 공개 검색링크 잔여(place URL 아님): 12 → **8**
  - 이번 4곳 정비 완료 (검색링크 → place URL)
  - 잔여 8 = 보호 2(구로마쯔·토다공원) + **top15 감사 범위 밖 6곳**: 할매김밥(live-today-donggu-halme-gimbap)·회국수할매집(hoeguksu-halmaejip, ?q=itemId)·금신전선 상유십이(live-today-suyeong-geumsin-jeonseon-sangyusibi)·합천일류돼지국밥(ddoganjip-hapcheon-ilryu-dwaeji-gukbap, kko.to 단축)·금죽헌 금정산성점(2tv-gumjeong-geumjukheon)·**불백고수락 센텀본점(saengdal-centum-bulbaek-gosurak)**

## ⚠ 신규 발견 (이번 범위 밖)

- 직전 "kakao 검색링크 6곳" 식별은 **top15 감사 기준**이었고, 전체 공개 90곳에는 검색링크가 12곳 존재했다(이번 4곳 정비로 8곳 잔여).
- top15였던 **불백고수락 센텀본점**도 검색링크인데 6곳 명단에서 누락돼 있었음(이번 EXACT 대상 아님).
- 권장: 잔여 6곳(보호 2 제외)에 대한 **전수 검색링크 place ID 별도 감사** (이번과 동일 방식). 자동 변환 금지 — place 단일 확정 후 반영.

## 후속 작업

- 구로마쯔·토다공원: phone 교차검증 후 place 반영 여부 결정
- 검색링크 잔여 6곳(할매김밥·회국수할매집·금신전선·합천일류·금죽헌·불백고수락) 별도 감사
- 사또분식 주소 번지(37/39), 일광당 좌표 1.7km, REVIEW 가격(스시바시쿠·일광당)
