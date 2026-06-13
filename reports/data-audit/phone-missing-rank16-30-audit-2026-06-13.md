# 공개 phone 누락 우선순위 16~30위 감사 — 2026-06-13

read-only(SELECT + Kakao Local API + 네이버/공식 웹 교차). DB 미수정.

## 요약
- 기존 순위 범위: 16~30 (15곳)
- 실제 조사 대상: 14곳
- 제외: 1곳 (28위 담미옥 — Kakao 별도 보류, 순위 보충 안 함)
- EXACT_MATCH: 4
- REVIEW: 9
- NO_MATCH: 1
- CLOSED_OR_MOVED: 0
- PHONE_NOT_APPLICABLE: 0
- BLOCKED: 0
- DB 수정: 없음
- 앱 코드 변경: 없음

## 대상 목록
| 순위 | 식당명 | slug | 주소 | Kakao 연결 | 조사 |
|---:|---|---|---|---|---|
| 16 | 속씨원한 대구탕 해운대 본점 | sokssiwonhan-daegutang-haeundae | 해운대 해운대로570번길 11 | 검색링크 | O |
| 17 | 회국수할매집 | hoeguksu-halmaejip | 서면 서면문화로 5 | 검색링크 | O |
| 18 | 원조할매낙지 | samdae-seomyeon-wonjo-halmae-nakji | 서면 골드테마길 10 | place 8035148 | O |
| 19 | 이가네떡볶이 본점 | iganae-tteokbokki | 남포동 부평1길 48 | place 20204736 | O |
| 20 | 금손1983 | sungsik-gwangalli-geumson-1983 | 광안리 수영로680번길 54 | place 855139094 | O |
| 21 | 해진아나고 | sungsik-gwangalli-haejin-anago | 광안리 광서로10번길 47 | place 22205150 | O |
| 22 | 다리집 | tzuyang-gwangalli-darijip | 광안리 남천바다로10번길 70 | place 8849564 | O |
| 23 | 상국이네 | tzuyang-haeundae-sanggukine | 해운대 구남로41번길 40-1 | place 9089301 | O |
| 24 | 동춘이만두 | tzuyang-seomyeon-dongchuni-mandu | 서면 당감로25번길 11 | place 27361254 | O |
| 25 | 원조가야밀면 | wonjo-gaya-milmyeon | 사하구 낙동대로451번길 33 | place 505835564 | O |
| 26 | 가마솥돼지국밥 영도점 | baekban-yeongdo-gamasot-doejigukbap | 영도 절영로49번길 25 | place 15526776 | O |
| 27 | 마포본가 | ansungjae-yeonje-mapobonga | 연제 월드컵대로111번길 10 | place 17981818 | O |
| 28 | 담미옥 | saengdal-seomyeon-dammiok | 서면(개금) | 없음 | 제외(Kakao 보류) |
| 29 | 수타혜미칼국수 | jeonhyun-namgu-suta-hyemi-kalguksu | 남구 문현금융로 4 | place 26436780 | O |
| 30 | 송스 베이커리 | saengdal-geumjeong-songs-bakery | 금정구 수림로 26 | place 1678402588 | O |

## EXACT_MATCH (4곳 — Kakao 지역번호 + 웹 2출처 일치)
| 순위 | 식당명 | slug | 확인 전화 | 핵심 근거 | 반영 가능 |
|---:|---|---|---|---|---|
| 17 | 회국수할매집 | hoeguksu-halmaejip | 051-817-9260 | Kakao+식신+autoreserve | 예 |
| 18 | 원조할매낙지 | samdae-seomyeon-wonjo-halmae-nakji | 051-643-5037 | Kakao+공식인스타+트립+다이닝 | 예 |
| 19 | 이가네떡볶이 본점 | iganae-tteokbokki | 051-245-0413 | Kakao+식신+트립+다이닝 | 예 |
| 30 | 송스 베이커리 | saengdal-geumjeong-songs-bakery | 051-518-0303 | Kakao+식신+다이닝+베이커리뉴스 | 예 |

