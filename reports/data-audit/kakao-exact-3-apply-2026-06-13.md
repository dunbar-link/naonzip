# Kakao EXACT_MATCH 잔여 3곳 반영 결과 — 2026-06-13

직전 추가 감사(`kakao-remaining-5-audit-2026-06-13`)에서 EXACT_MATCH로 확정된 잔여 3곳에
`kakao_map_url` / `lat` / `lng` / `phone` 4개 필드를 반영했다.
REVIEW(영희할매재첩국)·NO_MATCH(담미옥)는 수정하지 않았다.

## Summary
- 대상: 3
- 성공: 3 / 실패: 0
- 지도정보 반영: kakao_map_url + lat + lng (3곳)
- 전화 반영: phone (3곳, 기존 전부 null → 외부확인값)
- REVIEW/NO_MATCH 미수정: 영희할매재첩국·담미옥 (kakao null·name·좌표 미변경 확인)
- DB write 범위: `restaurants` 3행, 각 영향행 1
- 앱 코드 변경: 없음
- 좌표 규칙: x=longitude, y=latitude. URL = `https://place.map.kakao.com/{placeId}`

## 식당별 변경
| 식당 | slug | place ID | Kakao URL 전/후 | lat 전/후 | lng 전/후 | phone 전/후 | 결과 |
| --- | --- | ---: | --- | ---: | ---: | --- | --- |
| 연합횟집 | jeonhyun-gwangalli-yeonhap-hoejip | 18833899 | null → https://place.map.kakao.com/18833899 | 35.1404596901443 → 35.140323 | 129.109762929823 → 129.109787 | null → 051-623-6039 | OK |
| 왔다식당 | jeonhyun-yeongdo-watda-sikdang | 9291686 | null → https://place.map.kakao.com/9291686 | 35.0940741825936 → 35.094025 | 129.056330271999 → 129.056345 | null → 051-412-2676 | OK |
| 초필살돼지구이 해운대본점 | tzuyang-haeundae-chopilsal | 27485287 | null → https://place.map.kakao.com/27485287 | 35.1566471472902 → 35.156337 | 129.146930632686 → 129.146800 | null → 051-747-5571 | OK |

- 왔다식당: 식당 본체 place 9291686만 반영. 부속 "왔다식당 주차장"(place 848516451) 배제.
- 초필살: Kakao 직통번호 051-747-5571 반영, 0507 안심번호는 미반영. DB 표시명 "초필살돼지구이 해운대본점" 유지.
- 연합횟집: 지번(남천동 192)↔도로명(황령대로489번길 59) 동일 필지 확인 후 반영.

## 보호 대상 확인 (이번 작업에서 변경 없음)
- 영희할매재첩국 (2tv-sasang-yeonghui-halmae-jaecheopguk): name "영희할매재첩국" 유지, kakao_map_url null 유지, 좌표 미변경 (REVIEW — 상호 검증 선행 필요)
- 담미옥 (saengdal-seomyeon-dammiok): name "담미옥" 유지, kakao_map_url null 유지, 좌표 미변경 (NO_MATCH — Kakao place 미특정)
- ※ restaurants 테이블에 updated_at 컬럼 없음 → name/kakao/좌표 동일성으로 미변경 확인.

## 전체 DB 검증 (반영 후 독립 SELECT)
- 전체 restaurants: 107
- 공개 restaurants: 90
- 공개 thumbnail: 90
- 공개 thumbnail 누락: 0
- 공개 kakao_map_url 누락: 2 (5 → 2)
- 공개 phone 누락: 44 (47 → 44)
- placeholder 전화: 0

## 잔여 누락
| 식당 | slug | 현재 분류 | 다음 처리 |
| --- | --- | --- | --- |
| 영희할매재첩국 | 2tv-sasang-yeonghui-halmae-jaecheopguk | REVIEW | 실제 상호("할매재첩국") 사실확인 후 name 교정 + place 1531629877 매핑 |
| 담미옥 | saengdal-seomyeon-dammiok | NO_MATCH | 수동 Kakao 지도에서 개금 담미옥 place 직접 확인(미쉐린 등재, 영업중) |

## 변경하지 않은 필드 (3곳 공통)
- name / address / area / category / main_menu / price_text
- slug / thumbnail / is_published
- trust source (별도 테이블, 미수정)
