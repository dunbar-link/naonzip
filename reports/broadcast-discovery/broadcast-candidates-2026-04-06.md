# 나온집 최근 방송맛집 후보 — 2026-04~06 (v2 재조사)

- 생성일: 2026-06-23 (KST) / v2 갱신
- 기준 HEAD: 2dc4701 / branch master
- 조사 범위: 2026-04-01 ~ 현재(2026-06-23) 부산 방송/유튜브/가이드 맛집
- 목적: (1) v1 READY 3곳 등록 여부 확정 + 정정, (2) 더 최신 후보 수집
- 후보 CSV: `reports/broadcast-discovery/broadcast-candidates-2026-04-06.csv`

---

## 0. v2 핵심 결론

- **v1 READY 3곳(제일분식·스시바시쿠·슌사이쿠보)은 전부 이미 등록·공개됨 → ALREADY로 정정.**
  - 운영 sitemap에서 실제 slug 확인. v1 제안 slug와 일부 다름(아래 표).
- **보너스 발견: 일광당(기장 만두 양대산맥 다른 한 곳)도 이미 등록됨.**
- **2026-06-16 이후 "신규" 방송 부산 맛집은 사실상 없음.** (조사했으나 미발견 — §3)
- 새로 건진 미등록 후보는 **원조가야밀면**(하단동밀면의 실제 상호 후보) 1건.
- 결과적으로 **새 READY 0건**, 등록 가능한 실질 후보는 **미친맛집 시즌3·4 3곳(좌표 완비, REVIEW)**.

---

## 1. v1 READY 3곳 등록 검증 (ALREADY 확정)

| 식당 | v1 제안 slug | **실제 등록 slug(sitemap)** | 운영 | 판정 |
|---|---|---|---|---|
| 제일분식 | saengdal-gijang-jeilbunsik | **saengdal-gijang-jeil-bunsik** | 200 | ALREADY |
| 스시바시쿠 | saengdal-gwangalli-sushibashiku | **saengdal-suyeong-sushibashiku** | 200 | ALREADY |
| 슌사이쿠보 | saengdal-bukgu-shunsaikubo | saengdal-bukgu-shunsaikubo | 200 | ALREADY |
| 일광당(신규) | — | **saengdal-gijang-ilgwangdang** | (sitemap 존재) | ALREADY |

- 검증법: `restaurants:check`(slug 200/404) + 운영 sitemap slug 키워드 매칭(jeil/sushi/bashiku/shunsai/gijang).
- v1에서 `search:check` filter✓였던 게 실제 등록 신호였음(검색어 echo 아님). v1 보고의 "신규" 판단을 정정.

---

## 2. 정정 내용 (CSV)

- 제일분식 / 스시바시쿠 / 슌사이쿠보: **status READY → ALREADY**, suggested_slug를 실제 등록 slug로 교체.
- **일광당 row 신규 추가**(ALREADY). 생활의 달인 은둔식달 기장 만두 양대산맥, 2026-04-06.
- **원조가야밀면 row 신규 추가**(REVIEW). 하단동 밀면과 동일 식당 가능성.
- 하단동 밀면 notes에 원조가야밀면 cross-reference 추가.

---

## 3. 새로 조사한 프로그램/키워드 및 결과 (2026-06-16 이후 / 최신)

| 프로그램 | 결과 |
|---|---|
| 생활의 달인 은둔식달 6월 | 신규 부산편 미발견(6월 중순 이후). 5월분(하단동밀면)·4월분(제일분식·일광당·스시바시쿠·슌사이쿠보)은 이미 처리 |
| 2TV 생생정보 6월 | 해운대 보리밥(06-15, 마스킹) 외 신규 특정 불가. '모둠 돼지구이'는 2024년 옛 기사 |
| 식객 백반기행 | **종영**(2026-06-21) — 신규 트랙 없음 |
| 성시경 먹을텐데 | 2026 신규 부산분 없음(만우장·월드양념통닭 기존) |
| 쯔양 | 2025-06~07 부산분만, 2026 신규 없음 |
| 풍자 또간집 | 부산 2·3탄 존재하나 2026 신규 부산 특정 불가 |
| 미친맛집(넷플릭스) | 시즌3·4 대기분 4곳(신창=ALREADY, 나머지 미등록) — 신규 아님 |

> 결론: 최근 1~2주(2026-06-16~23) 신규 방송 부산 맛집은 확인되지 않음.
> 부산 방송맛집 공급이 일시적으로 얇은 구간(백반기행 종영 영향).

---

## 4. 후보 현황 (총 15건)

- **READY 0건** (v1 READY 3곳이 모두 ALREADY로 이동)
- **REVIEW 6건**: 하단동밀면, 원조가야밀면, ○○○보리밥, 갈치회관, 승하집, 섬진강재첩전문점
- **ALREADY 8건**: 제일분식·스시바시쿠·슌사이쿠보·일광당·신창국밥(방송) / 송헌집·평양집·뫼밀집(guide)
- **SKIP 1건**: 부산떡방앗간

### REVIEW 상세
| 식당 | 사유 | 데이터 |
|---|---|---|
| 하단동 밀면 | 상호 미특정, 원조가야밀면과 동일 가능 | 생달 1032회 2026-05-25, 사하 하단동 |
| 원조가야밀면 | 하단동밀면과 동일 가능, 방송일 미확정, DB중복 재확인 | 사하 낙동대로451번길 33, 김창구 달인 50년 |
| ○○○ 보리밥 | 상호 마스킹, 번지 미상 | 2TV 2026-06-15, 해운대 중동 |
| 갈치회관 | 넷플릭스라 방송일 null, 가격 미확정 | place 593120865, 좌표 완비 |
| 승하집 | 메뉴 미확정, 전화 010 | place 2020452181, 좌표 완비 |
| 섬진강재첩전문점 | Kakao상호 vs 방송상호 표기차 | place 10488926, 좌표 완비 |

---

## 5. 다음 apply 추천

- **추천 apply 후보 수: 3곳** (REVIEW지만 좌표·place 완비된 미친맛집 시즌3·4)
  - 갈치회관(사상), 승하집(동래), 섬진강재첩전문점(남포동)
  - 보강 필요: 가격대 매장확인, broadcast_date는 넷플릭스 공개라 null 유지(추정 금지)
- 하단동밀면/원조가야밀면은 **동일성 + DB중복** 확정 후(둘 중 1곳만) 등록 판단.
- ○○○보리밥은 상호 확정 전까지 보류.

### 사진 준비 파일명 (apply 시)
- `michinmatjip-sasang-galchi-hoegwan.jpg`
- `michinmatjip-dongnae-seungha-jip.jpg`
- `michinmatjip-jung-seomjingang-jaecheop.jpg`

---

## 6. 위험 작업 미실행 확인

DB write 0 / Storage 0 / 이미지 0 / apply 0 / 등록 0 / 배포 0 / env 변경 0
(실행: git fetch·status·HEAD, restaurants:check·sitemap read-only, 웹조사, CSV·md 갱신)