## REVIEW (9곳)
| 순위 | 식당명 | slug | 전화 후보 | 충돌·보류 이유 | 추가 확인 |
|---:|---|---|---|---|---|
| 16 | 속씨원한 대구탕 해운대 본점 | sokssiwonhan-daegutang-haeundae | 051-731-4222(Kakao) | Kakao 단독, 2차 미확보 | 네이버지도 |
| 20 | 금손1983 | sungsik-gwangalli-geumson-1983 | 051-711-1983 vs 051-921-1983 | 가운데자리 충돌 | 네이버지도 |
| 21 | 해진아나고 | sungsik-gwangalli-haejin-anago | 010-8599-1090(Kakao) vs 051-757-9262(웹) | 개인폰 vs 지역번호 | 네이버지도 (지역번호 우선) |
| 22 | 다리집 | tzuyang-gwangalli-darijip | 010-8898-6681(웹) | 개인폰만, 지역 대표번호 부재 | 네이버지도 |
| 23 | 상국이네 | tzuyang-haeundae-sanggukine | 051-742-9001(Kakao) vs 070-7776-7715(웹) | 지역 vs 070 인터넷전화 | 네이버지도 |
| 24 | 동춘이만두 | tzuyang-seomyeon-dongchuni-mandu | 051-896-1869(Kakao) | Kakao 단독, 2차 미확보 | 네이버지도 |
| 26 | 가마솥돼지국밥 영도점 | baekban-yeongdo-gamasot-doejigukbap | 051-413-8609 | DB주소(절영로49번길 25) vs 실제(남항시장길 350) 충돌 | 주소 교정 선행 |
| 27 | 마포본가 | ansungjae-yeonje-mapobonga | 051-867-9252(Kakao) vs 0507-1478-9253(웹) | 안심번호 끝자리 불일치 | 네이버지도 |
| 29 | 수타혜미칼국수 | jeonhyun-namgu-suta-hyemi-kalguksu | 051-635-8587(Kakao) | Kakao 단독, 2차 미확보 | 네이버지도 |

## NO_MATCH (1곳)
| 순위 | 식당명 | slug | 조사 결과 | 다음 확인 |
|---:|---|---|---|---|
| 25 | 원조가야밀면 | wonjo-gaya-milmyeon | 사하구 낙동대로451번길 33 지점 전화 Kakao·웹 모두 미확보. 동명 다지점만 확인(혼입 위험) | 해당 지점 직접 확인 |

## CLOSED_OR_MOVED (0곳)
- 해당 없음 (14곳 모두 영업 확인)

## PHONE_NOT_APPLICABLE (0곳)
- 해당 없음. (다리집은 점포가 있어 N/A 아님, 개인폰만 확인되어 REVIEW)

## 예상 before / after (EXACT_MATCH 4곳만)
| 식당 | slug | phone before | recommended phone | 출처 |
|---|---|---|---|---|
| 회국수할매집 | hoeguksu-halmaejip | null | 051-817-9260 | Kakao+식신+autoreserve |
| 원조할매낙지 | samdae-seomyeon-wonjo-halmae-nakji | null | 051-643-5037 | Kakao+인스타+트립+다이닝 |
| 이가네떡볶이 본점 | iganae-tteokbokki | null | 051-245-0413 | Kakao+식신+트립+다이닝 |
| 송스 베이커리 | saengdal-geumjeong-songs-bakery | null | 051-518-0303 | Kakao+식신+다이닝+베이커리뉴스 |

## 다음 단계
- EXACT_MATCH 4곳만 사용자 승인 후 phone 반영.
- REVIEW 9곳: 네이버지도 2차 출처로 충돌/안심번호/개인폰 해소 후 재판정. 26번 가마솥돼지국밥은 주소(절영로49번길 25 vs 남항시장길 350) 교정 선행.
- NO_MATCH(원조가야밀면): 사하구 하단점 직접 확인(동명 다지점 번호 혼입 금지).
- 이후 기존 우선순위 31~43위 read-only 감사.
