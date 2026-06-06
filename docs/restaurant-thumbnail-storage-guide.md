# 나온집 대표사진(thumbnail) Supabase Storage 운영 가이드

식당 카드/상세 페이지의 대표메뉴 사진을 **Supabase Storage** 기반으로 운영하기 위한 문서.

- 대상 사용자: 운영자(=프로젝트 오너) 본인
- 이 문서는 **운영 구조/절차 준비**다. 실제 사진 업로드와 DB UPDATE는 별도 승인 후 진행한다.
- 코드 변경 없음. 인터넷 이미지 수집·다운로드 없음.

> 배경(Phase IMG-A 조사 결과)
> - 대표이미지 DB 컬럼: `restaurants.thumbnail` (text, nullable)
> - 앱 타입: `Restaurant.thumbnail`
> - 카드/상세에서 이미 `thumbnail` 렌더 중. 없으면 `RestaurantImage.tsx`가 그라데이션+이모지 fallback.
> - Admin quick-register/edit 폼에 썸네일 입력칸 이미 있음 → **코드 수정 없이 DB 값만 채우면 화면 반영**.
> - 공개 식당 69곳 전부 thumbnail 없음(전부 fallback).
> - 외부 URL hotlink는 권리·안정성 문제로 비권장 → **Supabase Storage public URL 권장**.

---

## 1. 한눈에 보는 흐름

```
(1) Storage bucket 1회 생성  ──▶  (2) 식당 사진 업로드  ──▶  (3) restaurants.thumbnail 값 채우기  ──▶  (4) 화면 확인
   restaurant-thumbnails           restaurants/{slug}/main.webp     Admin edit 또는 SQL              ISR 최대 1시간
```

- 핵심: **thumbnail 컬럼에 public URL 문자열만 들어가면** 카드/상세에 즉시 사진이 뜬다(plain `<img>`).
- URL이 잘못되거나 파일이 아직 없으면 `RestaurantImage`의 `onError`가 작동해 **fallback 이모지**가 뜬다. 즉 깨진 이미지로 보이지 않는다(안전).

---

## 2. Storage bucket 설계

| 항목 | 값 | 이유 |
|---|---|---|
| bucket 이름 | `restaurant-thumbnails` | 용도가 명확하고 다른 자산과 섞이지 않음 |
| 공개 설정 | **Public bucket** (공개 읽기) | 공개 페이지의 `<img>`가 anon 으로 읽어야 함. public URL이 그대로 동작 |
| 쓰기 권한 | Supabase 대시보드 업로드 / `service_role` | 일반 사용자는 업로드 불가. 운영자만 올림 |
| 비고 | 한 bucket으로 전 식당 관리 | 폴더(slug)로 분리하므로 bucket은 1개면 충분 |

> Public bucket이면 누구나 **읽기**만 가능하고, 업로드/삭제는 대시보드(또는 service_role)로만 한다. 공개 이미지 용도에 적합.

---

## 3. 폴더 / 파일 경로 규칙 (최종 채택)

```
restaurant-thumbnails/restaurants/{slug}/main.webp
```

- 예: `restaurant-thumbnails/restaurants/wonjo-gaya-milmyeon/main.webp`

### 왜 이 규칙인가
- **slug 폴더**: 식당 단위로 깔끔하게 묶이고, slug는 한 번 정하면 바뀌지 않으므로 URL이 영구 안정적이다.
- **고정 파일명 `main.webp`**: URL이 결정적(deterministic)이라
  - 사진을 교체할 때 같은 경로에 덮어쓰면 **DB URL을 안 바꿔도** 새 사진이 반영된다(캐시 갱신만 필요).
  - 업로드 전에 미리 `thumbnail` URL을 채워도 됨(파일이 없으면 fallback, 올리는 순간 사진 표시).
- **확장 여지**: 나중에 여러 장이 필요하면 같은 폴더에 `02.webp`, `03.webp` 등을 추가하면 되고, 대표(`main.webp`) URL은 그대로 유지된다.
- `thumbnail.webp` 대신 `main.webp`를 쓰는 이유: bucket 이름(`restaurant-thumbnails`)과 단어가 겹치지 않고 "대표 사진"이라는 의미가 분명함.

---

## 4. 이미지 파일 규칙

