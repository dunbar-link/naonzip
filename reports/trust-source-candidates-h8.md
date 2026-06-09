# 나온집 TRUST-H8 — 신뢰 출처 후보 조사 리포트

- 조사일: 2026-06-09
- 방식: 기존 DB read-only 조사 + 공개 웹 검색(제목/URL/공식명 수준만 기록). **DB 입력 없음.**
- 목적: `restaurant_trust_sources` 에 운영자가 입력할 수 있는 **후보**만 정리. 최종 입력/판단은 운영자.
- 원칙: 외부 본문/평점/리뷰/이미지 복제 없음. 로그인/차단 페이지 우회 없음. 과장 신뢰어 미생성.

> ⚠ 본 리포트의 URL은 **공개 검색 결과 기준**이며, 일부(미쉐린 등)는 자동 접근이 403으로 차단되어
> 페이지 본문은 확인하지 못했다(검색 색인 제목으로만 식당명 일치 확인). **운영자가 브라우저로
> 클릭해 식당 일치/현행 여부를 최종 확인한 뒤 입력**해야 한다.

---

## 1. 조사 대상 10곳 (DB 확인 완료)

| # | slug | 식당명 | 지역 | 카테고리 | 썸네일 | 기존 trust행 | 선정 이유 |
|---|------|--------|------|----------|--------|--------------|-----------|
| 1 | 2tv-sasang-yeonghui-halmae-jaecheopguk | 영희할매재첩국 | 사상 | 한식 | ○ | 1(operator) | 상단/샘플 보유 |
| 2 | ansungjae-yeonje-mapobonga | 마포본가 | 연제 | 고기 | ○ | 0 | 인기 갈비, 출처 보강 효과 |
| 3 | saengdal-gwangalli-baegil-pyeongnaeng | 백일평냉 | 광안리 | 한식 | ○ | 0 | 미쉐린 가능성 높음 |
| 4 | saengdal-seomyeon-dammiok | 담미옥 | 서면 | 한식 | ○ | 0 | 미쉐린 가능성 높음 |
| 5 | tzuyang-nampo-ijaemo-pizza | 이재모피자 본점 | 남포동 | 양식 | ✕ | 0 | 인기 노포, 공식관광 등재 |
| 6 | wonjo-gaya-milmyeon | 원조가야밀면 | 기타 | 밀면 | ○ | 0 | 밀면 노포 |
| 7 | hibab-haeundae-amsogalbi | 해운대 암소갈비집 | 해운대 | 고기 | ○ | 0 | 미쉐린·공식관광 등재 |
| 8 | samdae-haeundae-wonjo-halmae-gukbap | 해운대원조할매국밥 | 해운대 | 한식 | ○ | 0 | 백년가게 가능성 |
| 9 | 2tv-gumjeong-geumjukheon | 금죽헌 금정산성점 | 기타 | 한식 | ○ | 0 | 신규 공개, 보강 효과 |
| 10 | live-today-suyeong-geumsin-jeonseon-sangyusibi | 금신전선 상유십이 | 기타 | 한식 | ○ | 0 | 신규 공개, 콘셉트 화제 |

> 참고: 일부 식당의 기존 `video_url`은 유튜브가 아니라 **매체 기사**(부산일보 busan.com, 이투데이
> etoday, 탑스타뉴스)거나 블로그(ablo.kr)다. 이미 appearances 출처로 쓰이고 있어 trust 재입력 가치는 낮다.

## 2. 후보 결과 요약

### ✅ 입력 추천(yes) — 공식 도메인 + 식당명 일치, 법적 위험 낮음 (5건 / 4식당)

| 식당 | source_kind | source_name | trust_label | 확인 | URL |
|------|-------------|-------------|-------------|------|-----|
| 백일평냉 | guide | 미쉐린 가이드 | 미쉐린 빕구르망 | 검색명 일치(자동fetch 403) | guide.michelin.com/.../100-1-pyeongnaeng |
| 담미옥 | guide | 미쉐린 가이드 | 미쉐린 빕구르망 | 검색명 일치(자동fetch 403) | guide.michelin.com/.../damiok |
| 해운대 암소갈비집 | guide | 미쉐린 가이드 | 미쉐린 가이드 등재 | 검색명 일치(자동fetch 403) | guide.michelin.com/.../haeundae-rib-barbecue-restaurant |
| 이재모피자 본점 | local | 비짓부산(부산 공식 관광) | 부산 공식 관광 소개 | **fetch 확인됨** | www.visitbusan.net/...uc_seq=124 |
| 해운대 암소갈비집 | local | 비짓부산(부산 공식 관광) | 부산 공식 관광 소개 | 검색명 일치 | visitbusan.net/...uc_seq=2317 |

→ 구체 필드값은 `reports/trust-source-admin-quick-input-h8.md` 참고.

### ⏸ 보류(hold) — 식당 동일성/현행/공식 URL 미확정 (8건)

