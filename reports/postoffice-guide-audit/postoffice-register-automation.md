# 우슐랭 후보 등록 자동화 (register-postoffice-candidates.mjs)

우체국 추천 맛집가이드(우슐랭) 후보를 등록하는 반복 절차를 한 스크립트로 묶었다.
**기본은 항상 dry-run**(DB/Storage 무변경). 실제 등록은 이중 안전장치를 통과할 때만.

- 스크립트: `scripts/register-postoffice-candidates.mjs` (node 실행, 기존 .mjs 패턴)
- 기준 CSV: `reports/postoffice-guide-audit/postoffice-busan-2026.csv`
- 이미지 입력 폴더: `C:\work\naonzip-thumbnail-input` (점주/공식 직접 촬영본만, 우체국 PDF 사진 금지)

## 기본 원칙
- `--apply` 가 없으면 **항상 dry-run** — restaurants/trust_sources INSERT 0, Storage 업로드 0, 파일은 리포트만 생성.
- 실제 등록은 `--apply --confirm APPLY_POSTOFFICE_BATCH` 가 **모두** 있을 때만. `--confirm` 없으면 즉시 중단.
- 본 자동화의 apply 경로는 **안전장치 + 검증까지** 담당한다. 실제 INSERT/업로드는 검증된
  `register-postoffice-batchN.mjs`(1·2차 등록에 사용한 경로)를 따른다. → dry-run 으로 NEW_READY/충돌/이미지를
  먼저 확정한 뒤 batch 스크립트로 등록하는 흐름을 권장한다.

## 사용법
```bash
# 이름으로 (CSV 매칭)
node scripts/register-postoffice-candidates.mjs --names "윤가네산오징어,조방낙지 가야점"

# 확정 slug 로
node scripts/register-postoffice-candidates.mjs --slugs "postoffice-bukgu-yungane-san-ojingeo"

# batch JSON 으로 (slug/area/category 확정 권장)
node scripts/register-postoffice-candidates.mjs --batch reports/postoffice-guide-audit/postoffice-register-sample.json

# 실제 등록(이중 안전장치) — 이번 단계에서는 실행하지 않음
node scripts/register-postoffice-candidates.mjs --batch ... --apply --confirm APPLY_POSTOFFICE_BATCH
```

옵션: `--names` `--slugs` `--batch` `--image-dir` `--csv` `--report-dir` `--apply` `--confirm`. (dry-run 이 기본)

## batch JSON 형식
`{ "candidates": [ { "name", "slug", "image", "area", "category" } ] }` — 샘플은 `postoffice-register-sample.json`.
- `slug`: **확정 slug(romanize)** 를 직접 지정. CSV 의 `proposed_slug` 는 placeholder(`postoffice-구-NN`)라 등록용으로 쓰지 않는다.
- `area`/`category`: canonical 값. 미지정 시 area 는 주소 구로 제안하지만 category 는 수동 확정 필요(apply 차단).
- `image`: 미지정 시 `{slug}.jpg` 로 찾는다.

## 이미지 파일명 규칙
- 입력 폴더에 `{slug}.jpg` (또는 batch 의 `image`). jpg/jpeg/png/webp, 최소 400×300, 손상 없음.
- 자동 다운로드·생성·우체국 PDF/블로그/지도 사진 금지.

## 상태 코드
| 코드 | 의미 |
|---|---|
| NEW_READY | 중복 0 + CSV READY → 신규 등록 가능. (단 slug 확정·category 확정·IMAGE_OK 여야 apply 가능) |
| ALREADY_REGISTERED | DB 에 같은 slug/Kakao place ID/전화+이름 → 이미 등록됨. apply 대상 제외(중복 INSERT 안 함). |
| REVIEW | CSV classification=REVIEW, 좌표 120m 근접, 지점 혼동 가능 등 → 수기 확인 필요. |
| BLOCKED | slug/place 충돌, 이미지 invalid, CSV 필수 컬럼 누락, NOT_FOUND, Storage main.webp 존재 등 → 등록 금지. |
| IMAGE_OK | 입력 폴더에 유효 이미지 존재(≥400×300). |
| IMAGE_PENDING | 이미지 미존재 — dry-run 은 계속, apply 는 해당 후보 차단. |
| IMAGE_INVALID | 0바이트/손상/너무 작음 — apply 차단. |

## apply 안전장치 (모두 충족해야 진행)
- `--apply` + `--confirm APPLY_POSTOFFICE_BATCH`
- BLOCKED 0, NEW_READY 1건 이상
- 대상 전부 IMAGE_OK / slug 확정(CLI·batch) / category 확정 / Storage 충돌 0 / DB 중복 0
- 출처: `source_type=guide`(우슐랭/postoffice 신규 enum 금지), trust `source_url=null` + `is_public=true` + `trust_label="부산지방우정청 추천"`, appearances 미생성

## 금지
- DB/Storage write(dry-run), 우체국 PDF 사진, 외부 이미지 다운로드, 사진 자동 생성, 원본 사진 repo stage,
  source_type 에 우슐랭/postoffice, 임의 후보 선정·임의 fuzzy 선택(2개 이상이면 BLOCKED).

## dry-run 검증 결과(이번 작업)
| 시나리오 | 명령 | 결과 |
|---|---|---|
| A 등록된 1차 | `--names "금강 복아구전문점"` | ALREADY_REGISTERED, write 0 |
| B 등록된 2차 | `--names "윤가네산오징어"` | ALREADY_REGISTERED, write 0 |
| C 미등록 READY | `--names "된장한상"` | NEW_READY + slug미확정·category미확정·IMAGE_PENDING(apply 차단), write 0 |
| D 없는 식당 | `--names "없는식당테스트"` | BLOCKED(NOT_FOUND), write 0 |

## 3차 등록 시 대장이 할 일
1. 후보 식당명 선택 (CSV READY 중)
2. 확정 slug 결정 (예: `postoffice-{지역}-{romanize}`) + area/category 결정
3. 사진을 `C:\work\naonzip-thumbnail-input\{slug}.jpg` 로 저장
4. Claude Code 에 dry-run 실행 요청 → NEW_READY/IMAGE_OK 확인
5. dry-run PASS 후 별도 `--apply` 승인 (실제 등록은 검증된 batch 경로)
