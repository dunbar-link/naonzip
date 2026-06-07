# 나온집 DATA-G2 신규 후보 자동등록 결과

- 모드: DRY-RUN
- 대상: 13
- status 분포: skipped_missing_required=12, skipped_duplicate=1
- 공개 78→78, 전체 94→94

| status | slug | 식당명 | private | appearance | 좌표 | field_status | note |
|---|---|---|---|---|---|---|---|
| skipped_missing_required | jeonhyun-gwangalli-biwa-suljan | 비와술잔 |  |  | (없음) | 누락: lat/lng(NOT NULL·좌표없음) | 필수필드 누락 → INSERT 불가. lat/lng(NOT NULL·좌표없음) |
| skipped_missing_required | jeonhyun-yeongdo-watda-sikdang | 왔다식당 |  |  | (없음) | 누락: lat/lng(NOT NULL·좌표없음) | 필수필드 누락 → INSERT 불가. lat/lng(NOT NULL·좌표없음) |
| skipped_missing_required | jeonhyun-gwangalli-yeonhap-hoejip | 연합횟집 |  |  | (없음) | 누락: lat/lng(NOT NULL·좌표없음) | 필수필드 누락 → INSERT 불가. lat/lng(NOT NULL·좌표없음) |
| skipped_duplicate | jeonhyun-nampo-yeosongje | 여송제 |  |  | (없음) |  | 강중복 의심: video_url |
| skipped_missing_required | jeonhyun-nampo-mullebanga-jeukseokgui | 물레방아 즉석구이 |  |  | (없음) | 누락: lat/lng(NOT NULL·좌표없음) | 필수필드 누락 → INSERT 불가. lat/lng(NOT NULL·좌표없음) |
| skipped_missing_required | 2tv-sasang-yeonghui-halmae-jaecheopguk | 영희할매재첩국 |  |  | (없음) | 누락: lat/lng(NOT NULL·좌표없음) | 필수필드 누락 → INSERT 불가. lat/lng(NOT NULL·좌표없음) |
| skipped_missing_required | baekban-seogu-yetnal-guksujip | 옛날국수집 |  |  | (없음) | 누락: lat/lng(NOT NULL·좌표없음) | 필수필드 누락 → INSERT 불가. lat/lng(NOT NULL·좌표없음) |
| skipped_missing_required | baekban-nampo-subok-centa | 수복센타 |  |  | (없음) | 누락: lat/lng(NOT NULL·좌표없음) | 필수필드 누락 → INSERT 불가. lat/lng(NOT NULL·좌표없음) |
| skipped_missing_required | tzuyang-nampo-ijaemo-pizza | 이재모피자 본점 |  |  | (없음) | 누락: lat/lng(NOT NULL·좌표없음) | 필수필드 누락 → INSERT 불가. lat/lng(NOT NULL·좌표없음) |
| skipped_missing_required | tzuyang-haeundae-chopilsal | 초필살돼지구이 해운대본점 |  |  | (없음) | 누락: lat/lng(NOT NULL·좌표없음) | 필수필드 누락 → INSERT 불가. lat/lng(NOT NULL·좌표없음) |
| skipped_missing_required | ansungjae-yeonje-mapobonga | 마포본가 |  |  | (없음) | 누락: lat/lng(NOT NULL·좌표없음) | 필수필드 누락 → INSERT 불가. lat/lng(NOT NULL·좌표없음) |
| skipped_missing_required | saengdal-gwangalli-baegil-pyeongnaeng | 백일평냉 |  |  | (없음) | 누락: price_text(NOT NULL), lat/lng(NOT NULL·좌표없음) | 필수필드 누락 → INSERT 불가. price_text(NOT NULL), lat/lng(NOT NULL·좌표없음) |
| skipped_missing_required | saengdal-seomyeon-dammiok | 담미옥 |  |  | (없음) | 누락: price_text(NOT NULL), lat/lng(NOT NULL·좌표없음) | 필수필드 누락 → INSERT 불가. price_text(NOT NULL), lat/lng(NOT NULL·좌표없음) |

※ dry-run 입니다.

---

## 핵심 결론 (자동등록 차단)

대상 13곳 **전부 자동 INSERT 불가** → `--apply` 미실행. DB 무변경(공개 78, 전체 94 유지).

차단 사유:

1. **좌표 NOT NULL 제약**: `restaurants.lat`/`lng` 는 schema 상 `double precision NOT NULL`. DATA-G1 후보는 좌표 추정 금지 원칙으로 lat/lng 가 비어 있어 INSERT 시 not-null 위반 → 12곳 `skipped_missing_required(lat/lng)`.
2. **오프라인 지오코딩 불가**: §9가 Nominatim 등 추정 좌표를 금지하고, `.env.local` 에 Kakao **REST** 키가 없음(JS 키만). preview 브라우저도 dapi.kakao.com 차단(DATA-F2 확인). → 스크립트가 좌표를 합법적으로 채울 방법이 없음.
3. **price_text NOT NULL**: 백일평냉·담미옥은 가격 "확인 필요"라 price_text 도 누락.
4. **여송제 video_url 오탐 중복**: source_url(국제뉴스 3159804)이 기존 등록 식당(수타혜미칼국수)과 **같은 기사**라 video_url 중복으로 표시됨 → 실제 다른 식당(오탐). 등록 시 video_url 비우거나 개별 영상 URL 사용 권장.

## 권장 경로

- **운영자 quick-register 사용**: `reports/new-restaurant-quick-paste-g1.md` 의 13개 블록을 Admin quick-register에 붙여넣고 **"주소로 좌표 찾기"**(운영자 브라우저, Kakao 도메인 허용)로 좌표를 채워 비공개 등록. 이것이 좌표를 합법적으로 얻는 정답 경로.
- (대안) Kakao **REST API 키**를 `.env.local` 에 추가하면, 이 스크립트를 확장해 주소→좌표 공식 지오코딩 후 자동 INSERT 가능(별도 Phase).
- needs_review 5곳은 DATA-G1대로 상호/중복 확인 후 별도 처리.

> 이 스크립트는 좌표(또는 REST 키)가 확보되면 그대로 재사용 가능하다(필수필드·중복 게이트 내장, is_published=false 고정).