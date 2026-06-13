# 공개 phone PHONE_READY 6곳 반영 결과 — 2026-06-13

잔여 20곳 통합 재분류(`phone-remaining-20-triage-2026-06-13`)에서 PHONE_READY로 확정된 6곳에
`phone` 필드만 반영했다. DATA_CORRECTION_FIRST·PHONE_NOT_APPLICABLE·MANUAL_REVIEW·NO_MATCH(보호대상 14곳)는 수정하지 않았다.

## Summary
- 대상: 6
- 성공: 6 / 실패: 0
- phone 반영: 6곳 (기존 전부 null → 검증값)
- 보호 대상 미수정: 14곳
- 앱 코드 변경: 없음
- DB write 범위: `restaurants` 6행, `phone`만 (각 영향행 1)

## 식당별 변경
| 식당 | slug | phone before | phone after | 영향행 | 다른 필드 유지 |
| --- | --- | --- | --- | ---: | --- |
| 속씨원한 대구탕 해운대 본점 | sokssiwonhan-daegutang-haeundae | null | 051-731-4222 | 1 | kakao(검색링크)·좌표 유지(아래) |
| 연지가양곱창 | tzuyang-yeonje-yeonji-yanggopchang | null | 051-853-2345 | 1 | 유지 |
| 옛날국수집 | baekban-seogu-yetnal-guksujip | null | 051-241-7454 | 1 | 유지 |
| 동춘이만두 | tzuyang-seomyeon-dongchuni-mandu | null | 051-896-1869 | 1 | 유지 |
| 수타혜미칼국수 | jeonhyun-namgu-suta-hyemi-kalguksu | null | 051-635-8587 | 1 | 유지 |
| 사또분식 | saengdal-yeongdo-sato-bunsik | null | 051-415-3764 | 1 | address·kakao·좌표 유지(아래) |

- 독립 SELECT 검증: 6곳 모두 phone 외 필드(name/address/area/category/main_menu/price_text/kakao_map_url/lat/lng/thumbnail/is_published) 변경 없음.
- 확정 근거: 각 Kakao 지역번호 + 2차 출처(식신·다이닝코드·트립·먹자·여행의기술·polle 등) 동일.
- 타지점 배제: 속씨원한대구탕(미포본점)·옛날국수집(제주·용인·대구)·동춘이만두(인천) 등 동명 타지점과 구분 확인.

## 보호 대상 (이번 작업에서 변경 없음, 미변경 확인)
- DATA_CORRECTION_FIRST 2곳: 가마솥돼지국밥 영도점 / 담미옥 → 변경 없음
- PHONE_NOT_APPLICABLE 1곳: 남포동 씨앗호떡 → 변경 없음
- MANUAL_REVIEW 10곳: 한약방돼지국밥·비와술잔·블랑제리라센·금손1983·해진아나고·다리집·상국이네·마포본가·합천국밥집·주례수육칼국수 2호점 → 변경 없음
- NO_MATCH 1곳: 원조가야밀면 → 변경 없음
- 총 14곳 phone·name·address·kakao_map_url·좌표 미변경 확인.

## 별도 후속 검토 (이번 작업 미수정)
### 속씨원한 대구탕 해운대 본점 (sokssiwonhan-daegutang-haeundae)
- phone 반영 완료: 051-731-4222
- kakao_map_url 검색링크(place 13299874 연결 권장) — 이번 미수정, 지도·좌표 별도 교정
### 사또분식 (saengdal-yeongdo-sato-bunsik)
- phone 반영 완료: 051-415-3764
- 주소 번지 표기 차이(Kakao place 절영로35번길 37 vs DB 39) — 이번 미수정, 별도 검토

## 전체 DB 검증 (반영 후 독립 SELECT)
- 전체 restaurants: 107
- 공개 restaurants: 90
- 공개 thumbnail: 90
- 공개 thumbnail 누락: 0
- 공개 kakao_map_url 누락: 1 (담미옥, 유지)
- 공개 phone 누락: 14 (20 → 14)
- placeholder 전화: 0
