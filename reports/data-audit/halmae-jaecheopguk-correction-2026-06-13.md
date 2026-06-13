# 할매재첩국 사실정보 및 Kakao 지도 교정 결과 — 2026-06-13

직전 감사(`kakao-remaining-5-audit-2026-06-13`)에서 REVIEW였던 "영희할매재첩국"을 실제 상호
"할매재첩국"으로 교정하고 Kakao 장소·전화·좌표를 정합화했다. 담미옥은 수정하지 않았다.

## Summary
- 대상 row: 1 (slug 2tv-sasang-yeonghui-halmae-jaecheopguk)
- 영향행: 1
- name 변경: 영희할매재첩국 → 할매재첩국
- phone 반영: 051-301-5321
- Kakao 반영: place 1531629877
- 담미옥 미수정: 확인 (name·kakao·phone·좌표·is_published 동일)
- 앱 코드 변경: 없음

## 실제 상호 판단 근거
- 외부 출처(부산역사문화대전·비짓부산·다이닝코드·Kakao Local API)에서 공식 상호는 "할매재첩국"(1972년 개업, 삼락재첩거리). DB의 "영희"는 어느 출처에도 없음(방송 표기/입력 와전 추정).
- 주소(낙동대로1530번길 20-15)·전화(051-301-5321)·Kakao place(1531629877)가 모두 동일 업소를 가리킴.
- name 교정과 지도 반영을 함께 진행하는 것이 정합성에 맞음.

## Kakao 장소 재검증 (Kakao Local API, 작업 시점 재조회)
- 검색어 "할매재첩국"(9건), "할매재첩국 사상"(1건)에서 place 1531629877 발견
- place_name: 할매재첩국 (일치)
- road_address_name: 부산 사상구 낙동대로1530번길 20-15 (DB address와 일치)
- phone: 051-301-5321 (일치)
- 좌표: y(lat) 35.19325383111974 / x(lng) 128.98621754964088 — **감사 기록 좌표와 1m 이내 일치**(coordMatchAudit 통과)
- 부산 사상구 범위 확인

## 변경 결과
| 필드 | before | after |
| --- | --- | --- |
| name | 영희할매재첩국 | 할매재첩국 |
| address | 부산 사상구 낙동대로1530번길 20-15 | (유지) |
| phone | null | 051-301-5321 |
| kakao_map_url | null | https://place.map.kakao.com/1531629877 |
| lat | 35.1943840522469 | 35.1932538311197 |
| lng | 128.985120470772 | 128.986217549641 |

- 유지 필드: address / area(사상) / category(한식) / main_menu(재첩국·재첩회·재첩비빔밥) / price_text(재첩국 약 7,000원) / slug / thumbnail / is_published

## 전체 DB 검증 (반영 후 독립 SELECT)
- 전체 restaurants: 107
- 공개 restaurants: 90
- 공개 thumbnail: 90
- 공개 thumbnail 누락: 0
- 공개 kakao_map_url 누락: 1 (2 → 1)
- 공개 phone 누락: 43 (44 → 43)
- placeholder 전화: 0

## 보호 대상
- 담미옥 (saengdal-seomyeon-dammiok): 변경 없음. name "담미옥" 유지, kakao_map_url null 유지, phone null 유지, 좌표·is_published 동일.
  - 사유: 개금 영업 확인되나 Kakao Local API로 정확 place 미특정. 중구 해관로 담미옥은 별개. place 확정 전 수정 보류.
