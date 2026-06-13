# 공개 phone 우선순위 16~30위 EXACT_MATCH 4곳 반영 결과 — 2026-06-13

직전 16~30위 감사(`phone-missing-rank16-30-audit-2026-06-13`)에서 EXACT_MATCH로 확정된 4곳에
`phone` 필드만 반영했다. REVIEW 9곳·NO_MATCH(원조가야밀면)·기존 보류는 수정하지 않았다.

## Summary
- 대상: 4
- 성공: 4 / 실패: 0
- phone 반영: 4곳 (기존 전부 null → 검증값)
- REVIEW 미수정: 9곳
- NO_MATCH 미수정: 1곳 (원조가야밀면)
- 앱 코드 변경: 없음
- DB write 범위: `restaurants` 4행, `phone`만 (각 영향행 1)

## 식당별 변경
| 식당 | slug | phone before | phone after | 영향행 | 다른 필드 유지 |
| --- | --- | --- | --- | ---: | --- |
| 회국수할매집 | hoeguksu-halmaejip | null | 051-817-9260 | 1 | name·address·kakao·좌표·thumbnail 유지 |
| 원조할매낙지 | samdae-seomyeon-wonjo-halmae-nakji | null | 051-643-5037 | 1 | 유지 |
| 이가네떡볶이 본점 | iganae-tteokbokki | null | 051-245-0413 | 1 | 유지 |
| 송스 베이커리 | saengdal-geumjeong-songs-bakery | null | 051-518-0303 | 1 | 유지 |

- 독립 SELECT 검증: 4곳 모두 phone 외 필드 변경 없음.
- 확정 근거: 각 Kakao 지역번호 + 웹 2~3출처(식신·다이닝코드·autoreserve·공식인스타·트립·베이커리뉴스) 동일.
- 타지점 번호 배제: 원조할매낙지(창원·안동·대전), 이가네떡볶이(서울·롯데부산본점) 등 동명 타지점과 구분 확인.

## 보호 대상 (이번 작업에서 변경 없음, 미변경 확인)
- REVIEW 9곳: 속씨원한 대구탕 해운대 본점 / 금손1983 / 해진아나고 / 다리집 / 상국이네 / 동춘이만두 / 가마솥돼지국밥 영도점 / 마포본가 / 수타혜미칼국수
- NO_MATCH: 원조가야밀면
- 기존 보류: 한약방돼지국밥 형제식품 / 비와술잔 / 블랑제리 라센 / 남포동 씨앗호떡 / 담미옥
- 15곳 전부 phone·name·address·kakao_map_url 미변경 확인.

## 별도 교정 필요
### 가마솥돼지국밥 영도점 (baekban-yeongdo-gamasot-doejigukbap)
- phone 후보(051-413-8609)는 이번에 미반영
- DB 주소(절영로49번길 25) vs 실제 Kakao place(남항시장길 350) 충돌 → 주소 정합화 선행 필요
- 주소·Kakao·전화 동시 교정 작업으로 분리

## 전체 DB 검증 (반영 후 독립 SELECT)
- 전체 restaurants: 107
- 공개 restaurants: 90
- 공개 thumbnail: 90
- 공개 thumbnail 누락: 0
- 공개 kakao_map_url 누락: 1 (담미옥, 유지)
- 공개 phone 누락: 28 (32 → 28)
- placeholder 전화: 0
