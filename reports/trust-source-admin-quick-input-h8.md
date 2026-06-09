# 나온집 TRUST-H8 — Admin 신뢰 출처 입력 후보 (quick input)

- 조사일/verified_at: 2026-06-09
- 입력 위치: /admin/restaurants/[slug]/edit → "신뢰 출처" 섹션 → 새 출처 추가
- **본 Phase는 DB 입력을 하지 않았다. 아래는 운영자가 직접 입력할 후보값이다.**
- 입력 전 각 source_url을 브라우저로 클릭해 **식당 일치·현행 여부를 최종 확인**할 것.
  (특히 미쉐린은 자동 접근 403으로 본문 미확인 — 검색 색인 제목으로만 식당명 일치 확인됨)
- trust_label은 사실 관계만. 과장 신뢰어("검증 완료/최고/믿을 수 있는/보장") 사용 금지.

---

## ✅ 바로 입력 추천 (yes, 5건 / 4식당)

### 1) 백일평냉 — 미쉐린 빕구르망
```
slug: saengdal-gwangalli-baegil-pyeongnaeng
식당명: 백일평냉
source_kind: guide
source_name: 미쉐린 가이드
source_url: https://guide.michelin.com/us/en/busan-region/busan_1025838/restaurant/100-1-pyeongnaeng
source_title: 미쉐린 가이드 부산 빕 구르망
trust_label: 미쉐린 빕구르망
verified_at: 2026-06-09
source_note: TRUST-H8 후보 조사 기반. 운영자 최종 확인 필요.
is_public: true
```

### 2) 담미옥 — 미쉐린 빕구르망
```
slug: saengdal-seomyeon-dammiok
식당명: 담미옥
source_kind: guide
source_name: 미쉐린 가이드
source_url: https://guide.michelin.com/us/en/busan-region/busan_1025838/restaurant/damiok
source_title: 미쉐린 가이드 부산 빕 구르망
trust_label: 미쉐린 빕구르망
verified_at: 2026-06-09
source_note: TRUST-H8 후보 조사 기반. 운영자 최종 확인 필요. (개금→중앙동 이전 정보 있어 주소 확인)
is_public: true
```

### 3) 해운대 암소갈비집 — 미쉐린 가이드
```
slug: hibab-haeundae-amsogalbi
식당명: 해운대 암소갈비집
source_kind: guide
source_name: 미쉐린 가이드
source_url: https://guide.michelin.com/us/en/busan-region/busan_1025838/restaurant/haeundae-rib-barbecue-restaurant
source_title: 미쉐린 가이드 부산 등재
trust_label: 미쉐린 가이드 등재
verified_at: 2026-06-09
source_note: TRUST-H8 후보 조사 기반. 운영자 최종 확인 필요.
is_public: true
```

### 4) 해운대 암소갈비집 — 비짓부산(부산 공식 관광)
```
slug: hibab-haeundae-amsogalbi
식당명: 해운대 암소갈비집
source_kind: local
source_name: 비짓부산
source_url: https://visitbusan.net/index.do?menuCd=DOM_000000202017001000&uc_seq=2317&lang_cd=ko
source_title: 부산 공식 관광 소개
trust_label: 부산 공식 관광 소개
verified_at: 2026-06-09
source_note: TRUST-H8 후보 조사 기반. 운영자 최종 확인 필요.
is_public: true
```

### 5) 이재모피자 본점 — 비짓부산(부산 공식 관광)
```
slug: tzuyang-nampo-ijaemo-pizza
식당명: 이재모피자 본점
source_kind: local
source_name: 비짓부산
source_url: https://www.visitbusan.net/index.do?menuCd=DOM_000000201002001000&uc_seq=124&lang_cd=ko
source_title: 부산 공식 관광 소개 (부산에가면)
trust_label: 부산 공식 관광 소개
verified_at: 2026-06-09
source_note: TRUST-H8 후보 조사 기반. 운영자 최종 확인 필요.
is_public: true
```

---

## ⏸ 보류 후보 (hold) — 확인 후 판단

입력하려면 먼저 식당 일치/현행/공식성 확인 필요. 권장 시 is_public을 false로 먼저 넣고 확인 후 공개 전환.

| 식당(slug) | 후보 | source_kind | 확인 포인트 |
|------------|------|-------------|-------------|
| 이재모피자 본점 (tzuyang-nampo-ijaemo-pizza) | 캐치테이블 app.catchtable.co.kr/ct/shop/leejaemo | reservation | 현장접수 전용·현행 여부 |
| 해운대 암소갈비집 (hibab-haeundae-amsogalbi) | 캐치테이블 app.catchtable.co.kr/ct/shop/hgh | reservation | shop 'hgh' 식당 일치 |
| 마포본가 (ansungjae-yeonje-mapobonga) | 테이블링 tabling.co.kr/place/677cc8e0… | reservation | 연산동 지점 일치 |
| 영희할매재첩국 (2tv-sasang-yeonghui-halmae-jaecheopguk) | 비짓부산 '할매재첩국부산본점' uc_seq=1519 | local | DB명(영희)과 동일 식당 여부 |
| 해운대원조할매국밥 (samdae-haeundae-wonjo-halmae-gukbap) | 백년가게 인증 | guide | 백년가게 공식 목록 URL 확인 |
| 원조가야밀면 (wonjo-gaya-milmyeon) | 블루리본/부산 맛집 100선 | guide | 선정 여부 + 동명 지점 특정 |
| 금죽헌 금정산성점 (2tv-gumjeong-geumjukheon) | 금정구 문화관광 | local | 금죽헌 단독 등재 여부 |
| 금신전선 상유십이 (live-today-...-sangyusibi) | 다이닝코드/식신 / 식스센스 출연 | other/tv | 권위 약. 식스센스는 appearances 검토 |

## ⛔ 비추천 (no)

- 블로그(ablo.kr/brunch/네이버블로그), 집계 플랫폼(다이닝코드/식신/트립닷컴) 단독 1차 출처: 권위 약·복제 위험 → 기본 비추천(운영자 판단).
