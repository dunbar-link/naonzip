# 우슐랭 신규 후보 1차 3곳 등록 준비 (dry-run)

> 사진 확보 전 dry-run. DB/Storage write 0. 근거: postoffice-busan-2026.csv (commit 02e46e3).
> 이번 단계는 등록 데이터 확정까지. 실제 INSERT/업로드는 사진 확보 + 공식 URL 정책 결정 후 별도 --apply.

## 확정 대상 (3곳 전부 신규 — READY 유지)

| 항목 | 금강 복아구전문점 | 팔팔연제장어 | 해녀조씨할매집 |
|---|---|---|---|
| slug | postoffice-gwangalli-geumgang-bokagu | postoffice-yeonje-palpal-jangeo | postoffice-gijang-haenyeo-jossi-halmaejip |
| area | 광안리 | 연제 | 기장 |
| category | 해산물 | 해산물 | 해산물 |
| address | 부산광역시 수영구 남천동로9번길 62 | 부산광역시 연제구 황새알로 21-1 | 부산광역시 기장군 기장읍 연화1길 187 |
| phone | 051-623-1193 | 051-507-5244 | 051-721-2972 |
| lat | 35.1451902896209 | 35.1940969366645 | 35.2183389825916 |
| lng | 129.111588995976 | 129.074936860493 | 129.227556761787 |
| kakao_place_id | 638676502 | 91948145 | 19736636 |
| kakao_map_url | place.map.kakao.com/638676502 | place.map.kakao.com/91948145 | place.map.kakao.com/19736636 |
| 관할 우체국 | 남부산우체국 #8 | 부산연제우체국 #1 | 기장우체국 #4 |
| 선정 연도 | 2026 | 2024·2025·2026 | 2025·2026 |
| source_type | guide | guide | guide |
| 이미지 | postoffice-gwangalli-geumgang-bokagu.jpg | postoffice-yeonje-palpal-jangeo.jpg | postoffice-gijang-haenyeo-jossi-halmaejip.jpg |
| is_published(예정) | false | false | false |

### 대표 메뉴/가격 (PDF 수록값 — 현재값 등록 전 재확인)
- 금강 복아구전문점: 복탕 ₩15,000 | 생밀복 ₩20,000 | 아구찜(중) ₩50,000
- 팔팔연제장어: 민물장어구이(1인분) ₩32,000 | 바다장어구이 ₩23,000 | 장어추어탕 ₩12,000
- 해녀조씨할매집: 전복죽세트 2인/3인/4인 ₩55,000/₩75,000/₩95,000 | 전복죽 ₩12,000

## area/category 매핑 근거 (canonical 값만)
- area: 수영구→**광안리**(DB 수영구 식당 다수가 광안리), 연제구→**연제**, 기장군→**기장** (전부 AREA_TYPES 기존값)
- category: 3곳 모두 **해산물**.
  - 복아구/전복죽 = DB 기존 "기장 전복죽=해산물", "기장 대게찜=해산물" 동일 매핑.
  - 장어는 **전용 category 없음** → DB 선례(곰장어 "해변짚불곰장어=해산물") 따라 해산물.
  - 신규 area/category 생성 0.

## 중복 최종 재검사 (운영 restaurants 111 / trust 19)
| 검사 | 금강 복아구 | 팔팔연제장어 | 해녀조씨할매집 |
|---|---|---|---|
| slug 중복 | 없음 | 없음 | 없음 |
| exact name | 없음 | 없음 | 없음 |
| kakao place_id | 없음 | 없음 | 없음 |
| 전화 중복 | 없음 | 없음 | 없음 |
| 좌표 120m내 | 없음 | 없음 | 없음 |
| 유사 상호 | 없음 | 없음 | 없음 |

- **해녀조씨할매집 혼동 점검**: DB 해녀/할매 계열 8곳 확인. 같은 기장의 "5번 친구해녀할매집"은
  주소(기장해안로 668) ≠ 해녀조씨할매집(연화1길 187) → **별개 식당 확정**. 나머지는 타 구.
- 3곳 모두 신규 식당으로 확정. 기존 restaurants 수정 예정 0.

## 출처 정책 (trust_sources 예정)
- source_type(restaurants): **guide** (우슐랭/postoffice 같은 신규 enum 값 사용 안 함)
- source_title: 우체국 추천 맛집가이드 2026
- trust_source: source_kind=guide / source_name="우체국 추천 맛집가이드 2026" /
  trust_label="부산지방우정청 추천" / source_url=null / verified_at=등록일
- appearances: 생성 안 함 (방송 전용)
- 우슐랭 검색은 향후 trust_sources.source_name 으로 판정(이번에 필터 구현 안 함)

## 공식 URL 상태
- OFFICIAL_URL_REVIEW. 발행처 도메인(부산지방우정청 koreapost.go.kr/bs)만 확인, 책자 PDF URL 미확인.
- source_url 은 nullable(타입 TrustSource.sourceUrl optional / DB text nullable) → URL 없이 INSERT 기술적으로 가능.
- **단 trust_source.is_public 공개 여부는 대장 결정 사항** (공식 URL 없이 공개 출처로 노출할지). dry-run에선 PENDING.

## 이미지 상태 (입력 폴더 C:\work\naonzip-thumbnail-input\)
| 식당 | 파일 | 상태 |
|---|---|---|
| 금강 복아구전문점 | postoffice-gwangalli-geumgang-bokagu.jpg | **IMAGE_PENDING** (없음) |
| 팔팔연제장어 | postoffice-yeonje-palpal-jangeo.jpg | **IMAGE_PENDING** (없음) |
| 해녀조씨할매집 | postoffice-gijang-haenyeo-jossi-halmaejip.jpg | **IMAGE_PENDING** (없음) |

> 폴더 자체는 존재(기존 썸네일 다수). 3곳 신규 파일만 미존재. 우체국 PDF 사진 사용 금지.

## 예상 변화 (apply 시)
- restaurants INSERT: 3 (is_published=false)
- trust_sources INSERT: 3
- appearances INSERT: 0 / 기존 수정: 0
- Storage 업로드: 3 (사진 확보 후)

## apply 블로커
1. **IMAGE_PENDING** — 3곳 썸네일 미존재. 사진 확보가 선행돼야 apply.
2. **OFFICIAL_URL_REVIEW** — 공식 URL 미확인. trust_source.is_public(공개 여부) 정책 결정 필요.

## 대장이 준비할 사진 체크리스트
- [ ] C:\work\naonzip-thumbnail-input\postoffice-gwangalli-geumgang-bokagu.jpg  (금강 복아구전문점)
- [ ] C:\work\naonzip-thumbnail-input\postoffice-yeonje-palpal-jangeo.jpg  (팔팔연제장어)
- [ ] C:\work\naonzip-thumbnail-input\postoffice-gijang-haenyeo-jossi-halmaejip.jpg  (해녀조씨할매집)
- 우체국 PDF 속 사진 사용 금지(직접 촬영/공식 이미지). 가로 비율 권장(기존 썸네일 관례).

## Dry-run 판정
- 대상 CSV 행 3 / READY 유지 3 / REVIEW 0
- 신규 restaurants 예정 3 / 기존 수정 0 / 신규 trust_sources 예정 3 / appearances 0
- slug·kakao·전화·좌표 중복 0 / 좌표·전화 추정 0 / Storage 충돌 0
- DB write 0 / Storage write 0
- BLOCKED: 공식 URL·사진 2건 외 0 → **3곳 등록 준비 완료(사진+URL정책만 대기)**
