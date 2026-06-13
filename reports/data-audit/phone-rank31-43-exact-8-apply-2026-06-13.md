# 공개 phone 우선순위 31~43위 EXACT_MATCH 8곳 반영 결과 — 2026-06-13

직전 31~43위 감사(`phone-missing-rank31-43-audit-2026-06-13`)에서 EXACT_MATCH로 확정된 8곳에
`phone` 필드만 반영했다. REVIEW 5곳·기존 누적 보류는 수정하지 않았다.

## Summary
- 대상: 8
- 성공: 8 / 실패: 0
- phone 반영: 8곳 (기존 전부 null → 검증값)
- REVIEW 미수정: 5곳
- 앱 코드 변경: 없음
- DB write 범위: `restaurants` 8행, `phone`만 (각 영향행 1)

## 식당별 변경
| 식당 | slug | phone before | phone after | 영향행 | 다른 필드 유지 |
| --- | --- | --- | --- | ---: | --- |
| 쉐라미과자점 | saengdal-saha-cheramie | null | 051-208-0033 | 1 | 유지 |
| 합천일류돼지국밥 | ddoganjip-hapcheon-ilryu-dwaeji-gukbap | null | 051-317-2478 | 1 | 유지 |
| 김유순대구뽈찜전문점 | kimyusun-daegu-bbol-jjim | null | 051-627-4319 | 1 | 유지 |
| 내호냉면 | naeho-naengmyeon | null | 051-646-6195 | 1 | address·kakao·좌표 유지(아래) |
| 삼진어묵 본점 | live-today-samjin-eomuk | null | 051-715-5865 | 1 | 유지 |
| 삼성갈미조개 | tzuyang-gangseo-samseong-galmijogae | null | 051-271-0722 | 1 | 유지 |
| 동방밀면 | tzuyang-yeongdo-dongbang-milmyeon | null | 051-416-9592 | 1 | 유지 |
| 동삼동불짬뽕 | tzuyang-yeongdo-dongsamdong-buljjampong | null | 051-403-7388 | 1 | 유지 |

- 독립 SELECT 검증: 8곳 모두 phone 외 필드(name/address/area/category/main_menu/price_text/kakao_map_url/lat/lng/thumbnail/is_published) 변경 없음.
- 확정 근거: 각 Kakao 지역번호 + 웹 2~4출처(식신·다이닝코드·비짓부산·autoreserve·공식쇼핑몰·나무위키·구석구석·polle 등) 동일.
- 안심번호 처리: 삼성갈미조개는 웹 0507-1411-0722 안심번호의 끝자리(0722)가 Kakao 지역번호와 동일 → 지역번호 051-271-0722 우선.
- 상호 표기차: 쉐라미과자점은 Kakao place명 "1974쉐라미"이나 주소·전화 동일 업소.
- 타지점 배제: 합천일류(창원직영점)·동방밀면(동방축산)·삼진어묵(삼진어묵당) 등 동명/유사 업소와 구분 확인.

## 보호 대상 (이번 작업에서 변경 없음, 미변경 확인)
- REVIEW 5곳: 연지가양곱창 / 합천국밥집 / 옛날국수집 / 사또분식 / 주례수육칼국수 2호점
- 기존 누적 REVIEW·NO_MATCH·보류: 한약방돼지국밥·비와술잔·블랑제리라센·속씨원한대구탕·금손1983·해진아나고·다리집·상국이네·동춘이만두·가마솥돼지국밥영도점·마포본가·수타혜미칼국수·원조가야밀면·남포동씨앗호떡·담미옥
- 총 20곳 phone·name·address·kakao_map_url 미변경 확인.

## 별도 교정 필요
### 내호냉면 (naeho-naengmyeon)
- phone 반영 완료: 051-646-6195
- address/Kakao/좌표는 이번 작업에서 미수정 (보호 확인: address "부산광역시 남구 장고개로 11-5", kakao_map_url 검색링크, lat 35.129244 / lng 129.068934 동일)
- DB 주소(장고개로 11-5)와 외부 주소(Kakao 우암번영로26번길 17) 정합성 별도 검증 필요 (단일 노포라 동일 업소이나 도로명 표기 차이)

## 전체 DB 검증 (반영 후 독립 SELECT)
- 전체 restaurants: 107
- 공개 restaurants: 90
- 공개 thumbnail: 90
- 공개 thumbnail 누락: 0
- 공개 kakao_map_url 누락: 1 (담미옥, 유지)
- 공개 phone 누락: 20 (28 → 20)
- placeholder 전화: 0
