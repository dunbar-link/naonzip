# 공개 식당 trust_source 0개 — 백필 preflight (2026-06, read-only)

- 생성: scripts/preflight-trust-source-backfill.mjs (DB SELECT 만, 수정 0)
- 공개 식당 139 / trust 0개 대상 **78**
- CSV: reports/trust-source-backfill/trust-source-missing-preflight-2026-06.csv

### 상태 분류(status)

- READY: 71
- REVIEW: 7

### 우선순위(priority)

- P1: 47
- P2: 31

### 출처 타입(source_type)

- tv: 53
- youtube: 25

### 1차 백필 후보 (P1/P2 · READY · 상위 20)

- `2tv-bupyeong-kkang-dwaehu` 깡돼후 (남포동/고기) | P1 | kind=tv name=2TV 생생정보 / 요즘 시장 24시 - 부산 부평깡통시장 돼지갈비 후라이드 / url✓
- `2tv-gumjeong-geumjukheon` 금죽헌 금정산성점 (기타/한식) | P1 | kind=tv name=2TV 생생정보 / 맛집 맞수다 - 가족 외식 메뉴 최강자는? 소불고기전골 / url✓
- `2tv-gwangan-kuromatsu` 구로마쯔 (광안리/일식) | P1 | kind=tv name=2TV 생생정보 / 장PD의 AI 여행기 - 부산 광안리 오션뷰 철판 코스 맛집 / url✓
- `baekban-dongnae-pajeon` 동래할매파전 (동래/한식) | P1 | kind=tv name=백반기행 / 부산 동래 편 — 60년 전통 / url✓
- `baekban-haeundae-yangs-yanggopchang` 양가네 양곱창 (해운대/고기) | P1 | kind=tv name=식객 허영만의 백반기행 / 찐 부산인 정우가 알려주는 부산사투리 (145회) / url✗
- `baekban-namgu-chossijib` 궁중해물탕 조씨집 대연본점 (남구/해산물) | P1 | kind=tv name=식객 허영만의 백반기행 / url✓
- `baekban-nampo-18-wandang` 18번완당집 (남포동/한식) | P1 | kind=tv name=식객 허영만의 백반기행 / url✓
- `baekban-nampo-subok-centa` 수복센타 (남포동/한식) | P1 | kind=tv name=식객 허영만의 백반기행 / 4회 단디 차린 부산밥상 / url✓
- `baekban-seogu-yetnal-guksujip` 옛날국수집 (기타/분식/길거리) | P1 | kind=tv name=식객 허영만의 백반기행 / 242회 호탕하다 부산밥상 / url✓
- `baekban-seomyeon-marathon-jib` 마라톤집 (서면/한식) | P1 | kind=tv name=식객 허영만의 백반기행 / url✓
- `baekban-seomyeon-masan-sikdang` 마산식당 (서면/돼지국밥) | P1 | kind=tv name=식객 허영만의 백반기행 / 맑게 우려낸 국물 깊은 맛의 돼지국밥 (336회) / url✗
- `baekban-yeongdo-gamasot-doejigukbap` 가마솥돼지국밥 영도점 (영도/돼지국밥) | P1 | kind=tv name=식객 허영만의 백반기행 / url✓
- `baekban-yeongdo-jinju-sikdang` 진주식당 (영도/한식) | P1 | kind=tv name=식객 허영만의 백반기행 / 부산 속살 맛보러 오이소! 진짜배기 부산 밥상 (61회) / url✗
- `baekban-yeongdo-jungri-haenyeochon` 영도 중리해녀촌 (영도/해산물) | P1 | kind=tv name=식객 허영만의 백반기행 / 부산 속살 맛보러 오이소! 진짜배기 부산 밥상 (61회) / url✗
- `baekhwa-yanggopchang-1ho` 백화양곱창 1호 (남포동/한식) | P1 | kind=youtube name=쯔양 / 여기가 제 부산1등 입니다.. 이모님과 손님들 모두가 놀란 양곱창 이모카세 먹방 / url✓
- `ddoganjip-hapcheon-ilryu-dwaeji-gukbap` 합천일류돼지국밥 (사상/돼지국밥) | P1 | kind=youtube name=풍자 또간집 / 또간집 부산 국밥편 / url✓
- `ddoganjip-pungnyeon-gopchang` 풍년곱창 (남구/곱창) | P1 | kind=youtube name=풍자 또간집 / 또간집 부산편 / url✗
- `hibab-cheongsa-hoe-center` 청사포 도희네 조개구이 (해운대/해산물) | P1 | kind=youtube name=히밥 / 부산 회 가성비 끝판왕 / url✓
- `hoeguksu-halmaejip` 회국수할매집 (서면/한식) | P1 | kind=tv name=식객 허영만의 백반기행 / url✓
- `iganae-tteokbokki` 이가네떡볶이 본점 (남포동/분식/길거리) | P1 | kind=tv name=백종원의 3대천왕 / 이가네떡볶이 방송 소개 / url✓

### 분류 기준
- READY: source_type(kind) + program_name||creator_name 으로 trust kind/source_name 확정 가능. trust_title=episode_title, url=video_url(있으면).
- REVIEW: program/creator 미상, source_title 만 → source_name 보강 필요.
- BLOCKED: 출처 힌트 전무.
- EXCLUDED: appearance 없음(LEGACY_MANUAL) → 별도 검토.
- P1: 유명 방송/유튜버(생활의달인·2TV·성시경·풍자·또간집·미친맛집·쯔양·히밥·백반기행 등).
