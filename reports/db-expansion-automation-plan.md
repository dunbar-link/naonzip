# 나온집 신규 DB 확장 자동화 계획 (Phase OPS-G1 · D)

> 생성일: 2026-06-07 · read-only 조사 + 설계. **이번 Phase는 DB INSERT 안 함.** 구조 점검 + 다음 실행 계획.

## 1. 현재 후보 등록 흐름

세 갈래가 공존한다.

1. **candidate_queue 테이블** (triage 큐)
   - 컬럼: source_type/source_name/episode_title/restaurant_name/area_guess/source_url/status(PENDING·VERIFIED·REJECTED)/confidence_score/operator_note/converted_restaurant_slug.
   - 액션(admin/candidates/actions.ts): `addCandidate`, `updateCandidateStatus`, `convertCandidateToRestaurant`, `addCandidateAppearanceToRestaurant`.
   - 현재 상태: VERIFIED 13, REJECTED 3, PENDING 0(대부분 quick-register가 직접 처리).
2. **quick-register** (핵심 경로, ADMIN-F1로 강화됨)
   - `quickRegisterRestaurant`: restaurants INSERT(is_published=false 고정) + restaurant_appearances dual-write + candidate_queue에 VERIFIED+converted 기록.
   - `findPossibleDuplicates`: name/slug/address/phone/kakao/좌표근접/출처유사 가중 점수로 중복 후보 제시.
   - `addAppearanceToRestaurant`: 강한 중복이면 새로 만들지 않고 기존 식당에 출연만 추가.
   - 붙여넣기 파서(admin-restaurant-paste): 한국어 라벨 자동 매핑(가격정보·방송명·한줄소개 등 alias 보강됨), 방영일 완전날짜만 채움.
   - "주소로 좌표 찾기" 버튼: Kakao services(Geocoder/Places)로 lat/lng + place_url 자동 채움.
3. **admin/candidates convert** (candidate_queue → restaurant 변환 UI)

## 2. 항목별 현황

- **신규 후보 넣는 최적 경로**: **quick-register** (붙여넣기→자동채움→좌표찾기→중복확인→비공개 등록). candidate_queue는 "아직 검증 안 된 대량 후보 보관/triage"용으로 병행.
- **중복검사**: quick-register의 `findPossibleDuplicates`(등록 직전) — 가장 신뢰도 높음.
- **좌표/카카오맵**: quick-register "주소로 좌표 찾기"(운영자 실브라우저, Kakao 도메인 허용 환경). 자동 조사 단계에선 정밀 좌표 불가(키 제약).
- **방송/유튜브 출처 URL**: restaurants(source_type/source_title/program_name/creator_name/episode_title/broadcast_date/video_url) + restaurant_appearances dual-write.
- **공개 전 검증**: 필수필드 + 부산 좌표범위 + slug 유효성 게이트, 기본 비공개. 공개는 별도(DATA-F3/F4식 preflight 후 전환).

## 3. 자동화 가능 / 위험 구분

### 자동화하기 좋은 부분 (이미 검증된 패턴 — DATA-F1/F2)
- **후보 수집**: 프로그램별 웹조사(병렬 에이전트) → 기존 DB와 중복 제외 → `quick-paste-blocks.md` 생성. (출처 URL 필수, 좌표/주소 추정 금지)
- **중복 사전 스크리닝**: 기존 slug/name/address와 정규화 비교(코드).
- **빠른등록 블록 포맷**: 운영자가 quick-register에 그대로 붙여넣기.

### 자동화하면 위험한 부분 (사람 확인 유지)
- **자동 DB INSERT / 자동 공개**: 사실 오류·좌표 추정·상호 오인 위험 → 운영자 quick-register + preflight 게이트 유지.
- **제3자 이미지 자동 수집/업로드**: 저작권 → SAFE 공식/공공 또는 운영자 사진만.
- **정밀 좌표 자동 확정**: 키 제약으로 Admin Kakao 지오코딩이 정답.

## 4. 추천 다음 Phase

**DATA-G1(가칭) "신규 방송맛집 후보 자동수집 2차"**
- 대상 소스: 전현무계획 부산 / 생방송투데이 부산 / 생활의달인 부산 / 2TV 생생정보 부산 / 백반기행 부산 / 성시경 먹을텐데 / 쯔양 / 히밥 / 또간집 / 부산 맛집 유튜브.
- 산출: `reports/restaurant-data-candidates-round2.{md,csv}` + `restaurant-quick-paste-blocks-round2.md` (출처 URL·중복 제외·status 분류).
- 실행: 병렬 에이전트 수집 → 기존 ~94곳(94개 row) 대비 중복 제외 → 운영자가 quick-register로 비공개 등록 → DATA-F3/F4식 검증·공개.
- 원칙: DB INSERT는 운영자가, 좌표는 Admin 지오코딩, 이미지는 별도 IMG Phase.

예상 산출물: 신규 후보 10~20곳(중복 제외) + 빠른등록 블록 + 검증 체크리스트.

## 5. 이미지 vs DB — 우선순위 판단

- 홈 첫 화면 실사진은 완료. 목록/검색 품질을 위해선 **이미지 보강(운영자 사진 중심)**과 **DB 확장** 둘 다 가치 있음.
- 권장 순서: ① 지인 공유 피드백 수집(현 상태로 충분) → ② 피드백 반영해 이미지 교체 파이프라인(OPS-G2) 또는 DB 2차 수집(DATA-G1) 중 선택.
