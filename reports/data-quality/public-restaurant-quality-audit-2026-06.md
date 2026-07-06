전체 판정: WARNING

# 나온집 공개 식당 품질 감사 — 2026-06 (read-only)

- 생성일: 2026-06-23 (KST)
- 공개 식당: 138곳 (Kakao place_id 대조 + trust_source 분류)
- read-only: DB SELECT + Kakao keyword GET 만. 데이터 수정 없음(수정 후보 분류만).
- CSV: reports/data-quality/public-restaurant-quality-audit-2026-06.csv

## 주소 정합성(address_status)
```text
EXACT_CURRENT: 93
SAME_PLACE_ADDRESS_VARIANT: 36
PLACE_LOOKUP_FAILED: 4
ADDRESS_MISMATCH: 3
BUSINESS_REVIEW: 2
```

## 좌표 정합성(coordinate_status)
```text
EXACT_CURRENT: 115
SAME_PLACE_ADDRESS_VARIANT: 14
COORDINATE_MISMATCH: 5
PLACE_LOOKUP_FAILED: 4
```

## 전화 보강(phone_status, 누락분만)
```text
(none): 134
PHONE_NOT_AVAILABLE: 3
PHONE_LOOKUP_FAILED: 1
```

## trust_source 0개 원인(trust_source_status)
```text
BROADCAST_SOURCE_MISSING: 78
(none): 60
```

## 우선순위(priority)
```text
P2: 73
P3: 60
P0: 5
```

## 권장 조치(recommended_action)
```text
SOURCE_BACKFILL: 73
NO_ACTION: 60
ADDRESS_FIX_REVIEW: 3
COORDINATE_FIX_REVIEW: 2
```

## P0 — 주소/좌표/업장 재검토 (5)
- baekban-haeundae-yangs-yanggopchang (양가네 양곱창) | ADDRESS_MISMATCH/COORDINATE_MISMATCH | db=부산 해운대구 구남로8번길 7-3 | kakao=부산 수영구 감포로 106 | dist=3508m
- baekban-yeongdo-jinju-sikdang (진주식당) | ADDRESS_MISMATCH/COORDINATE_MISMATCH | db=부산 영도구 대평로 16 | kakao=부산 영도구 절영로14번길 2 | dist=536m
- hibab-cheongsa-hoe-center (청사포 도희네 조개구이) | BUSINESS_REVIEW/COORDINATE_MISMATCH | db=부산 해운대구 청사포로 157 | kakao=부산 해운대구 청사포로 12 | Kakao 검색 id≠db_place_id(이름매칭) / dist=1083m
- matnyuk-sasang-doejigalbi (시골집명품석갈비) | BUSINESS_REVIEW/COORDINATE_MISMATCH | db=부산 사상구 괘법동 549 | kakao=부산 사상구 낙동대로1210번길 82 | Kakao 검색 id≠db_place_id(이름매칭) / dist=1706m
- sungsik-seomyeon-yanggopchang (문화양곱창) | ADDRESS_MISMATCH/COORDINATE_MISMATCH | db=부산 부산진구 지게골로 75 | kakao=부산 부산진구 가야대로784번길 56-8 | dist=564m

## P1 — source 보강 우선 (0)
- 없음

## phone 보강 가능(PHONE_BACKFILL_READY) (0)
- 없음

## 주소/좌표 수정 검토 (5)
- baekban-haeundae-yangs-yanggopchang (양가네 양곱창) | db=부산 해운대구 구남로8번길 7-3(35.1615796,129.1565308) | kakao=부산 수영구 감포로 106(35.167940650076716,129.1178399233333)
- baekban-yeongdo-jinju-sikdang (진주식당) | db=부산 영도구 대평로 16(35.0916371,129.0342407) | kakao=부산 영도구 절영로14번길 2(35.0932093109834,129.039948711614)
- hibab-cheongsa-hoe-center (청사포 도희네 조개구이) | db=부산 해운대구 청사포로 157(35.1624398226622,129.194225885324) | kakao=부산 해운대구 청사포로 12(35.166591678157324,129.18319017125606)
- matnyuk-sasang-doejigalbi (시골집명품석갈비) | db=부산 사상구 괘법동 549(35.1544,128.9921) | kakao=부산 사상구 낙동대로1210번길 82(35.167025345189316,128.98114676515732)
- sungsik-seomyeon-yanggopchang (문화양곱창) | db=부산 부산진구 지게골로 75(35.1601,129.0571) | kakao=부산 부산진구 가야대로784번길 56-8(35.1550308363705,129.056712633763)

## 즉시 수정 금지 REVIEW(업장/조회실패) (6)
- baekban-namgu-chossijib (궁중해물탕 조씨집 대연본점) | PLACE_LOOKUP_FAILED | Kakao 매칭 실패
- baekban-yeongdo-jungri-haenyeochon (영도 중리해녀촌) | PLACE_LOOKUP_FAILED | Kakao 매칭 실패
- hibab-cheongsa-hoe-center (청사포 도희네 조개구이) | BUSINESS_REVIEW | Kakao 검색 id≠db_place_id(이름매칭) / dist=1083m
- matnyuk-sasang-doejigalbi (시골집명품석갈비) | BUSINESS_REVIEW | Kakao 검색 id≠db_place_id(이름매칭) / dist=1706m
- sungsik-gaegeum-milmyeon (개금 밀면 본점) | PLACE_LOOKUP_FAILED | Kakao 매칭 실패
- tzuyang-nampo-ssiat-hotteok (남포동 씨앗호떡) | PLACE_LOOKUP_FAILED | Kakao 매칭 실패

## 위험 작업 미실행
DB write 0 / Storage 0 / 이미지 0 / 데이터 수정 0 (분류만). Kakao keyword GET read-only.
