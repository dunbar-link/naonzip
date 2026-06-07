# 나온집 운영자 사진 업로드 자동화 점검 (Phase OPS-G1 · B)

> 생성일: 2026-06-07 · read-only 점검. **이번 Phase는 업로드/변환/덮어쓰기 안 함.** 개선점만 보고.

## 1. 현재 입력 폴더 상태

경로: `C:\work\naonzip-thumbnail-input`

- .webp 22개, 운영자 원본 .jpg 3개(2tv-gumjeong-geumjukheon / live-today-donggu-halme-gimbap / live-today-suyeong-geumsin-jeonseon-sangyusibi), 안내 txt 1개.
- .webp 22개 대부분은 **이미 업로드 완료된 잔여 파일**(기존 13곳 + 다리집 + 홈 상위 5개 + 김미다멸 일러스트 잔여 등).
- 파일명은 모두 `{slug}.webp` 형식으로 slug와 정확히 매칭됨(불일치 없음).

## 2. 기존 bulk script 동작 (scripts/upload-restaurant-thumbnails.mjs)

- 폴더 최상위 `.webp`만 처리(하위폴더·jpg 무시), `{slug}.webp` → `restaurants/{slug}/main.webp` 업로드 + `restaurants.thumbnail` UPDATE.
- 기본 dry-run, `--apply`로 실제 반영. 입력 폴더는 positional 인자로 교체 가능(범위 격리 가능).
- **이미 thumbnail 있는 row를 skip하지 않음** → 기본 폴더로 `--apply` 시 폴더 내 22개 전부 재처리(대부분 동일 내용 재업로드 = 불필요하지만 무해).

## 3. 핵심 문제: upsert가 기존 객체를 안 덮어씀

- IMG-F4에서 확인: 기존 `main.webp`가 있는 slug에 대해 `storage.upload(path, buf, {upsert:true})`가 **"성공" 보고에도 실제 객체를 교체하지 못한 사례** 발생(상유십이·할매김밥). 신규 생성(객체 없음)은 정상.
- 회피책으로 `storage.from(bucket).update(path, buf, {upsert:true})` 사용 시 정상 교체됐고, **`storage.download()`로 실제 저장 바이트를 검증**해야 확신 가능(공개 URL 크기는 CDN 캐시로 신뢰 불가).
- 또한 같은 경로 교체 시 **모바일 브라우저 캐시** 문제 → DB thumbnail URL에 `?v=` version query 추가로 무효화(IMG-F6에서 처리).

## 4. 필요한 개선 (다음 Phase 후보)

1. **교체 전용 스크립트**(또는 기존 스크립트 개선): 기존 객체가 있으면 `update()` 사용 + 업로드 후 `download()`로 바이트 검증 + 실패 시 명확히 보고.
2. **자동 cache-bust**: 교체 시 DB thumbnail URL에 `?v=<배포태그>` 자동 부여 옵션.
3. **범위 안전장치**: `--only <slug,slug>` 또는 전용 폴더 권장(기본 폴더 잔여 재처리 방지). 또는 업로드 후 입력 폴더 정리 가이드.
4. **신규 vs 교체 구분 로깅**: 객체 존재 여부에 따라 create/replace를 구분 출력.
5. **운영 흐름 문서화**: 운영자는 `{slug}.jpg/.png/.webp`를 폴더에 넣음 → 변환·검증·업로드·cache-bust를 한 번에.

> 주의: 위는 모두 *스크립트* 영역(앱 코드 아님). 앱 코드/스키마 변경 없이 가능.

## 5. 다음 Phase 권장

- **OPS-G2(가칭) "썸네일 교체 파이프라인 정비"**: 교체 안전 스크립트(update()+download검증+cache-bust) 1개 작성 → 운영자가 사진만 넣으면 신규/교체 자동 처리. (이번 OPS-G1은 설계까지, 실제 스크립트 작성/실행은 다음 Phase)
