# 나온집 방송맛집 DB 보강 후보 (Phase DATA-F1)

> 생성일: 2026-06-06 · read-only 조사 결과. **DB INSERT/UPDATE·Storage 업로드 없음.**
> 모든 사실은 웹 출처 기반이며, **좌표/주소를 추정·창작하지 않았다.** 좌표는 전 후보 미확인(등록 시 주소 지오코딩 필요).

## 요약

- 신규 후보: **23곳** (기존 등록 84곳과 중복 없음)
- `ready_to_register`(바로 등록 가능, 출처·주소 견고): **10곳**
- `needs_coordinate`(주소/좌표/area 보완 필요): **9곳**
- `needs_source`(방송 출처 보강 필요): **4곳**
- 이미지 후보: SAFE **0**, REVIEW **2**(블랑제리 라센·비엔씨제과), 나머지 미발견
- 조사 프로그램: 전현무계획 · 성시경 먹을텐데 · 생활의 달인(빵의 전쟁) · 쯔양 · 백종원의 3대천왕 · 생방송 투데이

### status 정의

| status | 의미 |
|---|---|
| ready_to_register | 방송 출처(언론/공식영상) + 주소가 견고. 좌표만 지오코딩하면 비공개 등록 가능 |
| needs_coordinate | 주소가 블로그 출처/번지 불일치/area 매핑 애매 → 주소·좌표 재확인 후 등록 |
| needs_source | 방송 출처가 블로그·게시판뿐이거나 프로그램 귀속이 애매 → 1차 출처 보강 후 등록 |

> ⚠️ **공통**: 23곳 모두 lat/lng 미확인. restaurants 테이블은 lat/lng NOT NULL이므로 등록 시 주소로 지오코딩 필요. 좌표 추정 금지 원칙에 따라 본 리포트에는 좌표를 비워 두었다.

---

## 1. ready_to_register (10곳)

### 1) 수타혜미칼국수 — 남구 · 분식/길거리
- slug: `jeonhyun-namgu-suta-hyemi-kalguksu`
- 주소: 부산 남구 문현금융로 4
- 대표메뉴: 손칼국수 / 가격: 손칼국수 5,000원, 비빔칼국수 6,000원
- 한줄소개: 50년 전통, 직접 반죽해 손으로 썰어내는 멸치육수 손칼국수집 (전현무계획 곽준빈 추천)
- 방송: 전현무계획2 · 2024-12-13 · 9회 부산편
- 출처: https://www.gukjenews.com/news/articleView.html?idxno=3159804 (국제뉴스) + busan.com 교차확인
- 이미지: 미발견
- note: 방송·식당명 국제뉴스 확인, 주소·메뉴 busan.com 교차확인. 좌표 미확인.

### 2) 해진아나고 — 광안리 · 회/해산물
- slug: `sungsik-gwangalli-haejin-anago`
- 주소: 부산 수영구 광서로10번길 47
- 대표메뉴: 왕발이(붕장어 사시미+구이), 아나고 사시미 / 가격: 아나고사시미 대 90,000원, 왕발이 시가
- 한줄소개: 오후 2시부터 전화 예약만 받는 붕장어 전문점, 왕발이가 대표 (성시경 먹을텐데)
- 방송: 성시경의 먹을텐데(유튜브) · 2024
- 출처: https://www.youtube.com/watch?v=VkW3eo6C0fA (성시경 공식) + 부산일보
- 이미지: 미발견
- note: 공식 유튜브+부산일보로 식당명·주소·메뉴 확인. 업로드일 미특정. 좌표 미확인.

### 3) 만우장 — 광안리 · 중식
- slug: `sungsik-gwangalli-manujang`
- 주소: 부산 수영구 수영로594번길 28-2
- 대표메뉴: 탕수육, 만두, 짜장면/짬뽕 / 가격: 미확인
- 한줄소개: 성시경이 "최애 부산 중국집"으로 꼽은 광안리 노포 중식당
- 방송: 성시경의 먹을텐데(유튜브) · 2024-08-30
- 출처: https://www.youtube.com/watch?v=zA-F9EtsRJc (성시경 공식)
- 이미지: 미발견
- note: 공식 유튜브로 방송 확인, 주소 다이닝코드. 가격 미확인. 좌표 미확인.

