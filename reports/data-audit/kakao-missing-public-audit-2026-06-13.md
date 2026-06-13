# 공개 Kakao 지도 누락 식당 감사 — 2026-06-13

## 요약
- 조회 대상: 13
- EXACT_MATCH: 8
- REVIEW: 3
- NO_MATCH: 2
- BLOCKED: 0
- DB 수정: 없음 (read-only)
- 앱 코드 변경: 없음

## EXACT_MATCH
| No | 식당명 | slug | 현재 주소 | Kakao 장소 | 전화 | place ID | 권장 URL |
| -: | --- | --- | --- | --- | --- | --- | --- |
| 1 | 마포본가 | ansungjae-yeonje-mapobonga | 부산 연제구 월드컵대로111번길 10 | 마포본가 (부산 연제구 월드컵대로111번길 10) | 051-867-9252 | 17981818 | https://place.map.kakao.com/17981818 |
| 2 | 수복센타 | baekban-nampo-subok-centa | 부산 중구 남포길 25-3 | 수복센타 (부산 중구 남포길 25-3) | 051-245-9986 | 11128820 | https://place.map.kakao.com/11128820 |
| 3 | 옛날국수집 | baekban-seogu-yetnal-guksujip | 부산 서구 까치고개로160번길 54 | 옛날국수집 (부산 서구 까치고개로160번길 54) | 051-241-7454 | 964978610 | https://place.map.kakao.com/964978610 |
| 4 | 비와술잔 | jeonhyun-gwangalli-biwa-suljan | 부산 수영구 황령대로489번길 49-8 1층 | 비와술잔 (부산 수영구 황령대로489번길 49-8) | 051-621-2540 | 1848137369 | https://place.map.kakao.com/1848137369 |
| 5 | 물레방아 즉석구이 | jeonhyun-nampo-mullebanga-jeukseokgui | 부산 중구 중앙대로41번길 11-1 | 물레방아즉석구이 (부산 중구 중앙대로41번길 11-1) | 051-245-1195 | 8301894 | https://place.map.kakao.com/8301894 |
| 6 | 여송제 | jeonhyun-nampo-yeosongje | 부산 중구 광복로18번길 5 | 여송제 (부산 중구 광복로18번길 5) | 051-246-2111 | 10656018 | https://place.map.kakao.com/10656018 |
| 7 | 백일평냉 | saengdal-gwangalli-baegil-pyeongnaeng | 부산 수영구 남천바다로10번길 29 1층 | 백일평냉 (부산 수영구 남천바다로10번길 29) | 051-625-5515 | 1174747976 | https://place.map.kakao.com/1174747976 |
| 8 | 이재모피자 본점 | tzuyang-nampo-ijaemo-pizza | 부산 중구 광복중앙로 31 | 이재모피자 본점 (부산 중구 광복중앙로 31) | 051-255-9494 | 10070964 | https://place.map.kakao.com/10070964 |

## REVIEW
| No | 식당명 | slug | 후보 | 충돌/매칭 | 검토 이유 |
| -: | --- | --- | --- | --- | --- |
| 1 | 연합횟집 | jeonhyun-gwangalli-yeonhap-hoejip | 연합횟집 (부산 수영구 황령대로489번길 59) | name=EXACT,addr=PARTIAL,phone=MISSING,dist=15m | EXACT 기준 강후보 없음(최상위 name=EXACT,addr=PARTIAL,phone=MISSING) |
| 2 | 왔다식당 | jeonhyun-yeongdo-watda-sikdang | 왔다식당 (부산 영도구 하나길 811) | name=EXACT,addr=EXACT,phone=MISSING,dist=6m | 주소·이름 부합 후보 2개(중복 아님) |
| 3 | 초필살돼지구이 해운대본점 | tzuyang-haeundae-chopilsal | 초필살돼지구이 본점 (부산 해운대구 마린시티3로 23) | name=PARTIAL,addr=EXACT,phone=MISSING,dist=37m | 이름/주소/전화 조합이 EXACT 기준 미달(name=PARTIAL,addr=EXACT,phone=MISSING) |

## NO_MATCH
| No | 식당명 | slug | 사용 검색어 | 결과 |
| -: | --- | --- | --- | --- |
| 1 | 영희할매재첩국 | 2tv-sasang-yeonghui-halmae-jaecheopguk | 영희할매재첩국 / 영희할매재첩국 사상 / 영희할매재첩국 사상구 | 검색 결과 없음 |
| 2 | 담미옥 | saengdal-seomyeon-dammiok | 담미옥 / 담미옥 서면 / 담미옥 부산진구 | 부산 내 이름·주소 부합 후보 없음 |

## BLOCKED
| No | 식당명 | slug | 원인 |
| -: | --- | --- | --- |
| - | - | - | 없음 |

## 예상 before / after (EXACT_MATCH만)
| 식당 | slug | kakao_map_url before | after | lat before | after | lng before | after |
| --- | --- | --- | --- | -: | -: | -: | -: |
| 마포본가 | ansungjae-yeonje-mapobonga | (null) | https://place.map.kakao.com/17981818 | 35.184342930923 | 35.1839806679219 | 129.082279198059 | 129.082174348441 |
| 수복센타 | baekban-nampo-subok-centa | (null) | https://place.map.kakao.com/11128820 | 35.0988509225395 | 35.09888829266081 | 129.031456197999 | 129.0314310282674 |
| 옛날국수집 | baekban-seogu-yetnal-guksujip | (null) | https://place.map.kakao.com/964978610 | 35.099268125477 | 35.09927130462 | 129.016099525161 | 129.016103441313 |
| 비와술잔 | jeonhyun-gwangalli-biwa-suljan | (null) | https://place.map.kakao.com/1848137369 | 35.1402076759138 | 35.14020600272599 | 129.109263956848 | 129.10926171957024 |
| 물레방아 즉석구이 | jeonhyun-nampo-mullebanga-jeukseokgui | (null) | https://place.map.kakao.com/8301894 | 35.1013730572428 | 35.1010511492018 | 129.036245143996 | 129.03513510735 |
| 여송제 | jeonhyun-nampo-yeosongje | (null) | https://place.map.kakao.com/10656018 | 35.0993184361462 | 35.09916210802681 | 129.027038390805 | 129.02718770394407 |
| 백일평냉 | saengdal-gwangalli-baegil-pyeongnaeng | (null) | https://place.map.kakao.com/1174747976 | 35.1485634371324 | 35.1485560183374 | 129.111648737636 | 129.111645254415 |
| 이재모피자 본점 | tzuyang-nampo-ijaemo-pizza | (null) | https://place.map.kakao.com/10070964 | 35.1021026782328 | 35.10204215079571 | 129.030582344104 | 129.030747190728 |

## 다음 권장 작업
- EXACT_MATCH만 사용자 승인 후 DB 반영
- REVIEW는 외부 출처 추가 조사
- NO_MATCH는 수동 Kakao 지도 확인
- 자동 수정 금지