| 식당 | 후보 | source_kind | 보류 이유 |
|------|------|-------------|-----------|
| 이재모피자 본점 | 캐치테이블(leejaemo) | reservation | 웨이팅 페이지 존재하나 현행/현장전용 — 운영자 확인 |
| 해운대 암소갈비집 | 캐치테이블(hgh) | reservation | shop slug 'hgh' 식당 일치 불확실 — 확인 필요 |
| 마포본가 | 테이블링 | reservation | 연산동 지점 일치/현행 확인 필요 |
| 영희할매재첩국 | 비짓부산 '할매재첩국부산본점' | local | **식당명 불일치(영희 vs 할매)** — 동일 식당 여부 확인 필요 |
| 해운대원조할매국밥 | 백년가게 인증 | guide/local | 인증 가능성 높으나 공식 백년가게 목록 URL 미확보 |
| 원조가야밀면 | 블루리본/부산 맛집 100선 | guide | 선정 미확인 + 동명 지점 다수(거제동/부산진/온천장) — 지점 특정 필요 |
| 금죽헌 금정산성점 | 금정구 공식관광(금정맛집) | local | 금죽헌 단독 등재 미확인(목록 페이지 수준) |
| 금신전선 상유십이 | 다이닝코드/식신 + 식스센스 출연 | tv/other | 권위 출처 아님. '식스센스' 출연은 appearances로 별도 검토 |

### ⛔ 비추천(no / 저우선) — 무단복제 위험·권위 부족

- 블로그 후보 전체: ablo.kr(상유십이), brunch(이재모), 네이버 블로그(마포본가) 등 → **blog는 §4 저우선·신중**, 본문/리뷰 복제 위험. 입력 비추천.
- 집계/리뷰 플랫폼을 1차 출처로: 다이닝코드·식신·트립닷컴·도도도맵 → 공식 가이드 아님(빅데이터/리뷰 집계). 신뢰 출처로 쓰려면 운영자 판단 필요. 기본 비추천.
- 인스타그램 공식 계정(@100.1.pyeongnaeng 등): SNS, 본 Phase 범위 밖. 필요 시 sns/other로 운영자 판단.

## 3. 식당별 상세

### 3-1. 백일평냉 (saengdal-gwangalli-baegil-pyeongnaeng) — ✅ yes
- 미쉐린 가이드 부산 **빕 구르망**(2025·2026 검색상 확인). guide.michelin.com/.../100-1-pyeongnaeng
- legal_risk: low (가이드 등재 사실 + URL 기록). confidence: high(검색 색인 제목 일치). 자동 fetch 403.

### 3-2. 담미옥 (saengdal-seomyeon-dammiok) — ✅ yes
- 미쉐린 가이드 부산 **빕 구르망**. guide.michelin.com/.../damiok. (개금→중앙동 이전 정보 있음 — 주소/현행은 운영자 확인)
- legal_risk: low. confidence: high. 자동 fetch 403.

### 3-3. 해운대 암소갈비집 (hibab-haeundae-amsogalbi) — ✅ yes ×2
- 미쉐린 가이드 등재(guide) + 비짓부산 공식 관광 소개(local). 1964년·3대·백년가게 노포.
- 캐치테이블(hgh) reservation은 보류(식당 일치 확인). legal_risk: low.

### 3-4. 이재모피자 본점 (tzuyang-nampo-ijaemo-pizza) — ✅ yes(local) / ⏸ hold(reservation)
- 비짓부산 '부산에가면' **이재모피자 본점** 페이지 fetch 확인됨(local, high).
- 캐치테이블(leejaemo) 웨이팅 존재하나 "현장 접수" — reservation 보류(운영자 확인). 썸네일 없음(IMG backlog).

### 3-5. 마포본가 (ansungjae-yeonje-mapobonga) — ⏸ hold
- 테이블링 페이지 존재(reservation, 연산동 지점 확인 필요). 기존 video_url은 부산일보(busan.com) 기사.

### 3-6. 영희할매재첩국 (2tv-sasang-...) — ⏸ hold
- 비짓부산에 '할매재첩국부산본점' 존재하나 우리 DB명 '영희할매재첩국'과 **명칭 불일치** → 동일 식당 여부 확인 필요. 이미 operator 샘플 1건 보유.

### 3-7. 원조가야밀면 / 3-8. 해운대원조할매국밥 / 3-9. 금죽헌 / 3-10. 상유십이 — ⏸ hold
- 위 2.보류 표 사유 참조. 공식 단독 출처 URL 미확정 또는 지점/동일성 미확정.

## 4. 정책/한계

- 본 리포트는 **후보**다. 실제 입력 전 운영자가 각 URL을 클릭해 식당 일치·현행 여부를 확인하고,
  `trust_label`은 사실 관계(미쉐린 빕구르망/부산 공식 관광 소개 등)만 유지한다.
- 과장 신뢰어("검증 완료/최고/믿을 수 있는/보장") 금지. 외부 본문/이미지 복제·재호스팅 금지.
- 자동 검증 한계: 미쉐린 등 일부 도메인은 봇 접근 403 → 본문 미확인(검색 제목 일치로만 후보화).
- blog/집계 플랫폼은 신뢰 출처로서 권위가 약하므로 기본 비추천(운영자 판단).