### 4) 블랑제리 라센 — 광안리 · 카페/베이커리
- slug: `saengdal-gwangalli-boulangerie-lassence`
- 주소: 부산 수영구 남천바다로9번길 8
- 대표메뉴: 메밀쿠론, 크루아상, 바게트 / 가격: 메밀쿠론 1개 12,800원(반개 7,000원)
- 한줄소개: 르 꼬르동 블루 출신 임소영 달인의 천연발효 베이커리 (생활의 달인 빵의 전쟁)
- 방송: 생활의 달인 960회 · 2024-12-02 · 빵의 전쟁 부산 1탄
- 출처: https://www.lecturernews.com/news/articleView.html?idxno=167320 (한국강사신문) + 다이닝코드
- 이미지: https://www.diningcode.com/profile.php?rid=i9NlGmkDZ8kX — **REVIEW** (프로필 페이지, 실제 사진 별도 확인)
- note: 방영(960회)+주소/메뉴/가격 다이닝코드 교차확인. 좌표 미확인.

### 5) 다리집 — 광안리 · 분식/길거리
- slug: `tzuyang-gwangalli-darijip`
- 주소: 부산 수영구 남천바다로10번길 70 101호
- 대표메뉴: 떡볶이, 오징어튀김, 만두 / 가격: 떡볶이 6,000원, 오징어튀김 6,500원, 만두 5,500원
- 한줄소개: 단맛·매운맛이 조화로운 남천동 떡볶이 노포, 쯔양 부산 3대 떡볶이 투어 포함
- 방송: 쯔양(유튜브) · 2025-07
- 출처: https://www.busan.com/view/busan/view.php?code=2025080714534416582 (부산일보)
- 이미지: 미발견
- note: 쯔양 부산편 출연 부산일보 확인. 원본 유튜브 URL 미확정. 좌표 미확인.

### 6) 상국이네 — 해운대 · 분식/길거리
- slug: `tzuyang-haeundae-sanggukine`
- 주소: 부산 해운대구 구남로41번길 40-1 (해운대전통시장)
- 대표메뉴: 떡볶이, 튀김, 김밥 / 가격: 떡볶이 5,000원, 튀김 1,200원, 김밥 3,500원
- 한줄소개: 물엿을 듬뿍 넣은 달짝지근한 가래떡 떡볶이로 유명한 해운대시장 노포 (쯔양 부산 3대 떡볶이)
- 방송: 쯔양(유튜브) · 2025-07
- 출처: https://www.busan.com/view/busan/view.php?code=2025080714534416582 (부산일보)
- 이미지: 미발견
- note: 쯔양 부산편 출연 부산일보 확인. 원본 유튜브 URL 미확정. 좌표 미확인.

### 7) 동방밀면 — 영도 · 밀면
- slug: `tzuyang-yeongdo-dongbang-milmyeon`
- 주소: 부산 영도구 꿈나무길 239
- 대표메뉴: 물밀면, 비빔밀면 / 가격: 물밀면 7,000원, 비빔밀면 7,500원
- 한줄소개: 한방 향이 약하고 얇은 면발이 특징인 영도 밀면집, 쯔양이 대중적 입맛에 가장 맞다고 꼽음
- 방송: 쯔양(유튜브) · 2025-07
- 출처: https://www.busan.com/view/busan/view.php?code=2025080714534416582 (부산일보)
- 이미지: 미발견
- note: 쯔양 부산편 출연 부산일보 확인. 등록된 다른 밀면집과 별개. 좌표 미확인.

### 8) 동삼동불짬뽕 — 영도 · 중식
- slug: `tzuyang-yeongdo-dongsamdong-buljjampong`
- 주소: 부산 영도구 동삼남로 21
- 대표메뉴: 불짬뽕, 불짜장(맵기 4단계) / 가격: 불짬뽕 8,000원·짜장면 6,000원 (보도 기준, 공식가 재확인 권장)
- 한줄소개: 매운맛으로 유명한 영도 동삼동 매운 짬뽕집, 쯔양 매운맛 도전 먹방
- 방송: 쯔양(유튜브) · 2025-07
- 출처: https://www.busan.com/view/busan/view.php?code=2025080714534416582 (부산일보)
- 이미지: 미발견
- note: 쯔양 출연 부산일보 확인. 상호 정식명 다이닝코드 확인. 가격 재확인 권장. 좌표 미확인.

