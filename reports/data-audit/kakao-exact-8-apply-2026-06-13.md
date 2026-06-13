# Kakao EXACT_MATCH 8곳 반영 결과 — 2026-06-13

직전 read-only Kakao 매칭 감사(`kakao-missing-public-audit-2026-06-13`)에서 EXACT_MATCH로 판정된
공개 식당 8곳에 한해 `kakao_map_url` / `lat` / `lng` 3개 필드만 운영 DB에 반영했다.
REVIEW 3곳·NO_MATCH 2곳은 수정하지 않았다.

## Summary
- 반영 대상: 8
- 성공: 8
- 실패: 0
- REVIEW 미수정: 3
- NO_MATCH 미수정: 2
- DB write 범위: `restaurants` 8행, `kakao_map_url`/`lat`/`lng`만 (각 영향행 1)
- 앱 코드 변경: 없음
- 좌표 규칙: x=longitude, y=latitude. URL = `https://place.map.kakao.com/{placeId}`

## 식당별 변경
| 식당 | slug | place ID | URL before | URL after | lat before | lat after | lng before | lng after | 결과 |
| --- | --- | ---: | --- | --- | ---: | ---: | ---: | ---: | --- |
| 마포본가 | ansungjae-yeonje-mapobonga | 17981818 | null | https://place.map.kakao.com/17981818 | 35.184342930923 | 35.183981 | 129.082279198059 | 129.082174 | OK |
| 수복센타 | baekban-nampo-subok-centa | 11128820 | null | https://place.map.kakao.com/11128820 | 35.0988509225395 | 35.098888 | 129.031456197999 | 129.031431 | OK |
| 옛날국수집 | baekban-seogu-yetnal-guksujip | 964978610 | null | https://place.map.kakao.com/964978610 | 35.099268125477 | 35.099271 | 129.016099525161 | 129.016103 | OK |
| 비와술잔 | jeonhyun-gwangalli-biwa-suljan | 1848137369 | null | https://place.map.kakao.com/1848137369 | 35.1402076759138 | 35.140206 | 129.109263956848 | 129.109262 | OK |
| 물레방아 즉석구이 | jeonhyun-nampo-mullebanga-jeukseokgui | 8301894 | null | https://place.map.kakao.com/8301894 | 35.1013730572428 | 35.101051 | 129.036245143996 | 129.035135 | OK |
| 여송제 | jeonhyun-nampo-yeosongje | 10656018 | null | https://place.map.kakao.com/10656018 | 35.0993184361462 | 35.099162 | 129.027038390805 | 129.027188 | OK |
| 백일평냉 | saengdal-gwangalli-baegil-pyeongnaeng | 1174747976 | null | https://place.map.kakao.com/1174747976 | 35.1485634371324 | 35.148556 | 129.111648737636 | 129.111645 | OK |
| 이재모피자 본점 | tzuyang-nampo-ijaemo-pizza | 10070964 | null | https://place.map.kakao.com/10070964 | 35.1021026782328 | 35.102042 | 129.030582344104 | 129.030747 | OK |

- 각 식당 검증 근거(감사 기준): 이름 EXACT + 도로명주소 EXACT + 부산 내 유일 강후보 + 좌표 근접(0~107m).
  전화는 8곳 모두 DB에 없어 대조 불가(이번 작업에서 phone 미수정).

## DB 전체 검증 (반영 후 독립 SELECT)
- 전체 restaurants: 107
- 공개 restaurants: 90
- 공개 thumbnail: 90
- 공개 thumbnail 누락: 0
- 공개 kakao_map_url 누락: 5 (13 → 5)

## 미반영 5곳 (이번 작업에서 DB 변경 없음, kakao_map_url 여전히 null)
| 분류 | 식당 | slug | 이유 |
| --- | --- | --- | --- |
| REVIEW | 연합횟집 | jeonhyun-gwangalli-yeonhap-hoejip | 후보 18833899 유력하나 DB가 지번주소라 도로명 직접대조 불가 + 전화 부재 |
| REVIEW | 왔다식당 | jeonhyun-yeongdo-watda-sikdang | 본체 9291686 유력하나 2번째 후보가 "왔다식당 주차장"(부속)이라 보수 분류 |
| REVIEW | 초필살돼지구이 해운대본점 | tzuyang-haeundae-chopilsal | 후보 27485287 주소 EXACT·핵심상호 동일하나 DB명"해운대본점" vs Kakao"본점" + 전화 부재 |
| NO_MATCH | 영희할매재첩국 | 2tv-sasang-yeonghui-halmae-jaecheopguk | Kakao 키워드 검색 0건 |
| NO_MATCH | 담미옥 | saengdal-seomyeon-dammiok | DB 주소(부산진구 개금)와 일치하는 Kakao 장소 없음(중구 담미옥은 5.2km) |

## 변경하지 않은 필드 (8곳 공통)
- name / address / phone / area / category / main_menu / price_text
- slug / thumbnail / is_published
- trust source (별도 테이블, 미수정)