- **포맷: webp 우선** (용량 대비 화질이 좋음). jpg도 가능하지만 webp 권장.
- **크기: 가로 800px 내외**. 모바일 카드(썸네일 96px)·상세 상단(약 430px)·레티나까지 800px면 충분. 원본 대용량 금지.
- **용량: 한 장 150KB 내외 목표** (작을수록 로딩 빠름).
- **파일명: 영문 소문자만** (`main.webp`). **한글 파일명 금지**, 공백·특수문자 금지.
- **폴더: slug 기준** (`restaurants/{slug}/`).
- 비율: 카드는 `object-cover`로 잘리므로 정사각형~가로형(4:3, 1:1) 권장. 음식이 가운데 오도록.

---

## 5. public URL 형태

```
https://<PROJECT_REF>.supabase.co/storage/v1/object/public/restaurant-thumbnails/restaurants/{slug}/main.webp
```

- `<PROJECT_REF>`: 본인 Supabase 프로젝트 참조값. **Supabase 대시보드 → Project Settings → API → Project URL**(`https://<PROJECT_REF>.supabase.co`)의 서브도메인이다.
  - 코드에서는 `.env.local`의 `NEXT_PUBLIC_SUPABASE_URL` 호스트와 동일하다. (이 문서/SQL에는 실제 값을 적지 말고 placeholder로 둔다.)
- 예(피넛빵앗간):
  `https://<PROJECT_REF>.supabase.co/storage/v1/object/public/restaurant-thumbnails/restaurants/saengdal-sasang-peanut-bbangatgan/main.webp`

---

## 6. bucket 만들기 (Supabase 대시보드, 1회)

1. Supabase 대시보드 → **Storage** → **New bucket**
2. Name: `restaurant-thumbnails`
3. **Public bucket** 체크(공개 읽기 허용) → Create
4. (선택) 업로드 정책은 기본값 유지. 업로드는 대시보드에서 운영자가 직접 한다.

> Public bucket으로 만들면 별도 RLS 정책 없이 public URL 읽기가 동작한다. 비공개로 만들 경우 `storage.objects`에 SELECT 정책을 추가해야 하므로, 공개 이미지 용도에서는 Public bucket이 단순하고 안전하다.

---

## 7. 사진 업로드 절차

1. 권리상 안전한 사진을 준비한다(아래 9장 참고).
2. 위 4장 규칙대로 `main.webp`로 변환/리사이즈한다.
3. Storage → `restaurant-thumbnails` → 폴더 경로 `restaurants/{slug}/`를 만들고 `main.webp` 업로드.
4. 업로드한 파일의 **Copy URL**로 public URL을 확인한다(위 5장 형태와 일치해야 함).
5. 사진 교체 시: 같은 경로에 덮어쓰기. CDN 캐시 때문에 잠깐 이전 이미지가 보일 수 있으니, 필요하면 파일명을 `main-v2.webp`로 올리고 DB URL을 갱신한다.

---

## 8. thumbnail DB 업데이트 절차 (둘 중 택1)

### 방법 A — Admin 수정 화면 (코드·SQL 없이, 1건씩)
1. `/admin/restaurants` → 대상 식당 → **수정(edit)**
2. **썸네일 (thumbnail)** 칸에 public URL 붙여넣기 → **수정 저장**
3. 공개 페이지에서 확인(ISR로 최대 1시간 지연 가능, 즉시 보려면 Vercel Redeploy)
- 소량(몇 곳)일 때 가장 간단. 코드/SQL 불필요.

### 방법 B — SQL 일괄 업데이트 (여러 곳 한 번에)
1. `scripts/restaurant-thumbnail-update-template.sql`을 연다.
2. `<PROJECT_REF>`를 본인 프로젝트 참조값으로 **전체 치환**한다.
3. 사진을 **업로드한 식당의 줄만** 남기고(또는 주석 해제) Supabase **SQL Editor**에서 실행한다.
4. 업로드 안 한 식당의 UPDATE는 실행하지 않는다(404 URL이 들어가면 fallback만 뜨고 의미 없음).

> 어느 방법이든 결과는 동일하게 `restaurants.thumbnail`에 URL 문자열이 저장되는 것이다.

---

