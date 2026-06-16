# 나온집 공식 가이드 출처 부분 확보 1차 감사 — 미쉐린·부산공식

> ⚠ 이 문서는 **부분 확보 1차 감사**다. 공식 전수 완성본이 아니다.
>   - 미쉐린 공식 **전수 미완료**(빕구르망 기존 17·셀렉티드 미확보, guide.michelin.com 403).
>   - 부산의 맛 **상호 전체 추출 미완료**(PDF 한글 CID폰트). 전화번호 기반 교집합만 확정.
> 생성일: 2026-06-16 · read-only(DB·Storage·앱·검색 UI 무변경) · 전체 OCR 미수행
> 대조 기준: 운영 DB restaurants 109곳(공개 92), 이름·주소·전화·Kakao place 기준

## 핵심 결론

- **미쉐린 공식 = 봇 차단(HTTP 403)**: 빕구르망 20곳 전체·셀렉티드 명단을 공식에서 추출 불가.
  공식 발표문에서 확보된 건 **신규 빕구르망 3 + 스타 4 = 7곳**. 나머지 48곳 미확보.
- **부산의맛 2026 PDF = 한글 상호 CID폰트(Adobe-Korea1)로 텍스트 추출 불가**.
  단 **전화번호는 정상 추출(142개)** → 전화 기준 DB 대조로 **부산공식 ∩ DB 확정 10곳** 확보.
- 전체 OCR 없이 "전화 대조"로 목적의 핵심(교집합 확정)은 부분 달성. 단 **상호 미확보로
  '전수 대조'는 미달**(부산공식 미등록 후보의 상호·미쉐린 빕구르망 전체 미상).

---

## 수량 요약

| 항목 | 수 | 비고 |
|---|---:|---|
| 미쉐린 부산 2026 전체(공식) | 55 | 스타 4 + 빕구르망 20 + 셀렉티드 ~31 |
| 미쉐린 확보(추출) | 7 | 스타 4 + 빕구르망 신규 3 |
| 미쉐린 미확보 | 48 | 공식 403(빕구르망 기존 17 + 셀렉티드 ~31) |
| 부산의맛 2026 전체(공식) | 146 | 부산시 발행, 2025-12 기준 |
| 부산의맛 전화 추출 | 142 | unique(051:93 / 0507:39 / 010:10). 한글 상호 미추출 |
| 부산의맛 ∩ DB 확정(전화 일치) | 10 | EXISTING_LINKABLE |
| 부산의맛 전화 미매칭 | 132 | DB 미등록 또는 0507/전화차이 미포착(상호 미상) |
| 분류: EXISTING_LINKABLE | 10 | 부산공식 ∩ DB |
| 분류: READY_FOR_IMAGE | 2 | 미쉐린 빕구르망 송헌집·평양집 |
| 분류: EXISTING(이미 등록) | 1 | 뫼밀집(미쉐린 빕구르망, guide 등록 완료) |
| 분류: NOT_RECOMMENDED | 4 | 미쉐린 1스타 4곳(파인다이닝) |
| 분류: REVIEW | 132 | 부산의맛 미매칭(상호 미상) |

---

## 미쉐린 부산 2026 결과 (확보 7곳)

### 기존 DB 연결/등록 완료 (1)
- **뫼밀집** (michelin-haeundae-moemiljip) — 빕구르망 신규 · 이미 source_type=guide 로 등록 완료(직전 회차)

### 신규 READY_FOR_IMAGE (2) — 빕구르망 신규
- **송헌집** — 수영 민락(광안리 매핑) · 숯불 떡갈비 · Kakao place 1559134124 · 미등록
  - proposed slug: `michelin-gwangalli-songheonjip` · 이미지 `michelin-gwangalli-songheonjip.jpg`
  - ※ 전화 Kakao 미등록(등록 전 확인), 분점(사직구장점) 존재 — 본점은 민락
