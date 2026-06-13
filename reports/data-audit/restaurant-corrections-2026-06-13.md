# 식당 사실정보 교정 — 2026-06-13

- service_role로 restaurants 4행만 UPDATE(id+slug 이중조건, 각 영향 행 1 확인). 다른 테이블/행/스키마 무변경.
- 변경 전 전체 값 백업: `reports/data-audit/restaurant-corrections-before-2026-06-13.json`

## 대상

- 청사포 도희네 조개구이 (hibab-cheongsa-hoe-center) — 구 표시명 "청사포 회센터"
- 해운대암소갈비집 (hibab-haeundae-amsogalbi)
- 양가네양곱창 (baekban-haeundae-yangs-yanggopchang)
- 만우장 (sungsik-gwangalli-manujang) — 폐업 → 공개 중단

## 변경 전 값 (DB 캡처)

| slug | 표시명 | 주소 | 전화 | price_text | 공개 | thumbnail |
|---|---|---|---|---|---|---|
| hibab-cheongsa-hoe-center | 청사포 회센터 | 부산 해운대구 청사포로 55 | 051-678-9012 | 소 45,000원~ | true | 있음 |
| hibab-haeundae-amsogalbi | 해운대 암소갈비집 | 부산 해운대구 구남로 30 | 051-234-5678 | 1인분 25,000원 | true | 있음 |
| baekban-haeundae-yangs-yanggopchang | 양가네 양곱창 | 부산 해운대구 구남로8번길 7-3 | 051-714-9515 | 메뉴별 상이 (가격 확인 필요…) | true | 있음 |
| sungsik-gwangalli-manujang | 만우장 | 부산 수영구 수영로594번길 28-2 | (null) | 1만원부터 | true | null |

## 변경 결과

| 식당 | 필드 | 변경 전 | 변경 후 | 결과 |
|---|---|---|---|---|
| 청사포 도희네 조개구이 | name | 청사포 회센터 | 청사포 도희네 조개구이 | ✅ |
| 청사포 도희네 조개구이 | address | 부산 해운대구 청사포로 55 | 부산 해운대구 청사포로 157 | ✅ |
| 청사포 도희네 조개구이 | phone | 051-678-9012 | 051-704-0113 | ✅ |
| 해운대암소갈비집 | price_text | 1인분 25,000원 | 생갈비 63,000원 / 양념갈비 59,000원 / 등심불고기 55,000원 | ✅ |
| 양가네양곱창 | phone | 051-714-9515 | 051-741-1157 | ✅ |
| 양가네양곱창 | address | 부산 해운대구 구남로8번길 7-3 | (동일 — 변경 안 함) | 유지 |
| 만우장 | is_published | true | false | ✅ |

- 적용 방식: `restaurants` UPDATE, 각 건 id+slug 일치 + 영향 행 1 확인. 4/4 성공.
- 사용한 공개 여부 컬럼: **is_published** (실제 스키마, is_public 같은 임의 필드 미사용)
- 메뉴/가격 컬럼: **price_text**(단일 텍스트), main_menu(텍스트) — 메뉴 JSON/별도 테이블 없음. 대표 갈비 우선 반영.

## DB 집계 (변경 후 독립 SELECT)

- 전체 restaurants: **107** (유지)
- 공개 restaurants: **90** (91 → 90, 만우장 비공개로 -1)
- 공개 thumbnail 보유: **90**
- 공개 thumbnail 누락: **0** — 공개 90곳 전부 썸네일 보유

## 만우장 처리

- 삭제 여부: **삭제 안 함** (row 존재)
- 공개 여부: is_published true → **false** (상세 URL은 404 처리, generateStaticParams가 published만 빌드)
- thumbnail: **null 유지** (추가 안 함)
- slug/주소/가격/출처 등 나머지 데이터: 보존
- 폐업 사유: 사용자 제보(폐업) — reports/photo-audit/closed-business-candidates.md 후보를 공개 중단으로 처리

## 변경하지 않은 항목

- 앱 코드 / 스키마 / slug / thumbnail / trust source / 신규 restaurants 추가: 모두 변경 없음
- 청사포·암소갈비·양가네의 출처(source_type/source_title: 히밥/히밥/백반기행) 유지

## ⚠ 재검토 필요(이번 미수행 — 다음 감사 대상)

- **청사포 도희네 조개구이 좌표/카카오**: 주소가 청사포로 55→157로 실제 변경됐으나 lat/lng(35.1597,129.1754)·
  kakao_map_url(place 783324262, 구 "회센터" 기준)은 **변경하지 않음**(정확한 도희네 좌표/place-id 확정값 없음
  + 좌표 추정 금지 원칙). 다음 단계에서 Kakao 지오코딩으로 안전 갱신 권장.
- **청사포 price_text "소 45,000원~"**: 회센터 시절 회 가격일 수 있음(조개구이로 업종 정정됨) → 메뉴/가격 재확인 대상.
- **해운대암소갈비 phone "051-234-5678" / 주소 "구남로 30"**: placeholder 의심 → 차기 주소·전화 감사에서 확인.
  (이번 작업은 가격만 교정 지시 — 주소/전화 미변경)