## 9. 누락 현황 확인 (기존 스크립트 재사용 — 새 스크립트 불필요)

이미 있는 읽기 전용 audit 스크립트로 thumbnail 누락 수를 확인한다.

```
node scripts/audit-restaurant-data-quality.mjs
```
- 출력/리포트의 `no_thumbnail` 값이 현재 누락 식당 수다(현재 전체 84, 공개 69 전부 누락).
- 리포트: `reports/restaurant-data-quality-audit.md` / `.json`

직접 SQL로도 확인 가능(Supabase SQL Editor, 읽기 전용):
```
-- 공개 식당 중 thumbnail 없는 목록
SELECT slug, name
FROM restaurants
WHERE is_published = true
  AND (thumbnail IS NULL OR btrim(thumbnail) = '')
ORDER BY slug;

-- 누락 개수만
SELECT count(*) FROM restaurants
WHERE is_published = true AND (thumbnail IS NULL OR btrim(thumbnail) = '');
```

---

## 10. 우선 보강 대상 15곳 (Phase IMG-A 우선순위)

slug는 운영 DB 스냅샷 리포트(`reports/`)에서 확인한 실제 값이다. (현재 전부 thumbnail 없음 = fallback)

| 순서 | 식당명 | slug | 경로 |
|---|---|---|---|
| 1 | 원조가야밀면 | `wonjo-gaya-milmyeon` | restaurants/wonjo-gaya-milmyeon/main.webp |
| 2 | 스시바시쿠 | `saengdal-suyeong-sushibashiku` | restaurants/saengdal-suyeong-sushibashiku/main.webp |
| 3 | 피넛빵앗간 | `saengdal-sasang-peanut-bbangatgan` | restaurants/saengdal-sasang-peanut-bbangatgan/main.webp |
| 4 | 마산식당 | `baekban-seomyeon-masan-sikdang` | restaurants/baekban-seomyeon-masan-sikdang/main.webp |
| 5 | 가마솥돼지국밥 영도점 | `baekban-yeongdo-gamasot-doejigukbap` | restaurants/baekban-yeongdo-gamasot-doejigukbap/main.webp |
| 6 | 궁중해물탕 조씨집 대연본점 | `baekban-namgu-chossijib` | restaurants/baekban-namgu-chossijib/main.webp |
| 7 | 5번 친구해녀할매집 | `jeonhyun-gijang-haenyeo-halmaejib` | restaurants/jeonhyun-gijang-haenyeo-halmaejib/main.webp |
| 8 | 해운대원조할매국밥 | `samdae-haeundae-wonjo-halmae-gukbap` | restaurants/samdae-haeundae-wonjo-halmae-gukbap/main.webp |
| 9 | 내호냉면 | `naeho-naengmyeon` | restaurants/naeho-naengmyeon/main.webp |
| 10 | 송정3대국밥 | `matnyuk-seomyeon-songjeong-3dae-gukbap` | restaurants/matnyuk-seomyeon-songjeong-3dae-gukbap/main.webp |
| 11 | 신발원 | `samdaecheonwang-shinbalwon` | restaurants/samdaecheonwang-shinbalwon/main.webp |
| 12 | 18번완당집 | `baekban-nampo-18-wandang` | restaurants/baekban-nampo-18-wandang/main.webp |
| 13 | 동래할매파전 | `baekban-dongnae-pajeon` | restaurants/baekban-dongnae-pajeon/main.webp |
| 14 | 중앙곰탕 | `sungsik-nampodong-jungang-gomtang` | restaurants/sungsik-nampodong-jungang-gomtang/main.webp |
| 15 | 김유순대구뽈찜전문점 | `kimyusun-daegu-bbol-jjim` | restaurants/kimyusun-daegu-bbol-jjim/main.webp |

---

## 11. 저작권 / 운영 주의사항 (필수)

- **네이버 블로그·카카오맵·인스타그램·유튜브 캡처 이미지를 무단 복사하지 않는다.**
- **외부 URL hotlink는 운영 기본 방식으로 쓰지 않는다**(링크 깨짐 + 권리 문제). Storage에 직접 올린 사진만 사용한다.
- **직접 촬영 사진** 또는 **식당이 공식 제공/사용 허락한 사진**을 우선한다.
- **권리 확인이 어려운 식당은 fallback(그라데이션+이모지)을 그대로 유지**한다. 억지로 채우지 않는다.
- 처음에는 **상위 10~20곳만** 보강한다. 무리하게 전 식당을 한 번에 채우지 않는다.