- **평양집** — 북구 덕천(기타) · 이북식 만둣국·녹두전 · Kakao place 12293207 · 미등록
  - proposed slug: `michelin-bukgu-pyeongyangjip` · 이미지 `michelin-bukgu-pyeongyangjip.jpg`

### NOT_RECOMMENDED (4) — 미쉐린 1스타(파인다이닝)
- **모리(Mori)** / **팔레트(Palette)** / **피오또(Fiotto)** / **르도헤(Le DORER, 신규 승급)**
  - 이유: 파인다이닝 코스 중심 → 나온집(방송 노포·로컬 가성비 맛집) 포지셔닝과 부적합.
    DB 미등록(이름 대조). 등록 실익 낮아 신규 후보에서 제외.

### 미확보 (48) — 공식 봇차단
- 빕구르망 기존 17곳 + 셀렉티드 ~31곳: 미쉐린 공식(guide.michelin.com) 403으로 명단 추출 불가.
- 보도자료(호텔앤레스토랑·뉴스와이어)는 **신규 3곳만 공개**, 전체 명단 미게재.
- ⚠ DB 109곳 중 미쉐린 빕구르망/셀렉티드에 포함된 식당이 더 있을 수 있으나, 공식 명단 부재로 확인 불가.

---

## 부산공식(2026 부산의 맛) 결과

- **자료**: 「2026 부산의 맛 (Taste of Busan)」 · 발행 부산광역시(부산관광공사 운영) · 2025-12 기준 · 146곳 · 4개국어
- **성격**: "자체 기준·엄격 심사로 엄선" 공식 미식 가이드. 노포 분야 별도 구성. 블루리본 서베이 협업.
- **추출 한계**: 본문 한글이 Adobe-Korea1 CID폰트라 pdftotext 로 상호·주소(한글) 미추출. 전화번호만 추출.

### 기존 DB 연결 가능 (EXISTING_LINKABLE, 10곳 — 전화 일치 확정)

| 식당명 | slug | 현재 source_type | 지역 | 전화 |
|---|---|---|---|---|
| 고등어다찌 연산본점 | baekban-yeonje-godeungeo-datchi | tv | 연제 | 051-853-9374 |
| 국제밀면 본점 | saengdal-yeonje-gukje-milmyeon | tv | 연제 | 051-501-5507 |
| 물꽁식당 | mulkkong-sikdang | tv | 남포동 | 051-257-3230 |
| 백일평냉 | saengdal-gwangalli-baegil-pyeongnaeng | tv | 광안리 | 051-625-5515 |
| 신발원 | samdaecheonwang-shinbalwon | tv | 기타(동구) | 051-467-0177 |
| 쌍둥이돼지국밥 본점 | saengdal-ssangdungyi-doejigukbap | tv | 남구 | 051-628-7021 |
| 원조할매낙지 | samdae-seomyeon-wonjo-halmae-nakji | tv | 서면 | 051-643-5037 |
| 해변짚불곰장어 | bapsang-gijang-haebyeon-jipbul-gomjangeo | tv | 기장 | 051-721-4539 |
| 김유순대구뽈찜전문점 | kimyusun-daegu-bbol-jjim | youtube | 남구 | 051-627-4319 |
| 이재모피자 본점 | tzuyang-nampo-ijaemo-pizza | youtube | 남포동 | 051-255-9494 |

- 이 10곳은 **방송/유튜브로 이미 등록 + 부산공식에도 수록** → 대표 source_type 유지, 부산공식 출처는 trust_sources 로 **추가 연결**(덮어쓰지 않음).

### REVIEW (132) — 부산공식 미매칭
- 부산의맛 전화 142개 중 132개가 DB 전화와 불일치.
- 이 중 **실제 DB 미등록 신규**와 **0507 안심번호/전화누락으로 미포착된 기존 등록**이 섞여 있음.
- **한글 상호 미추출**로 개별 식별 불가 → 신규 후보화하려면 상호 확보(부산의맛 한글 OCR 또는 수기) 선행 필요.

