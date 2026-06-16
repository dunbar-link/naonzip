# 일광당 좌표 교정 (1.7km 오차) — 2026-06-16

> 위치 정합성 감사(`location-anomaly-2`)의 `COORDINATE_CORRECTION_READY`(일광당)에 따라 **lat·lng 2필드만** 교정.
> id+slug+기존 lat+기존 lng 4중 조건, 영향행 1. 주소·전화·kakao_map_url·가격 등 무변경. 사또분식 등 미수정.
> 변경 전 전체 row 백업: `reports/data-audit/ilgwangdang-coordinate-before-2026-06-16.json`

## Summary

- 최종 판정: COORDINATE_CORRECTION_READY → 반영 완료
- DB 수정: 1행 (restaurants)
- 영향행: 1
- 수정 필드: lat · lng (2개)
- 앱 코드/스키마 변경: 0

## 오차 원인

- 일광당 DB 주소(일광로 125-1)·place(14723726)·전화(051-724-0039)는 모두 정확·동일 업소.
- 단 DB lat/lng가 Kakao 공식 place 좌표에서 **1,722m** 벗어남 → 과거 지오코딩 오입력 추정.
- 외부(다이닝코드·식신) 일광로 125-1 = 일광해수욕장 인근 = Kakao 공식 좌표와 일치.
- kakao_map_url은 이미 정확한 place URL이라 CTA 클릭은 정상이었으나, 앱 내 지도 마커(lat/lng 기반)가 1.7km 오위치.

## before / after

| 필드 | before | after |
|---|---|---|
| lat | 35.2725716 | 35.2665874736785 |
| lng | 129.2527211 | 129.235227867827 |

- 근거: Kakao 공식 place 14723726 좌표(상호·주소·전화 일치, 단일 동일 업소). 부산 범위 내(lat 34.8~35.5 / lng 128.7~129.5).

## 유지 필드 (독립 SELECT 재검증 — before와 동일)

- address: 부산 기장군 일광읍 일광로 125-1
- phone: 051-724-0039
- kakao_map_url: https://place.map.kakao.com/14723726
- name·area·category·main_menu·slug·thumbnail·is_published 유지
- price_text: 찐빵 5개 6,000원 / 만두 6개 6,000원 (REVIEW 유지 — 가격 충돌 별도)

## 사또분식 보호 확인 (미수정)

- 주소 부산 영도구 절영로35번길 39 / kakao_map_url place/9808354 / 좌표 35.0905236, 129.0412957 — 전부 미변경 (EXACT_CURRENT)

## DB 전체 집계 (반영 후 독립 SELECT)

- 전체 restaurants: 107 / 공개 restaurants: 90 (불변)
- 공개 thumbnail: 90 / 공개 kakao_map_url 누락: 0
- 공개 검색링크 잔여: 1 (금죽헌, REVIEW)
- 공개 phone 누락: 12 / placeholder 전화: 0

## 데이터 정합성 감사 1차 종료 판단

### 해결 완료
- 공개 썸네일 누락 0 / Kakao URL 누락 0 / area 비공식 값 0 / placeholder 전화 0
- 주소·가격 교정(가격 7곳, 내호냉면 주소, 담미옥 이전, 슌사이쿠보 분류)
- Kakao 검색링크 정비(12→1)
- **일광당 1.7km 좌표 오류 해결**
- 사또분식 번지 37/39 = 39 공식 확정(EXACT_CURRENT)

### 의도적 REVIEW 유지 (무리한 해결 안 함)
- 금죽헌 검색링크 1건 — 실 지역번호 확인 전까지 미수정
- 스시바시쿠 가격(오마카세) — 공식 메뉴 확인 전까지
- 일광당 가격(찐빵/만두 5,500 vs 6,000) — 공식 메뉴 확인 전까지
- 공개 phone 누락 12 — 수동 확인 없이 무리하게 채우지 않음

### 종료 결론
- BLOCKED·명백한 오류 없음 → **데이터 정합성 감사 1차 종료**
- REVIEW를 0으로 만들기 위한 추가 전수조사·자동수정은 하지 않음
- 이후 오류는 `/naonzip-ops-check`와 실제 사용 제보로 운영 루프 처리
