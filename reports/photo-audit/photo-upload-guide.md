# 나온집 사진 보강 가이드

## 사용자가 할 일

1. `reports/photo-audit/missing-photo-restaurants.md` 파일에서 사진 없는 식당 목록을 확인한다.
   (공개 68곳 우선 — 비공개 15곳은 공개 전환 시점에 준비해도 됨)
2. 식당별 대표 사진을 직접 찾는다.
3. 파일명을 **slug 기준**으로 변경한다.
4. 아래 폴더를 만든다.

```
C:\work\naonzip\local-assets\restaurant-thumbnails
```

5. 변경한 이미지 파일을 이 폴더에 넣는다.

## 파일명 규칙

- 파일명은 반드시 slug 기준으로 한다. (목록의 "추천 파일명" 열 그대로)
- 기본 권장 형식은 jpg다.
- 예: `tzuyang-haeundae-chopilsal.jpg`

## 허용 확장자

- jpg
- jpeg
- png
- webp

## 사진 출처 원칙 (저작권 안전)

- 운영자 직접 촬영 사진
- 명시적으로 재사용 가능한 공개 라이선스 이미지
- 직접 생성한 비실사 placeholder 이미지
- **금지**: 블로그·지도리뷰·인스타·캐치테이블·네이버 등 외부 이미지 무단 다운로드/재호스팅

## 권장 이미지 사양

- 가로 800px 이상 권장 (기존 업로드 파이프라인이 webp로 변환·검증함)
- 음식/매장 대표 컷 1장이면 충분 (파일당 1식당)

## 주의

- 이번 단계에서는 업로드하지 않는다.
- 이번 단계에서는 DB를 수정하지 않는다.
- 이번 단계에서는 thumbnail(thumbnail_url)을 업데이트하지 않는다.
- 사진 파일을 폴더에 모은 뒤, 다음 단계에서 별도 업로드 스크립트를 실행한다.

## 다음 단계 예고

사용자가 사진 파일을 `C:\work\naonzip\local-assets\restaurant-thumbnails` 폴더에 넣은 뒤,
다음 작업에서 이미지 업로드 및 thumbnail 반영 스크립트를 별도로 실행한다.

> 참고: 기존 보강 스크립트 `scripts/upsert-restaurant-thumbnails.mjs`(입력폴더 기반,
> dry-run→--apply, 업로드 후 download 검증, 교체 시 `?v=` 캐시버스트)를 다음 단계에서
> 새 입력 폴더 경로에 맞춰 재사용/조정할 예정이다.
