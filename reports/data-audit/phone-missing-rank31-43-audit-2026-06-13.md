# 공개 phone 누락 우선순위 31~43위 감사 — 2026-06-13

read-only(SELECT + Kakao Local API + 네이버/공식 웹 교차). DB 미수정. (마지막 우선순위 배치)

## 요약
- 기존 순위 범위: 31~43
- 원래 행 수: 13
- 실제 조사 대상: 13 (제외 0 — 기존 미해결 식당은 전부 30위 이하)
- 제외: 0
- EXACT_MATCH: 8
- REVIEW: 5
- NO_MATCH: 0
- CLOSED_OR_MOVED: 0
- PHONE_NOT_APPLICABLE: 0
- BLOCKED: 0
- DB 수정: 없음
- 앱 코드 변경: 없음

## 제외 대상
- 없음 (priority_rank 31~43에 기존 미해결/조사완료 식당 미포함)

## 실제 조사 대상 (순위 / 식당명 / 분류)
31 쉐라미과자점 | 사하구 | EXACT_MATCH
32 연지가양곱창 | 연제 | REVIEW
33 합천일류돼지국밥 | 사상 | EXACT_MATCH
34 합천국밥집 | 남구 | REVIEW
35 옛날국수집 | 서구 | REVIEW
36 김유순대구뽈찜전문점 | 남구 | EXACT_MATCH
37 사또분식 | 영도 | REVIEW
38 내호냉면 | 남구 | EXACT_MATCH
39 삼진어묵 본점 | 영도 | EXACT_MATCH
40 주례수육칼국수 2호점 | 사상 | REVIEW
41 삼성갈미조개 | 강서 | EXACT_MATCH
42 동방밀면 | 영도 | EXACT_MATCH
43 동삼동불짬뽕 | 영도 | EXACT_MATCH

## EXACT_MATCH (8곳)
| 순위 | 식당명 | slug | 확인 전화 | 핵심 근거 | 반영 가능 |
|---:|---|---|---|---|---|
| 31 | 쉐라미과자점 | saengdal-saha-cheramie | 051-208-0033 | Kakao+식신+백년가게+부산일보 (상호 1974쉐라미 표기차) | 예 |
| 33 | 합천일류돼지국밥 | ddoganjip-hapcheon-ilryu-dwaeji-gukbap | 051-317-2478 | Kakao+autoreserve+비짓부산+식신 | 예 |
| 36 | 김유순대구뽈찜전문점 | kimyusun-daegu-bbol-jjim | 051-627-4319 | Kakao+식신+다이닝+비짓부산+공식인스타 | 예 |
| 38 | 내호냉면 | naeho-naengmyeon | 051-646-6195 | Kakao+나무위키+구석구석+식신 (단일 노포, 주소 별도확인) | 예 |
| 39 | 삼진어묵 본점 | live-today-samjin-eomuk | 051-715-5865 | Kakao+공식쇼핑몰+식신+비짓부산 | 예 |
| 41 | 삼성갈미조개 | tzuyang-gangseo-samseong-galmijogae | 051-271-0722 | Kakao 지역번호 + 웹 안심번호 0507-1411-0722 끝자리 0722 동일 | 예 |
| 42 | 동방밀면 | tzuyang-yeongdo-dongbang-milmyeon | 051-416-9592 | Kakao+다이닝+polle | 예 |
| 43 | 동삼동불짬뽕 | tzuyang-yeongdo-dongsamdong-buljjampong | 051-403-7388 | Kakao+다이닝+트립+식신 | 예 |

## REVIEW (5곳)
| 순위 | 식당명 | slug | 전화 후보 | 보류 이유 | 추가 확인 |
|---:|---|---|---|---|---|
| 32 | 연지가양곱창 | tzuyang-yeonje-yeonji-yanggopchang | 051-853-2345(Kakao) | Kakao 단독, 2차 미확보 | 네이버지도 |
| 34 | 합천국밥집 | pungja-namgu-hapcheon-gukbap | 051-622-4898(Kakao) vs 051-628-4898(웹) | 가운데자리 충돌(웹 628+DB주소 일치) | 네이버지도 |
| 35 | 옛날국수집 | baekban-seogu-yetnal-guksujip | 051-241-7454(Kakao) | Kakao 단독, 2차 미확보 | 네이버지도 |
| 37 | 사또분식 | saengdal-yeongdo-sato-bunsik | 051-415-3764(Kakao) | Kakao 단독(주소 37/39 미세차), 2차 미확보 | 네이버지도 |
| 40 | 주례수육칼국수 2호점 | saengsaeng-sasang-jurye-suyuk-kalguksu | 0502-5553-2589(Kakao 안심) vs 051-312-4628(웹 지역) | 안심 vs 지역 끝자리 불일치 | 네이버지도(지역번호 우선) |

## NO_MATCH / CLOSED_OR_MOVED / PHONE_NOT_APPLICABLE (0곳)
- 해당 없음 (13곳 모두 영업 확인)

## 예상 before / after (EXACT_MATCH 8곳만)
| 식당 | slug | phone before | recommended phone | 근거 |
|---|---|---|---|---|
| 쉐라미과자점 | saengdal-saha-cheramie | null | 051-208-0033 | Kakao+식신+백년가게 |
| 합천일류돼지국밥 | ddoganjip-hapcheon-ilryu-dwaeji-gukbap | null | 051-317-2478 | Kakao+autoreserve+비짓부산+식신 |
| 김유순대구뽈찜전문점 | kimyusun-daegu-bbol-jjim | null | 051-627-4319 | Kakao+식신+다이닝+비짓부산+인스타 |
| 내호냉면 | naeho-naengmyeon | null | 051-646-6195 | Kakao+나무위키+구석구석+식신 |
| 삼진어묵 본점 | live-today-samjin-eomuk | null | 051-715-5865 | Kakao+공식쇼핑몰+식신+비짓부산 |
| 삼성갈미조개 | tzuyang-gangseo-samseong-galmijogae | null | 051-271-0722 | Kakao 지역번호(안심 0507 끝자리 동일) |
| 동방밀면 | tzuyang-yeongdo-dongbang-milmyeon | null | 051-416-9592 | Kakao+다이닝+polle |
| 동삼동불짬뽕 | tzuyang-yeongdo-dongsamdong-buljjampong | null | 051-403-7388 | Kakao+다이닝+트립+식신 |

## 다음 단계
- EXACT_MATCH 8곳만 사용자 승인 후 phone 반영 → phone 누락 28 → 20.
- REVIEW 5곳: 네이버지도 2차 출처로 충돌/단독/안심번호 해소 후 재판정.
- 내호냉면은 phone EXACT지만 DB 주소(장고개로 11-5 vs 우암번영로26번길 17)는 별도 확인 권장.
- 우선순위 감사 1~43위 전 범위 1회 완료. 이후 누적 REVIEW(전 범위)를 네이버지도 기반으로 일괄 재판정 권장.
