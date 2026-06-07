# 나온집 IMG-G6 — 신규 공개 상단 4곳 썸네일 보강

> 생성일: 2026-06-07 · DATA-G5에서 공개 전환된 신규 13곳 중 방영일 상단 4곳에 운영자 실사진 적용.
> 사용 스크립트: `scripts/upsert-restaurant-thumbnails.mjs`(OPS-G2, dry-run→apply). 입력 폴더: `C:\work\naonzip-thumbnail-input`(repo 밖).
> 앱/스키마/공개상태 무변경. 허용 범위(대상 4곳 Storage 업로드 + restaurants.thumbnail 갱신)만 수행.

## 요약

- 대상: 4곳 (영희할매재첩국·마포본가·백일평냉·담미옥)
- 입력 사진: 4/4 존재(전부 .jpg, 운영자 제공)
- preflight: 4곳 모두 존재·is_published=true·기존 thumbnail 없음·이미지 정상 → dry_run_planned_new 4
- 업로드 성공: **uploaded_new 4/4**
- skip/실패: 0
- Storage: restaurants/{slug}/main.webp 4건 신규 업로드(webp, download 바이트 검증 통과)
- DB: restaurants.thumbnail 4건 갱신(신규라 cache-bust 없음, 영향 행 각 1)
- 공개 식당 수: 91 유지 / 전체 107 유지
- Storage public URL: 4곳 전부 200 image/webp
- 목록 카드: 대상 4곳 실사진 반영(목록 그리드에서 fallback 4건 감소)
- 김미다멸: 비공개·404 유지

## 대상별 처리 결과

| slug | 식당명 | input_file | 크기 | before | after(thumbnail) | status | public_url | 사진 내용 |
|---|---|---|---|---|---|---|---|---|
| 2tv-sasang-yeonghui-halmae-jaecheopguk | 영희할매재첩국 | .jpg | 962x646 | (없음) | …/2tv-sasang-yeonghui-halmae-jaecheopguk/main.webp | uploaded_new | 200 image/webp | 재첩국 한상(밥·재첩국·반찬) |
| ansungjae-yeonje-mapobonga | 마포본가 | .jpg | 988x658 | (없음) | …/ansungjae-yeonje-mapobonga/main.webp | uploaded_new | 200 image/webp | 돼지갈비 불판 구이 |
| saengdal-gwangalli-baegil-pyeongnaeng | 백일평냉 | .jpg | 900x1200 | (없음) | …/saengdal-gwangalli-baegil-pyeongnaeng/main.webp | uploaded_new | 200 image/webp | 평양냉면 1그릇 |
| saengdal-seomyeon-dammiok | 담미옥 | .jpg | 1160x826 | (없음) | …/saengdal-seomyeon-dammiok/main.webp | uploaded_new | 200 image/webp | 평양냉면·수육 한상(담미옥 자체 그릇) |

## 이미지 검증(시각 확인)

- 4장 모두 음식/매장 사진, 카테고리 일치(재첩국/돼지갈비/평양냉면/평양냉면).
- 사람 얼굴 중심 아님, 외부 워터마크 없음(담미옥은 식당 자체 그릇 브랜딩으로 문제 아님).
- 크기 정상(최소 400x300 초과). 긴 변 ≤1200 webp 변환(q85). 백일평냉만 세로(900x1200).
- 운영자 제공 이미지이므로 저작권 자동판단은 하지 않음(정책).

## 검증

- Storage public URL: 4/4 → 200 image/webp (101~125KB)
- 대상 상세 URL: 4/4 → 200
- 목록 수: 91 유지, 목록 그리드에 대상 4곳 thumbnail URL 4/4 노출(카드 fallback 감소)
- 김미다멸: 404 유지
- npx tsc --noEmit: 에러 0 / npm run build: 성공(정적 223페이지)

## 비고

- 남은 신규 9곳(비와술잔·왔다식당·연합횟집·여송제·물레방아·옛날국수집·수복센타·이재모피자·초필살)은 여전히 thumbnail 없음 → 다음 보강 backlog.
- 홈(/) 상단 hero는 큐레이션 유지. 이번 4곳은 목록/검색/지도 카드 및 상세에서 실사진 노출.
