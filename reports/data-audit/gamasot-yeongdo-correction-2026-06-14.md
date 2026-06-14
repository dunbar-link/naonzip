# 가마솥돼지국밥 영도점 주소·전화·좌표 정합화 결과 — 2026-06-14

DATA_CORRECTION_FIRST 대상이던 가마솥돼지국밥 영도점의 주소·좌표 충돌을 Kakao Local API 재검증 후 교정했다.
가마솥돼지국밥 영도점 1건만 수정.

## Summary
- 최종 판정: 6조건 모두 충족 → 수정 진행
- DB 수정: 있음 (restaurants 1행)
- 영향행: 1 (id+slug 이중조건)
- 수정 필드: address · phone · lat · lng (kakao_map_url은 이미 정확하여 유지)
- 앱 코드/스키마 변경: 없음

## DB 기존값
- name: 가마솥돼지국밥 영도점
- slug: baekban-yeongdo-gamasot-doejigukbap
- address: 부산 영도구 절영로49번길 25
- phone: null
- kakao_map_url: https://place.map.kakao.com/15526776
- lat/lng: 35.0898602 / 129.0390491

## 장소 재검증 (Kakao Local API, 2026-06-14)
- 검색 결과: "가마솥돼지국밥 영도점/영도" 6건
- selected place: 가마솥돼지국밥 (place 15526776)
- place ID: 15526776 (DB kakao_map_url과 동일 — 원래부터 정확)
- 이름 일치: ✅ (영도 유일 "가마솥돼지국밥", DB "영도점"은 내부 지점 표기)
- 주소 일치: ✅ 부산 영도구 남항시장길 350 (지번 신선동2가 37-3)
- 전화 일치: ✅ 051-413-8609 (Kakao 사업자정보)
- 지점 일치: ✅ 백반기행 출연 영도 가마솥돼지국밥 = 남항시장길 350
- latitude: 35.0874972118328 / longitude: 129.044148012405
- 탈락 후보: 소담가마솥돼지국밥(태종로 638, 다른 상호, 3.4km) / 1등가마솥돼지국밥 남포점(중구) / 가마솥돼지국밥(남구 우암동) / 유림·현아가마솥돼지국밥(사하구) — 영도 순수 "가마솥돼지국밥"은 15526776 단일
- 핵심: DB kakao_map_url(15526776=남항시장길)은 원래 정확했고, address·좌표만 절영로49번길 25(533m 이격)로 오입력돼 있었음

## 변경 결과
| 필드 | before | after |
| --- | --- | --- |
| address | 부산 영도구 절영로49번길 25 | 부산 영도구 남항시장길 350 |
| phone | null | 051-413-8609 |
| kakao_map_url | https://place.map.kakao.com/15526776 | (유지) |
| lat | 35.0898602 | 35.0874972118328 |
| lng | 129.0390491 | 129.044148012405 |

- 유지 필드: name(가마솥돼지국밥 영도점) / area(영도) / category(돼지국밥) / main_menu(돼지국밥) / price_text(돼지국밥 (가격 확인 필요)) / slug / thumbnail / is_published

## 전체 DB 검증 (반영 후 독립 SELECT)
- 전체 restaurants: 107
- 공개 restaurants: 90
- 공개 thumbnail: 90
- 공개 thumbnail 누락: 0
- 공개 kakao_map_url 누락: 1 (담미옥, 유지)
- 공개 phone 누락: 13 (14 → 13)
- placeholder 전화: 0

## 참고
- price_text "돼지국밥 (가격 확인 필요)"는 이번 작업 범위 밖(메뉴 가격 별도 확인 대상).
- 잔여 phone 누락 13곳은 담미옥(DATA_CORRECTION)·씨앗호떡(PHONE_NOT_APPLICABLE)·MANUAL_REVIEW 10곳·원조가야밀면(NO_MATCH)으로 자동 반영 대상 아님.