---

## 출처 교집합

| 교집합 | 수 | 근거 |
|---|---:|---|
| 부산공식 + 방송(tv) | 8 | 고등어다찌·국제밀면·물꽁·백일평냉·신발원·쌍둥이·원조할매낙지·해변짚불 |
| 부산공식 + 유튜브 | 2 | 김유순대구뽈찜·이재모피자 |
| 미쉐린 + 방송 | 0(확보분) | 미쉐린 빕구르망 기존 17 미확보로 실제값 불명 |
| 미쉐린 + 유튜브 | 0(확보분) | 동일 |
| 미쉐린 + 부산공식 | 미상 | 양쪽 전체 명단 부재로 계산 불가 |

- ⚠ 교집합 수치는 **확보된 범위의 하한**. 미쉐린 빕구르망 전체·부산공식 상호 부재로 실제값은 더 클 수 있음.

---

## 데이터 모델 판정

- **restaurants.source_type**: 대표 출처 1개(tv/youtube/sns/guide). 다중 출처를 담지 못함.
  → 방송으로 등록된 식당의 미쉐린/부산공식 선정을 source_type 으로 표현하면 기존 방송 출처를 덮어써야 하므로 **부적합**.
- **restaurant_trust_sources**: 운영 DB에 **테이블 존재(조회 성공, 현재 0행)**. source_kind 화이트리스트에
  `tv/youtube/guide/local/reservation/blog/operator/other` 보유. 1식당 N출처(1:N) 구조 → **다중 공식 출처에 적합**.
- **다중 출처 가능 여부**: ✅ trust_sources 로 가능(한 식당에 방송+미쉐린+부산공식 동시 보존).
- **필요한 DB 변경**: 신규 테이블 불필요. trust_sources 그대로 사용.
  단 (a) 검색/목록에서 쓰려면 source_kind 에 `michelin`·`visitbusan`(또는 busan_taste) 추가가 필요할 수 있음
  (현재 화이트리스트는 'guide' 만 있음 → '미쉐린'과 '부산공식'을 구분하려면 값 추가 CHECK ALTER).
  (b) getRestaurants(목록/검색용)가 현재 trust_sources 를 조회하지 않음 → 필터에 쓰려면 조회 확장.
- **권장 구조**:
  - 대표: source_type 유지(방송 tv / 유튜브 youtube / 미쉐린단독 guide).
  - 다중 공식: trust_sources 에 `source_kind='guide'`(또는 michelin/visitbusan 세분) + source_name·source_url·
    verified_at(확인일)·trust_label(등급) 보존.

---

## 검색 탭 데이터 충분성 판정

- **불충분**. 사유:
  - 미쉐린 탭: 확보 7곳(+DB 내 미쉐린 빕구르망 미상). guide 식당 현재 1곳(뫼밀집)뿐.
  - 부산공식 탭: 확정 10곳뿐. trust_sources 0행이라 필터할 데이터 없음.
- 검색 탭(미쉐린/부산공식)을 의미있게 채우려면 **trust_sources 데이터 입력이 선행**돼야 함.
- 방송/유튜브 탭은 source_type 으로 즉시 가능(데이터 충분).

---

## 생성 리포트
- reports/official-guide-audit/official-sources-2026-06-16.md (본 파일)
- michelin-busan-2026.csv / busan-official-guides-2026.csv
- restaurant-source-matches-2026-06-16.csv / source-overlap-2026-06-16.json
- search-filter-feasibility-2026-06-16.md / source-urls-2026-06-16.json

## 검증
- DB write 0 / Storage write 0 / 앱·검색UI·스키마 변경 0
- 임시 스크립트·PDF·txt(repo 밖) 사용 후 삭제 / 좌표·주소 추정 0 / 폐업 추정 0 / 민감정보 출력 0
- Kakao place 추정 0 (송헌집·평양집은 직전 회차 Kakao 검증값 재사용)
