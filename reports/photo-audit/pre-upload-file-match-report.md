# 나온집 업로드 전 파일 매칭 검증 (29개)

- 점검일: 2026-06-10 (read-only — 업로드/DB 변경 없음)
- 입력 폴더(실제): `C:\work\naonzip\local-assets\restaurant-thumnails` (⚠ 폴더명 b 누락 오타 — 동작엔 지장 없음, 이름 변경 권장)
- 대조 기준: `reports/photo-audit/missing-photo-restaurants.csv` (사진 누락 83곳) + 공개 식당 목록 No.1~30

## 요약

| 항목 | 값 |
|---|---|
| 폴더 내 이미지 파일 수 | **29** (jpg 27 / jpeg 1 / png 1) |
| slug 매칭 성공 | **29 / 29 (100%)** |
| 매칭 실패 | 0 |
| DB slug 없는 파일 | 0 |
| 중복 slug 파일 | 0 |
| 확장자 문제 | 0 (전부 스크립트 허용 확장자) |
| 파일명 형식 문제(대소문자/공백/한글/특수문자) | 0 (전부 소문자 ASCII slug) |
| 업로드 전 수정 필요한 파일 | **0** |
| 업로드 가능 후보 | **29** |

검증 산식: 공개 사진누락 목록 **No.1~30 (30곳) − 만우장(No.3, 폐업 제보) = 29곳** ↔ 파일 29개 **완전 일치**.

## 파일 ↔ slug ↔ 식당 대조표 (29건 전부 match_ok)

| No(목록) | 파일명 | 식당명 | 지역 | 판정 |
|---:|---|---|---|---|
| 1 | sungsik-gwangalli-geumson-1983.jpg | 금손1983 | 광안리 | match_ok |
| 2 | saengdal-suyeong-dongyang-sarada-namcheon.jpg | 동양사라다 남천본점 | 광안리 | match_ok |
| 4 | saengdal-gwangalli-boulangerie-lassence.jpg | 블랑제리 라센 | 광안리 | match_ok |
| 5 | jeonhyun-gwangalli-biwa-suljan.jpg | 비와술잔 | 광안리 | match_ok |
| 6 | saengbang-gwangalli-sanhae-hoejip.jpg | 산해횟집 | 광안리 | match_ok |
| 7 | subyeon-choego-doejigukbap-minrak.jpg | 수변최고돼지국밥 민락본점 | 광안리 | match_ok |
| 8 | jeonhyun-gwangalli-yeonhap-hoejip.jpg | 연합횟집 | 광안리 | match_ok |
| 9 | saengdal-gwangalli-jin-doejigomtang.jpg | 진돼지곰탕 | 광안리 | match_ok |
| 10 | sungsik-gwangalli-haejin-anago.jpg | 해진아나고 | 광안리 | match_ok |
| 11 | saengdal-gijang-ilgwangdang.jpg | 일광당 | 기장 | match_ok |
| 12 | saengdal-gijang-jeil-bunsik.jpg | 제일분식 | 기장 | match_ok |
| 13 | bapsang-gijang-haebyeon-jipbul-gomjangeo.jpg | 해변짚불곰장어 | 기장 | match_ok |
| 14 | tzuyang-gangseo-samseong-galmijogae.jpg | 삼성갈미조개 | 기타 | match_ok |
| 15 | saengdal-geumjeong-songs-bakery.jpg | 송스 베이커리 | 기타 | match_ok |
| 16 | saengdal-saha-cheramie.jpg | 쉐라미과자점 | 기타 | match_ok |
| 17 | baekban-seogu-yetnal-guksujip.jpg | 옛날국수집 | 기타 | match_ok |
| 18 | kimyusun-daegu-bbol-jjim.jpg | 김유순대구뽈찜전문점 | 남구 | match_ok |
| 19 | saengdal-namgu-daeyeon-milmyeon.jpg | 대연밀면 | 남구 | match_ok |
| 20 | jeonhyun-namgu-suta-hyemi-kalguksu.jpg | 수타혜미칼국수 | 남구 | match_ok |
| 21 | ddoganjip-pungnyeon-gopchang.jpg | 풍년곱창 | 남구 | match_ok |
| 22 | pungja-namgu-hapcheon-gukbap.jpg | 합천국밥집 | 남구 | match_ok |
| 23 | baekban-nampo-18-wandang.png | 18번완당집 | 남포동 | match_ok |
| 24 | 2tv-bupyeong-kkang-dwaehu.jpg | 깡돼후 | 남포동 | match_ok |
| 25 | tzuyang-nampo-ssiat-hotteok.jpeg | 남포동 씨앗호떡 | 남포동 | match_ok |
| 26 | mulkkong-sikdang.jpg | 물꽁식당 | 남포동 | match_ok |
| 27 | jeonhyun-nampo-mullebanga-jeukseokgui.jpg | 물레방아 즉석구이 | 남포동 | match_ok |
| 28 | pungja-nampo-milyangjib.jpg | 밀양집 | 남포동 | match_ok |
| 29 | baekhwa-yanggopchang-1ho.jpg | 백화양곱창 1호 | 남포동 | match_ok |
| 30 | oneuln-nampo-sammi-jip.jpg | 삼미집 | 남포동 | match_ok |

- 파일은 있는데 DB slug 없는 경우: **없음**
- 목록 No.1~30 중 파일 없는 slug: **sungsik-gwangalli-manujang(만우장, No.3)** 1건 — 의도된 제외(폐업 제보, `closed-business-candidates.md` 참고)

## 참고 사항 (수정 불필요, 다음 단계 인지용)

- `baekban-nampo-18-wandang.png`(2.0MB), `baekhwa-yanggopchang-1ho.jpg`(2.1MB)는 용량이 크지만
  스크립트가 webp(긴 변 ≤1200, q85)로 변환하므로 문제 없음.
- 이미지 해상도(400x300 미만 경고)는 이번 점검에서 열어보지 않음 — **다음 단계 dry-run이 자동 검증**함.
- 29곳 모두 공개(is_published=true) + 기존 thumbnail 없음 → 스크립트 기본 모드(신규 upload)에 정확히 해당.
  `--replace`/`--include-private` 불필요.

## 다음 단계 (이번엔 실행 안 함)

1. (권장) 폴더명 오타 수정: `restaurant-thumnails` → `restaurant-thumbnails`
2. dry-run: `node scripts/upsert-restaurant-thumbnails.mjs "<폴더 경로>"` → planned_new 29건 확인
3. 확인 후 `--apply` 로 실제 업로드 + thumbnail 반영 (홈/목록은 ISR 최대 1시간 내 반영)
