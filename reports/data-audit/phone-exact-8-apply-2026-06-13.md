# 공개 phone EXACT_MATCH 8곳 반영 결과 — 2026-06-13

직전 전화 감사(`phone-missing-public-top15-audit-2026-06-13`)에서 EXACT_MATCH로 확정된 8곳에
`phone` 필드만 반영했다. REVIEW 6곳·NO_MATCH(씨앗호떡)·담미옥은 수정하지 않았다.

## Summary
- 대상: 8
- 성공: 8 / 실패: 0
- phone 반영: 8곳 (기존 전부 null → 외부 2출처 확인값)
- REVIEW 미수정: 6곳
- NO_MATCH 미수정: 1곳 (남포동 씨앗호떡)
- 앱 코드 변경: 없음
- DB write 범위: `restaurants` 8행, `phone`만 (각 영향행 1)

## 식당별 변경
| 식당 | slug | phone before | phone after | 영향행 | 다른 필드 유지 |
| --- | --- | --- | --- | ---: | --- |
| 물꽁식당 | mulkkong-sikdang | null | 051-257-3230 | 1 | name·address·kakao·좌표 유지 |
| 빨간떡볶이 | tzuyang-haeundae-ppalgan-tteokbokki | null | 051-743-2814 | 1 | 유지 |
| 여송제 | jeonhyun-nampo-yeosongje | null | 051-246-2111 | 1 | 유지 |
| 미쌤쌀빵 | saengdal-haeundae-missaem-ssalbbang | null | 051-743-6778 | 1 | 유지 |
| 물레방아 즉석구이 | jeonhyun-nampo-mullebanga-jeukseokgui | null | 051-245-1195 | 1 | 유지 |
| 진미언양불고기 | sungsik-gwangalli-jinmi-eonyang-bulgogi | null | 051-753-1632 | 1 | 유지 |
| 수복센타 | baekban-nampo-subok-centa | null | 051-245-9986 | 1 | 유지 |
| 수변최고돼지국밥 민락본점 | subyeon-choego-doejigukbap-minrak | null | 051-754-9222 | 1 | 유지 |

- 독립 SELECT 검증: 8곳 모두 phone 외 필드(name/address/area/category/main_menu/price_text/kakao_map_url/lat/lng/thumbnail/is_published) 변경 없음.
- 전화 확인 출처: 각 식당 Kakao 사업자정보 지역번호 + 웹 2차(다이닝코드·식신·비짓부산·트립닷컴·대한민국구석구석 등)가 동일.

## 보호 대상 (이번 작업에서 변경 없음, phone null 유지 확인)
- REVIEW 6곳: 백일평냉 / 이재모피자 본점 / 한약방돼지국밥 형제식품 / 백화양곱창 1호 / 비와술잔 / 블랑제리 라센
- NO_MATCH: 남포동 씨앗호떡 (거리 노점 통칭, 전화 특정 불가)
- 담미옥: phone·kakao 미변경

## 별도 교정 필요
### 물꽁식당 (mulkkong-sikdang)
- phone 반영 완료: 051-257-3230
- 주소·Kakao 지도는 이번 작업에서 미수정 (phone만 반영)
- 후속 사실정보 교정 필요:
  - 현재 DB 주소: 부산광역시 중구 흥교로 55
  - 감사 확인 주소: 부산 중구 흑교로59번길 3
  - 유력 Kakao place: 11891969 (현재 kakao_map_url은 place 미연결 검색링크)

## 전체 DB 검증 (반영 후 독립 SELECT)
- 전체 restaurants: 107
- 공개 restaurants: 90
- 공개 thumbnail: 90
- 공개 thumbnail 누락: 0
- 공개 kakao_map_url 누락: 1 (담미옥, 유지)
- 공개 phone 누락: 35 (43 → 35)
- placeholder 전화: 0