---

## 12. 운영 체크리스트

- [ ] `restaurant-thumbnails` Public bucket을 만들었다.
- [ ] 사진의 권리(촬영/허락)를 확인했다.
- [ ] `main.webp`(webp, ~800px, 영문 파일명)로 변환했다.
- [ ] `restaurants/{slug}/main.webp` 경로로 업로드했다.
- [ ] public URL이 5장 형태와 일치한다.
- [ ] `thumbnail`을 Admin edit 또는 SQL로 갱신했다(업로드한 식당만).
- [ ] 공개 페이지에서 카드/상세 사진을 확인했다(필요 시 Vercel Redeploy).
- [ ] 미보강 식당은 fallback이 정상으로 보인다.

---

## 13. 주의

- 이 문서 단계에서는 **bucket 생성·사진 업로드·DB UPDATE를 실행하지 않는다.** 실제 적용은 별도 승인 후 진행한다.
- SQL 템플릿(`scripts/restaurant-thumbnail-update-template.sql`)은 **그대로 실행하지 말고** `<PROJECT_REF>` 치환 + 업로드 완료 식당만 실행한다.

---

## 14. 일괄 업로드 스크립트 (자동화) — `scripts/upload-restaurant-thumbnails.mjs`

8장의 "업로드 → DB 갱신"을 식당별 수작업 대신 한 번에 처리한다. (방법 A/B의 자동화 버전)

### 준비
1. 로컬에 입력 폴더를 만든다(기본 경로): `C:\work\naonzip-thumbnail-input`
   - **repo 밖 경로다. 이미지 파일은 repo에 commit 하지 않는다.**
2. 권리상 안전한 사진(직접 촬영/허락)을 **`{slug}.webp`** 이름으로 넣는다.
   - 예: `wonjo-gaya-milmyeon.webp`, `naeho-naengmyeon.webp`
   - **파일명(slug)이 곧 대상 식당**이다. `reports/` 또는 Admin에서 확인한 실제 slug와 정확히 일치해야 한다.
   - 파일 규칙은 4장과 동일(webp, ~800px, ~150KB).
3. `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`가 있어야 한다(쓰기 권한).

### 실행
```
# 검증만(기본, 안전) — 실제 업로드/DB 변경 없음
node scripts/upload-restaurant-thumbnails.mjs

# 다른 입력 폴더로 검증
node scripts/upload-restaurant-thumbnails.mjs C:\work\my-images

# 실제 적용(업로드 + thumbnail UPDATE)
node scripts/upload-restaurant-thumbnails.mjs --apply
```

### 스크립트가 하는 일
1. 입력 폴더의 `.webp` 목록을 읽고 파일명에서 slug 추출
2. `restaurants`에 slug 존재 확인(없으면 skip + 사유 기록)
3. (`--apply` 시) Storage `restaurant-thumbnails/restaurants/{slug}/main.webp`로 **upsert** 업로드(`image/webp`)
4. (`--apply` 시) `restaurants.thumbnail`을 public URL로 UPDATE
5. 입력/성공/실패 수, 성공·실패 목록(+사유), URL 목록 출력

### 안전장치
- **기본은 dry-run**(검증만). `--apply` 없이는 업로드/DB를 변경하지 않는다.
- `.webp`가 아니거나 0바이트이거나 DB에 없는 slug는 **skip**하고 이유를 출력한다.
- `upsert: true`라 같은 식당 재실행 시 사진만 교체된다(경로·URL 동일 → DB 재갱신 불필요).
- **service_role key 등 비밀값은 출력하지 않는다**(존재 여부만 ✓/✗ 표시). public URL은 `NEXT_PUBLIC_SUPABASE_URL`에서 파생한다.

### 권장 순서
1. 먼저 dry-run(기본)으로 slug 매칭·업로드 경로·예정 URL을 확인한다.
2. 이상 없으면 `--apply`로 실제 적용한다.
3. 공개 페이지에서 카드/상세 사진을 확인한다(ISR 최대 1시간, 즉시는 Vercel Redeploy).