### 9) 삼성갈미조개 — 기타(강서구 명지) · 회/해산물
- slug: `tzuyang-gangseo-samseong-galmijogae`
- 주소: 부산 강서구 르노삼성대로 602 2층
- 대표메뉴: 갈삼구이(갈미조개+삼겹살), 갈미조개 샤브샤브 / 가격: 중 50,000원, 대 60,000원
- 한줄소개: 낙동강 하구 특산 갈미조개를 삼겹살과 구워 먹는 명지 향토 맛집, 쯔양 방문
- 방송: 쯔양(유튜브) · 2025-07
- 출처: https://www.busan.com/view/busan/view.php?code=2025081316134398280 (부산일보) + 튜브맵
- 이미지: 미발견
- note: 쯔양 출연 교차확인. **area 강서구는 AREA_TYPES에 없어 '기타'로 매핑.** 좌표 미확인.

### 10) 동춘이만두 — 서면(부산진구 당감동) · 분식/길거리
- slug: `tzuyang-seomyeon-dongchuni-mandu`
- 주소: 부산 부산진구 당감로25번길 11
- 대표메뉴: 손수제비, 비빔칼국수, 고기만두 / 가격: 수제비 약 3,500~4,000원, 비빔칼국수 4,500원, 고기만두 3,000원 (전 메뉴 5천원 이하)
- 한줄소개: 전 메뉴 5천원 이하 당감동 30년 가성비 노포, 쯔양이 맛본 로컬 맛집
- 방송: 쯔양(유튜브) · 2025-07
- 출처: https://www.busan.com/view/busan/view.php?code=2025081316134398280 (부산일보)
- 이미지: 미발견
- note: 쯔양 출연 부산일보 확인. **부산진구 당감동 → 기존 개금밀면(부산진구=서면) 매핑 관례 따라 area 서면.** 가격 출처 간 차이. 좌표 미확인.

---

## 2. needs_coordinate (9곳)

| slug | 식당명 | 지역 | 부족한 항목 | 이유 |
|---|---|---|---|---|
| jeonhyun-nampo-yeosongje | 여송제 | 남포동 | 주소·가격·좌표 | 주소가 블로그 출처(기사 미재확인), 가격 미확인 |
| jeonhyun-gwangalli-biwa-suljan | 비와술잔 | 광안리 | 가격·주소·좌표 | 가격 출처 불일치(35,000/39,000), 주소 출처 약함 |
| jeonhyun-sasang-andong-doejigukbap | 안동돼지국밥 | 사상 | 주소·방영일·좌표 | 주소 번지 712/718 불일치, 정확한 방영일 미상 |
| saengdal-haeundae-mainichi | 마이니치 | 해운대 | 주소·좌표 | 주소 블로그 출처(hajungood) |
| saengdal-dongu-choryang-ondang | 초량온당 | 기타(동구) | 주소·좌표·area | 주소 블로그 출처, 동구는 AREA_TYPES 외 |
| saengdal-yeonje-q-ze | 큐제 | 연제 | 주소·좌표 | 주소 블로그 출처 |
| saengdal-dongu-bnc-jegwa | 비엔씨제과 | 기타(동구) | 주소·좌표·area | 주소 블로그 출처, 동구는 AREA_TYPES 외 (단 공식 인스타 있음) |
| live-today-seomyeon-choegane-eomma-nakji | 최가네엄마낙지 | 서면 | 영업확인·가격·좌표 | 2017년 방영(오래됨), 영업 지속·가격 재확인 필요 |
| samdae-saha-bokseong-banjeom | 복성반점 | 기타(사하) | 영업확인·좌표·area | 2015년 방영(오래됨), 사하구는 AREA_TYPES 외 |

상세 출처:
- 여송제·비와술잔: https://www.gukjenews.com/news/articleView.html?idxno=3159804 (전현무계획2, 국제뉴스)
- 안동돼지국밥: https://www.busan.com/view/busan/view.php?code=2025112715301742387 (부산일보)
- 마이니치·초량온당·큐제: https://www.lecturernews.com/news/articleView.html?idxno=167320 (생활의 달인 960회)
- 비엔씨제과: https://m.news.nate.com/view/20241209n38014?mid=e02 (생활의 달인 961회) · 이미지(REVIEW): https://www.instagram.com/bncbakery_official/
- 최가네엄마낙지: https://www.kyeongin.com/article/1218900 (경인일보)
- 복성반점: https://www.veritas-a.com/news/articleView.html?idxno=49113 (베리타스알파)

---

