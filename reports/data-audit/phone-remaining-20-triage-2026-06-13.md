# 공개 phone 누락 잔여 20곳 통합 재분류 — 2026-06-13

기존 감사(top15·review6·rank16-30·rank31-43)에서 REVIEW/NO_MATCH/보류였던 20곳을 작업 유형으로 통합 재분류.
read-only(SELECT + 기존 출처 정리 + Kakao 단독 항목만 네이버/다이닝 2차 추가). DB 미수정.

## 요약
- DB 잔여 phone 누락: 20
- PHONE_READY: 6
- DATA_CORRECTION_FIRST: 2
- PHONE_NOT_APPLICABLE: 1
- MANUAL_REVIEW: 10
- NO_MATCH: 1
- CLOSED_OR_MOVED: 0
- BLOCKED: 0
- DB 수정: 없음
- 앱 코드 변경: 없음

## PHONE_READY (6곳 — Kakao 지역번호 + 2차 출처 일치)
| 식당 | slug | 확인 전화 | 확정 근거 | 반영 가능 |
|---|---|---|---|---|
| 속씨원한 대구탕 해운대 본점 | sokssiwonhan-daegutang-haeundae | 051-731-4222 | Kakao+식신+다이닝+트립 (미포본점 구분) | 예 (kakao_map_url 검색링크는 지도교정 별도) |
| 연지가양곱창 | tzuyang-yeonje-yeonji-yanggopchang | 051-853-2345 | Kakao+다이닝코드 | 예 |
| 옛날국수집 | baekban-seogu-yetnal-guksujip | 051-241-7454 | Kakao+다이닝+먹자 | 예 |
| 동춘이만두 | tzuyang-seomyeon-dongchuni-mandu | 051-896-1869 | Kakao+다이닝코드 | 예 |
| 수타혜미칼국수 | jeonhyun-namgu-suta-hyemi-kalguksu | 051-635-8587 | Kakao+다이닝+전현무계획2 | 예 |
| 사또분식 | saengdal-yeongdo-sato-bunsik | 051-415-3764 | Kakao+다이닝+여행의기술+polle | 예 |

## DATA_CORRECTION_FIRST (2곳)
| 식당 | slug | 전화 후보 | 선행 교정 항목 | 권장 작업 |
|---|---|---|---|---|
| 가마솥돼지국밥 영도점 | baekban-yeongdo-gamasot-doejigukbap | 051-413-8609 | DB주소(절영로49번길 25) vs Kakao place(남항시장길 350) 충돌 | 주소·Kakao 교정 후 phone+지도 동시 |
| 담미옥 | saengdal-seomyeon-dammiok | 미확정 | kakao_map_url null, 개금 담미옥 Kakao place 미특정(중구 해관로 담미옥 별개) | Kakao place 수동 확인 후 지도+phone |

## PHONE_NOT_APPLICABLE (1곳)
| 식당 | slug | 업소 형태 | 판단 근거 | 점검 예외 제안 |
|---|---|---|---|---|
| 남포동 씨앗호떡 | tzuyang-nampo-ssiat-hotteok | BIF광장 거리 노점 | 단일 점포 아닌 시장 통칭, 사업자 대표전화 부재 | 운영점검에서 phone 누락 예외 대상 검토(이번 작업 규칙 미변경) |

## MANUAL_REVIEW (10곳)
| 식당 | slug | 전화 후보 | 미해결 문제 | 필요한 수동 확인 |
|---|---|---|---|---|
| 한약방돼지국밥 형제식품 | hanyakbang-gukbap-hyeongje-food | 051-646-3102(지역) / 0507-1329-5026(안심) | 끝자리 불일치 + kakao 검색링크 | 네이버 지역번호 + kakao place 연결 |
| 비와술잔 | jeonhyun-gwangalli-biwa-suljan | 051-621-2540 | Kakao 단독, 2차 미확보 | 네이버지도 |
| 블랑제리 라센 | saengdal-gwangalli-boulangerie-lassence | 051-710-1417 | Kakao 단독, 2차 미확보 | 네이버지도·공식SNS |
| 금손1983 | sungsik-gwangalli-geumson-1983 | 051-711-1983 / 051-921-1983 | 가운데자리 충돌 | 네이버지도 |
| 해진아나고 | sungsik-gwangalli-haejin-anago | 010-8599-1090(개인폰) / 051-757-9262 | 개인폰 vs 지역번호(개인폰 추천 금지) | 네이버지도(지역번호 우선) |
| 다리집 | tzuyang-gwangalli-darijip | 010-8898-6681(개인폰) | 개인폰만, 지역 대표번호 부재 | 네이버지도 |
| 상국이네 | tzuyang-haeundae-sanggukine | 051-742-9001 / 070-7776-7715 | 지역 vs 070 인터넷전화 | 네이버지도 |
| 마포본가 | ansungjae-yeonje-mapobonga | 051-867-9252 / 0507-1478-9253(안심) | 끝자리 불일치(9252/9253) | 네이버지도 |
| 합천국밥집 | pungja-namgu-hapcheon-gukbap | 051-622-4898 / 051-628-4898 | 가운데자리 충돌 | 네이버지도 |
| 주례수육칼국수 2호점 | saengsaeng-sasang-jurye-suyuk-kalguksu | 0502-5553-2589(안심) / 051-312-4628 | 안심 vs 지역 끝자리 불일치 | 네이버지도(지역번호 우선) |

## NO_MATCH (1곳)
| 식당 | slug | 조사 결과 |
|---|---|---|
| 원조가야밀면 | wonjo-gaya-milmyeon | 사하구 낙동대로451번길 33 지점 전화 Kakao·웹 미확보. 동명 다지점만 확인(혼입 위험) → 해당 지점 직접 확인 필요 |

## CLOSED_OR_MOVED / BLOCKED
- 해당 없음 (20곳 모두 영업 확인, DB·외부 조사 정상)

## 다음 실제 반영 후보 (PHONE_READY before/after)
| 식당 | slug | phone before | recommended phone |
|---|---|---|---|
| 속씨원한 대구탕 해운대 본점 | sokssiwonhan-daegutang-haeundae | null | 051-731-4222 |
| 연지가양곱창 | tzuyang-yeonje-yeonji-yanggopchang | null | 051-853-2345 |
| 옛날국수집 | baekban-seogu-yetnal-guksujip | null | 051-241-7454 |
| 동춘이만두 | tzuyang-seomyeon-dongchuni-mandu | null | 051-896-1869 |
| 수타혜미칼국수 | jeonhyun-namgu-suta-hyemi-kalguksu | null | 051-635-8587 |
| 사또분식 | saengdal-yeongdo-sato-bunsik | null | 051-415-3764 |

## 다음 단계
- PHONE_READY 6곳 승인 후 phone 반영 → phone 누락 20 → 14.
- DATA_CORRECTION_FIRST 2곳(가마솥돼지국밥 영도점·담미옥): 주소·Kakao 정합화 선행 후 phone.
- PHONE_NOT_APPLICABLE 1곳(씨앗호떡): 운영점검 예외 처리 설계 검토(규칙 변경은 별도).
- MANUAL_REVIEW 10곳: 네이버지도 직접 확인 또는 전화 연결 확인. 개인폰·충돌·안심번호 해소 시 반영.
- NO_MATCH 1곳(원조가야밀면): 사하구 하단점 직접 확인.
