# 공개 phone EXACT_MATCH 3곳 반영 결과 — 2026-06-13

직전 REVIEW 6곳 2차 검증(`phone-review-6-audit-2026-06-13`)에서 EXACT_MATCH로 확정된 3곳에
`phone` 필드만 반영했다. REVIEW 3곳(한약방돼지국밥·비와술잔·블랑제리 라센)은 수정하지 않았다.

## Summary
- 대상: 3
- 성공: 3 / 실패: 0
- phone 반영: 3곳 (기존 전부 null → 검증값)
- REVIEW 미수정: 3곳
- 앱 코드 변경: 없음
- DB write 범위: `restaurants` 3행, `phone`만 (각 영향행 1)

## 식당별 변경
| 식당 | slug | phone before | phone after | 영향행 | 다른 필드 유지 |
| --- | --- | --- | --- | ---: | --- |
| 백일평냉 | saengdal-gwangalli-baegil-pyeongnaeng | null | 051-625-5515 | 1 | name·address·kakao·좌표·thumbnail 유지 |
| 이재모피자 본점 | tzuyang-nampo-ijaemo-pizza | null | 051-255-9494 | 1 | 유지 |
| 백화양곱창 1호 | baekhwa-yanggopchang-1ho | null | 051-245-0105 | 1 | 유지 |

- 독립 SELECT 검증: 3곳 모두 phone 외 필드(name/address/area/category/main_menu/price_text/kakao_map_url/lat/lng/thumbnail/is_published) 변경 없음.
- 확정 근거:
  - 백일평냉 051-625-5515: Kakao 지역번호(웹 0507-1419-5515는 끝자리 5515 동일 네이버 안심번호 → 지역번호 우선)
  - 이재모피자 본점 051-255-9494: Kakao+나무위키+비짓부산+캐치테이블+공식 인스타 일치
  - 백화양곱창 1호 051-245-0105: Kakao 1호+다이닝코드+대한민국구석구석 일치
- 배제한 번호:
  - 이재모피자 051-245-1478 (1478계열 지점 번호 혼동값)
  - 백화양곱창 051-257-3352 (자갈치 양곱창 골목 타호수/구번호)

## 보호 대상 (이번 작업에서 변경 없음, phone null 유지 확인)
- 한약방돼지국밥 형제식품 (hanyakbang-gukbap-hyeongje-food): phone null 유지 (REVIEW — 지역번호 2차 출처 부족)
- 비와술잔 (jeonhyun-gwangalli-biwa-suljan): phone null 유지 (REVIEW — Kakao 단독)
- 블랑제리 라센 (saengdal-gwangalli-boulangerie-lassence): phone null 유지 (REVIEW — Kakao 단독)

## 전체 DB 검증 (반영 후 독립 SELECT)
- 전체 restaurants: 107
- 공개 restaurants: 90
- 공개 thumbnail: 90
- 공개 thumbnail 누락: 0
- 공개 kakao_map_url 누락: 1 (담미옥, 유지)
- 공개 phone 누락: 32 (35 → 32)
- placeholder 전화: 0
