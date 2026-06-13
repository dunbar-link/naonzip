# 물꽁식당 주소·Kakao 지도 교정 결과 — 2026-06-13

직전 phone 감사에서 phone(051-257-3230)은 반영 완료됐고, 별도 교정 대상으로 남겨둔
주소·Kakao 지도·좌표 오류를 Kakao Local API 재검증 후 교정했다. 물꽁식당 1건만 수정.

## Summary
- 대상: 1 (slug mulkkong-sikdang)
- 영향행: 1 (id+slug 이중조건)
- 주소 변경: 부산광역시 중구 흥교로 55 → 부산 중구 흑교로59번길 3
- Kakao URL 변경: 검색링크 → https://place.map.kakao.com/11891969
- 좌표 변경: (흥교로 55 기준) → (흑교로59번길 3 정확 좌표, 약 300m 보정)
- phone 유지: 051-257-3230 (이번 미변경)
- 앱 코드 변경: 없음

## Kakao 검증 (Kakao Local API, 작업 시점 재조회)
- 검색어: "물꽁식당"(10건)·"물꽁식당 부산"(8건)·"물꽁식당 중구"(5건) 모두 place 11891969 발견
- place ID: 11891969
- place name: 물꽁식당
- road address: 부산 중구 흑교로59번길 3 (지번: 보수동2가 89-6)
- phone: 051-257-3230 (DB phone과 일치)
- latitude: 35.10450350366911 (y)
- longitude: 129.02437673744967 (x)
- 일치 판정: 이름 EXACT · 도로명주소 EXACT · 전화 EXACT · 중구 · 부산범위 → 단일 동일 업소 확정

## 변경 결과
| 필드 | before | after |
| --- | --- | --- |
| address | 부산광역시 중구 흥교로 55 | 부산 중구 흑교로59번길 3 |
| phone | 051-257-3230 | (유지) |
| kakao_map_url | map.kakao.com 검색링크(place 미연결) | https://place.map.kakao.com/11891969 |
| lat | 35.107223 | 35.1045035036691 |
| lng | 129.022428 | 129.02437673745 |

- 유지 필드: name(물꽁식당) / phone / area(남포동) / category(해산물) / main_menu(아구찜) / price_text(아구찜 중 30,000원) / slug / thumbnail / is_published

## 전체 DB 검증 (반영 후 독립 SELECT)
- 전체 restaurants: 107
- 공개 restaurants: 90
- 공개 thumbnail: 90
- 공개 kakao_map_url 누락: 1 (담미옥만, 유지)
- 공개 phone 누락: 35 (유지)
- placeholder 전화: 0

## 참고
- 기존 주소 "흥교로 55"는 오기(실제 도로명은 "흑교로59번길 3", 지번 보수동2가 89-6). 기존 좌표도 흥교로 55 기준이라 실제 위치와 약 300m 어긋나 있었음 → Kakao 공식 좌표로 보정.
- 이로써 공개 kakao_map_url 누락은 담미옥 1곳(Kakao place 미특정, 영업중)만 남음.
