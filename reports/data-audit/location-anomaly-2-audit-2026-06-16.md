# 사또분식·일광당 위치 정합성 감사 — 2026-06-16

> 사또분식 번지 37/39 충돌 + 일광당 좌표 약 1.7km 오차 위치 정합성 검증. **read-only — DB/앱 미수정**. 가격·전화·상호는 범위 밖.

## Summary

- 대상: 2
- EXACT_CURRENT: 1 (사또분식)
- ADDRESS_CORRECTION_READY: 0
- COORDINATE_CORRECTION_READY: 1 (일광당)
- LOCATION_CORRECTION_READY: 0
- REVIEW: 0
- CLOSED_OR_MOVED: 0
- BLOCKED: 0
- DB 수정: 0
- 앱 코드 변경: 0

## 사또분식

- DB 현재값: 주소 부산 영도구 절영로35번길 39 / phone 051-415-3764 / kakao_map_url place/9808354 / lat 35.0905236 lng 129.0412957
- Kakao 후보: place 9808354(단일, is_db_place) / road 절영로35번길 37 / jibun 대교동2가 178-3 / phone 051-415-3764(일치) / lat 35.0906183194013 lng 129.041186690822 / dist 14m
- **37/39 검증**: **39가 공식 도로명주소로 확정**
  - dorojuso.kr(도로명주소 DB): "부산광역시 영도구 절영로35번길 **39** (대교동2가)" 등록
  - 인스타 reel·식신·triple: 절영로35번길 39
  - Kakao place 9808354의 road 표기만 37 → **Kakao DB측 표기 오류**(우리 DB 교정 대상 아님). place 자체는 동일 업소(전화일치·14m·is_db_place)
- 좌표 거리: 14m (GPS 오차 수준)
- 최종 판정: **EXACT_CURRENT** — DB 주소 39 공식·정확, kakao_map_url·좌표 정확. 수정 불필요
- 예상 before/after: 변경 없음

## 일광당

- DB 현재값: 주소 부산 기장군 일광읍 일광로 125-1 / phone 051-724-0039 / kakao_map_url place/14723726 / lat 35.2725716 lng 129.2527211
- Kakao 후보: place 14723726(단일, is_db_place) / road 일광로 125-1(DB와 일치) / jibun 이천리 836-5 / phone 051-724-0039(일치) / lat 35.2665874736785 lng 129.235227867827 / **dist 1722m**
- 좌표 거리: **1722m** (DB 좌표가 실제 위치에서 이격)
- 오매핑 여부: 주소·place·전화 모두 정확·동일 업소이나 **DB lat/lng만 1.7km 오류**. 외부(다이닝코드·식신) 일광로 125-1=일광해수욕장 인근 = Kakao 공식 좌표와 일치. DB 좌표는 과거 지오코딩 오입력 추정
- 최종 판정: **COORDINATE_CORRECTION_READY** — 주소·kakao_map_url(place/14723726)은 정확, **lat/lng만 Kakao 공식 좌표로 교정**
- 예상 before/after:
  - lat: 35.2725716 → **35.2665874736785**
  - lng: 129.2527211 → **129.235227867827**
  - (kakao_map_url·주소·전화·상호·가격 무변경)

## 다음 반영 후보 (근거 충분)

| 식당 | slug | 변경 필드 | before | after | 근거 |
|---|---|---|---|---|---|
| 일광당 | saengdal-gijang-ilgwangdang | lat | 35.2725716 | 35.2665874736785 | Kakao 공식 place 14723726 좌표(주소·전화 일치, 1.7km 오차 해소) |
| 일광당 | saengdal-gijang-ilgwangdang | lng | 129.2527211 | 129.235227867827 | 〃 |

- 사또분식: EXACT_CURRENT — 반영 대상 없음(번지 39 공식 확정).
- 일광당 가격(찐빵/만두 5,500 vs 6,000)은 별도 REVIEW 유지(이번 범위 밖).

## 사용자 영향

- 사또분식: 상세·지도·CTA 정상. 주소 39 정확, 좌표 14m(정상). Kakao의 road 37 표기는 Kakao 쪽 이슈로 우리 화면엔 DB 주소(39) 표시.
- 일광당: **지도 마커가 실제 위치에서 1.7km 떨어진 지점을 가리킴** → 길찾기/지도 사용자 혼선. kakao_map_url(place URL)은 정확해 CTA 클릭 시 정확한 장소로 가나, 앱 내 지도 마커(lat/lng 기반)는 오위치. 좌표 교정 시 해소.