## 3. needs_source (4곳)

| slug | 식당명 | 지역 | 이유 |
|---|---|---|---|
| live-today-haeundae-mipojip | 미포집 | 해운대 | 출처가 맛집 게시판(onlmenu)뿐, 1차 언론 아님. 2022년 방영 |
| samdae-gwangalli-mad-dogs | 매드독스 | 광안리 | 출처가 여행 블로그(trip.com)뿐, 방송일 미상 |
| samdae-namgu-mozart | 모짜르트 | 남구 | 출처가 여행 블로그(trip.com)뿐, 방송일 미상 |
| samdae-nampo-gohyang-kimchi-jeongol | 고향김치전골 | 남포동 | 프로그램 귀속 혼선(3대천왕 vs 생생정보통) |

상세 출처:
- 미포집: https://onlmenu.com/bbs/board.php?bo_table=sb&wr_id=2387
- 매드독스·모짜르트: https://kr.trip.com/blog/busan-famous-delicious-restaurants/
- 고향김치전골: https://www.youtube.com/watch?v=LLMDfCwyLiw

---

## 4. 제외(excluded) — 조사 중 규칙에 따라 후보화하지 않음

| 대상 | 판단 | 이유 |
|---|---|---|
| 또간집 부산 EP.51 돼지국밥집들 | excluded | 출연 식당 상호가 기사에 미기재(상호 추정 금지) |
| 히밥 부산(코미디TV '대식좌의 밥상') | excluded | 기사가 음식만 묘사, 식당 상호 미공개 |
| 6시 내고향 / 한국인의 밥상 부산편 | excluded | 상호 미공개 또는 기존 등록분과 중복(짚불곰장어·멸치쌈밥 등) |
| 서리단 (생활의 달인 2025-07) | excluded | 양산 소재(부산 외) |
| 해저도시(민락 랍스터) | excluded | 실제 출연 프로그램은 2TV 생생정보(담당 프로그램 외) |
| 삼오불고기·부산갈매기 등 | excluded | 개인 블로그/SNS/지도리뷰 외 신뢰 출처 없음 |

---

## 5. 이미지 후보 요약

| slug | 식당명 | risk | source_type | url | note |
|---|---|---|---|---|---|
| saengdal-gwangalli-boulangerie-lassence | 블랑제리 라센 | REVIEW | web(다이닝코드) | https://www.diningcode.com/profile.php?rid=i9NlGmkDZ8kX | 프로필 페이지(직접 사진 아님), 사용 전 확인 |
| saengdal-dongu-bnc-jegwa | 비엔씨제과 | REVIEW | sns(공식 인스타) | https://www.instagram.com/bncbakery_official/ | 공식 계정이나 저작권 확인 필요 |

- **SAFE 이미지 후보: 0곳.** 식당 공식 홈페이지의 음식 사진처럼 라이선스가 명확한 SAFE 후보는 이번 조사에서 확보하지 못함.
- 나머지 21곳은 이미지 후보 미발견. 이미지 수집은 별도 Phase(IMG)로 분리 권장.
- 이번 작업에서 이미지 **다운로드/업로드 없음**. URL과 출처만 기록.

---

## 6. 중복 검사 결과

- 기준: restaurant name(exact/normalized), slug, address 유사, source_url, 동일 식당 다른 표기.
- 결과: 23곳 모두 기존 84곳과 **중복 아님(unique)**.
- 동일 메뉴군 참고(중복 아님): 최가네엄마낙지(서면 낙곱새) ↔ 등록 '광안리 낙곱새'(수영구) — 다른 업소. 동방밀면(영도) ↔ 등록 내호냉면·국제밀면·대연밀면·원조가야밀면 — 다른 업소. 신규 베이커리 5곳 ↔ 등록 송스베이커리·쉐라미과자점·미쌤쌀빵·피넛빵앗간 — 다른 업소.

---

## 7. 운영자 다음 단계

1. **즉시**: `restaurant-quick-paste-blocks.md`의 "바로 등록 가능 10곳"을 Admin quick-register에 **비공개**로 붙여넣기 → 주소로 좌표 지오코딩 → 검수 후 공개.
2. needs_coordinate 9곳: 주소/번지/area 재확인 후 등록.
3. needs_source 4곳: 1차 방송 출처(공식 채널/언론) 확보 후 등록.
4. 이미지: 별도 IMG Phase에서 SAFE 후보 수집.
