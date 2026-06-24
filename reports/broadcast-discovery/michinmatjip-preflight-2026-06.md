# 미친맛집 3곳 apply 전 preflight — 갈치회관·승하집·섬진강재첩전문점

- 생성일: 2026-06-23 (KST)
- 기준 HEAD: 7193c21 / branch master
- 목적: 미친맛집 시즌3·4 후보 3곳 apply 전 최종 preflight (read-only). 등록 아님.
- 결론: **3곳 모두 APPLY_READY** (메뉴·가격·좌표·출처·area·category 확정)

---

## 0. 최종 판정 요약

| 후보 | 판정 | 핵심 근거 |
|---|---|---|
| 갈치회관 | **APPLY_READY** | 가격·메뉴·영업·좌표·place 확정, 중복없음 |
| 승하집 | **APPLY_READY** | 가격(다이닝코드) 확보, 시즌3 8화 공개일 2025-10-02 확정 |
| 섬진강재첩전문점 | **APPLY_READY** | 가격·메뉴 확정, 별개 업장 확인 |

> 단 3곳 모두 넷플릭스 공개라 `broadcast_date`는 승하집(2025-10-02)만 확정, 나머지는 null(추정 금지).
> 운영 DB **전체 좌표 정밀 120m 대조는 read-only 수단 제약으로 미수행** → apply 단계 재확인 권장.

---

## 1. 후보별 상세

### 1-1. 갈치회관 — APPLY_READY
| 항목 | 값 |
|---|---|
| place_id | 593120865 |
| address | 부산 사상구 낙동대로 1402 1층 |
| phone | 051-301-8292 (Kakao 안심번호 0507-1457-8342 병기) |
| lat/lng | 35.1852347394636 / 128.977382420717 |
| 영업 | 영업중 (매일 10:00-21:00, 브레이크 15-16시) |
| 대표메뉴/가격 | 갈치조림 1인 18,000 / 2인 30,000, 갈치정식 25,000, 갈치회무침 세꼬시 50,000 |
| source | 미친맛집 시즌4 6화 / 공개일 추정 2025-12(미확정→null) |
| source_url | https://histale.com/i/넷플릭스-미친맛집-식당-리스트/A (가격: diningcode Ds8ucATMrCkV) |
| area/category | 사상 / 해산물 |
| suggested_slug | michinmatjip-sasang-galchi-hoegwan |
| 사진 파일명 | michinmatjip-sasang-galchi-hoegwan.jpg |

### 1-2. 승하집 — APPLY_READY
| 항목 | 값 |
|---|---|
| place_id | 2020452181 |
| address | 부산 동래구 사직북로5번길 31 (사직동 89-3) |
| phone | 010-9102-5535 |
| lat/lng | 35.1960653454399 / 129.059141057486 |
| 영업 | 영업중 (월~금 16:00-24:00, 토~일 16:00-02:00 — 밤영업/안주전문) |
| 대표메뉴/가격 | 수육(생오겹살) 39,000~55,000, 석쇠불고기 20,000, 오징어순대 15,000, 통문어 60,000~싯가 |
| source | 미친맛집 시즌3 8화 "홈런! 치는 부산의 맛" / **공개일 2025-10-02 확정** |
| source_url | https://www.topstarnews.net/news/articleView.html?idxno=15827872 (가격: diningcode 9tSByxSJeEUl) |
| area/category | 동래 / 한식 |
| suggested_slug | michinmatjip-dongnae-seungha-jip |
| 사진 파일명 | michinmatjip-dongnae-seungha-jip.jpg |

> 참고: 롯데 이승하 선수 어머니 운영, 사직야구장 인근. 밤 안주전문(포차형) → 화면/설명에 영업시간 반영 권장.

### 1-3. 섬진강재첩전문점 — APPLY_READY
| 항목 | 값 |
|---|---|
| place_id | 10488926 |
| address | 부산 중구 광복로85번길 15-1 (동광동) |
| phone | 051-246-6471 |
| lat/lng | 35.09976889685181 / 129.034752338281 |
| 영업 | 영업중 |
| 대표메뉴/가격 | 재첩국정식 14,000 / 재첩국비빔밥 17,000 (고등어조림 반찬 강점) |
| source | 미친맛집 시즌3 6화 / 공개일 추정 2025-09(미확정→null) |
| source_url | https://www.busan.com/view/busan/view.php?code=2026020410372017215 |
| area/category | 남포동 / 해산물 |
| suggested_slug | michinmatjip-jung-seomjingang-jaecheop |
| 사진 파일명 | michinmatjip-jung-seomjingang-jaecheop.jpg |

> 주의: Kakao 등록 상호 "섬진강재첩전문점" vs 방송 노출 "섬진강재첩국" 표기차 → 등록 name 결정 필요(Kakao 상호 권장).

---

## 2. 중복 / 120m 근접 확인

| 후보 | place_id 중복 | slug 중복 | 인접 기존 공개식당(부분 대조) | 판정 |
|---|---|---|---|---|
| 갈치회관 | 없음 | 운영 404 | 영희할매재첩국(사상) ~1.2km | 충돌 없음 |
| 승하집 | 없음 | 운영 404 | 사직동 기존 공개식당 미확인 | 충돌 없음(추정) |
| 섬진강 | 없음 | 운영 404 | 수복센타(중구) ~310m | 충돌 없음(120m 밖) |

- 근거: discovery addendum(2026-06-16) 'DB중복없음' + restaurants:check 404(미등록) + 보유 좌표 부분 대조.
- **한계: 운영 DB 전체 좌표/ place_id 일괄 대조는 read-only 고정 명령에 없음**(전체 조회 스크립트는 reports 다중 파일 write 동반 → 이번 범위 제외). apply 직전 전체 대조 1회 권장.

---

## 3. 등록 파라미터 초안

- **source_type = `tv`** (넷플릭스 쇼. 신창국밥 register-sinchang 선례와 동일. DB enum에 'broadcast' 없음)
- **broadcast_date**: 승하집 `2025-10-02`만 입력, 갈치회관·섬진강은 `null`(공개일 추정치라 입력 금지)
- 주 등록 경로: restaurants(source_type=tv) + restaurant_appearances 1건(신창국밥 패턴)
- trust_sources 초안(선택적 보강 — 현재 trust 0개 78곳 과제 완화용):
  - source_kind: `tv`
  - source_name: `미친맛집: 미식가 친구의 맛집`
  - source_title: 각 시즌/화 (예: 시즌3 8화 "홈런 치는 부산의 맛")
  - source_url: 위 후보별 source_url
  - verified_at: `2026-06-23`
  - trust_label: `넷플릭스 출연`

---

## 4. 다음 apply 추천

- **APPLY_READY 3곳 전부** apply 대상 (갈치회관·승하집·섬진강재첩전문점)
- apply 예상 수 변화:
  - 비공개 등록: restaurants 151 → 154 (public 134 유지)
  - 공개 전환(썸네일 확정 후): public 134 → 137
- 필수 선행: 사진 3장 준비, apply 직전 운영 DB 전체 중복/120m 1회 재대조
- 등록 name: 섬진강은 Kakao 상호 "섬진강재첩전문점" 사용 권장

---

## 5. 위험 작업 미실행 확인

DB write 0 / Storage 0 / 이미지 0 / apply 0 / 등록 0 / 배포 0 / git add·commit·push 0 / env 0
(실행: git status·HEAD, restaurants:check 기조회, 웹조사 read-only, preflight md 1개 생성)
