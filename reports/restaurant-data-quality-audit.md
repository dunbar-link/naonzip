# 나온집 데이터 품질 점검 리포트

- 생성시각: 2026. 6. 2. PM 10:17:12 (KST) / 2026-06-02T13:17:12.384Z
- 부산 좌표 범위: lat 34.8~35.5, lng 128.7~129.5
- 읽기 전용 점검. DB 수정 없음. 웹검색·사실검증 미포함(코드 식별 문제 후보만).

## 요약
```text
restaurants: 84
appearances: 87
candidates: 16
published: 69
unpublished: 15
missing_required: 36
no_thumbnail: 84
coordinate_warnings: 0
duplicate_coords: 0
url_warnings: 35
duplicate_slug: 0
duplicate_name: 0
duplicate_norm_name: 0
duplicate_address: 0
duplicate_phone: 0
duplicate_kakao: 0
duplicate_candidates: 0
odd_areas: 1
etc_area_count: 7
appearance_warnings: 32
rep_mismatch: 0
multi_appearance: 3
published_missing: 21
unpublished_but_converted: 0
test_traces: 0
```

## 필수값 누락 (36)
- saengdal-dongnae-gopchang-jungol (동래 곱창전골) [비공개] → kakao_map_url, video_url
- matnyuk-sasang-doejigalbi (시골집명품석갈비) [공개] → video_url
- matnyuk-gwangalli-nakgopsae (광안리 낙곱새) [비공개] → kakao_map_url, video_url
- jeonhyun-jeonpo-vietnam-ssal-guksu (전포 베트남쌀국수) [비공개] → kakao_map_url, video_url
- sungsik-seomyeon-sogeumgui (서면 소금구이 명가) [비공개] → kakao_map_url
- hibab-gwangalli-chamchi-hoe (광안리 참치회) [비공개] → kakao_map_url
- samdae-gijang-myeolchi-ssambap (기장 멸치쌈밥) [비공개] → kakao_map_url, video_url
- baekban-gijang-jeonbok-juk (기장 전복죽) [비공개] → kakao_map_url, video_url
- pani-nampo-ssiat-ppang (남포동 씨앗빵 본점) [비공개] → kakao_map_url
- tzuyang-jagalchi-bibim-dangmyeon (자갈치 비빔당면) [비공개] → kakao_map_url
- tzuyang-haeundae-sujeburger (해운대 수제버거) [비공개] → kakao_map_url
- saengdal-jeonpo-toda-park (토다공원) [공개] → video_url
- saengdal-ssangdungyi-doejigukbap (쌍둥이돼지국밥) [공개] → video_url
- baekban-beomeosa-sanche-bibimbap (범어사 산채비빔밥) [비공개] → kakao_map_url, video_url
- hibab-gwangalli-jogae-gui-pocha (광안리 조개구이 포차) [비공개] → kakao_map_url
- baekban-yeongdo-jinju-sikdang (진주식당) [공개] → video_url
- bapsang-gijang-haebyeon-jipbul-gomjangeo (해변짚불곰장어) [공개] → broadcast_date, video_url
- samdae-haeundae-wonjo-halmae-gukbap (해운대원조할매국밥) [공개] → video_url
- baekban-haeundae-yangs-yanggopchang (양가네 양곱창) [공개] → video_url
- saengsaeng-sasang-jurye-suyuk-kalguksu (주례수육칼국수 2호점) [공개] → video_url
- baekban-seomyeon-masan-sikdang (마산식당) [공개] → video_url
- sungsik-gwangalli-geumson-1983 (금손1983) [공개] → broadcast_date
- saengdal-gwangalli-jin-doejigomtang (진돼지곰탕) [공개] → video_url
- saengdal-suyeong-dongyang-sarada-namcheon (동양사라다 남천본점) [공개] → video_url
- saengdal-suyeong-sushibashiku (스시바시쿠) [공개] → video_url
- saengdal-haeundae-amisan (아미산) [공개] → video_url
- saengdal-sasang-peanut-bbangatgan (피넛빵앗간) [공개] → video_url
- jeonhyun-gijang-haenyeo-halmaejib (5번 친구해녀할매집) [공개] → video_url
- saengbang-gwangalli-sanhae-hoejip (산해횟집) [공개] → video_url
- baekban-yeongdo-jungri-haenyeochon (영도 중리해녀촌) [공개] → video_url
- baekban-yeonje-godeungeo-datchi (고등어다찌 연산본점) [공개] → video_url
- saengdal-namgu-namji-ramyeon (남지라면천국) [비공개] → broadcast_date, kakao_map_url, video_url
- ddoganjip-pungnyeon-gopchang (풍년곱창) [공개] → broadcast_date, video_url
- matnyuk-gijang-daege-jjim (기장 대게찜 본점) [비공개] → kakao_map_url, video_url
- samdae-haeundae-haemul-pajeon (해운대 해물파전) [비공개] → kakao_map_url, video_url
- wonjo-gaya-milmyeon (원조가야밀면) [공개] → video_url

## 좌표 경고 (0)
- 없음

## 동일 좌표 (0)
- 없음

## URL 경고 (35)
- saengdal-dongnae-gopchang-jungol (동래 곱창전골) → kakao_map_url_missing, video_url_missing
- matnyuk-sasang-doejigalbi (시골집명품석갈비) → video_url_missing
- matnyuk-gwangalli-nakgopsae (광안리 낙곱새) → kakao_map_url_missing, video_url_missing
- jeonhyun-jeonpo-vietnam-ssal-guksu (전포 베트남쌀국수) → kakao_map_url_missing, video_url_missing
- sungsik-seomyeon-sogeumgui (서면 소금구이 명가) → kakao_map_url_missing
- hibab-gwangalli-chamchi-hoe (광안리 참치회) → kakao_map_url_missing
- samdae-gijang-myeolchi-ssambap (기장 멸치쌈밥) → kakao_map_url_missing, video_url_missing
- baekban-gijang-jeonbok-juk (기장 전복죽) → kakao_map_url_missing, video_url_missing
- pani-nampo-ssiat-ppang (남포동 씨앗빵 본점) → kakao_map_url_missing
- tzuyang-jagalchi-bibim-dangmyeon (자갈치 비빔당면) → kakao_map_url_missing
- tzuyang-haeundae-sujeburger (해운대 수제버거) → kakao_map_url_missing
- saengdal-jeonpo-toda-park (토다공원) → video_url_missing
- saengdal-ssangdungyi-doejigukbap (쌍둥이돼지국밥) → video_url_missing
- baekban-beomeosa-sanche-bibimbap (범어사 산채비빔밥) → kakao_map_url_missing, video_url_missing
- hibab-gwangalli-jogae-gui-pocha (광안리 조개구이 포차) → kakao_map_url_missing
- baekban-yeongdo-jinju-sikdang (진주식당) → video_url_missing
- bapsang-gijang-haebyeon-jipbul-gomjangeo (해변짚불곰장어) → video_url_missing
- samdae-haeundae-wonjo-halmae-gukbap (해운대원조할매국밥) → video_url_missing
- baekban-haeundae-yangs-yanggopchang (양가네 양곱창) → video_url_missing
- saengsaeng-sasang-jurye-suyuk-kalguksu (주례수육칼국수 2호점) → video_url_missing
- baekban-seomyeon-masan-sikdang (마산식당) → video_url_missing
- saengdal-gwangalli-jin-doejigomtang (진돼지곰탕) → video_url_missing
- saengdal-suyeong-dongyang-sarada-namcheon (동양사라다 남천본점) → video_url_missing
- saengdal-suyeong-sushibashiku (스시바시쿠) → video_url_missing
- saengdal-haeundae-amisan (아미산) → video_url_missing
- saengdal-sasang-peanut-bbangatgan (피넛빵앗간) → video_url_missing
- jeonhyun-gijang-haenyeo-halmaejib (5번 친구해녀할매집) → video_url_missing
- saengbang-gwangalli-sanhae-hoejip (산해횟집) → video_url_missing
- baekban-yeongdo-jungri-haenyeochon (영도 중리해녀촌) → video_url_missing
- baekban-yeonje-godeungeo-datchi (고등어다찌 연산본점) → video_url_missing
- saengdal-namgu-namji-ramyeon (남지라면천국) → kakao_map_url_missing, video_url_missing
- ddoganjip-pungnyeon-gopchang (풍년곱창) → video_url_missing
- matnyuk-gijang-daege-jjim (기장 대게찜 본점) → kakao_map_url_missing, video_url_missing
- samdae-haeundae-haemul-pajeon (해운대 해물파전) → kakao_map_url_missing, video_url_missing
- wonjo-gaya-milmyeon (원조가야밀면) → video_url_missing

## 중복 가능성
### slug 중복 (0)
- 없음

### name 완전 동일 (0)
- 없음

### name 유사(공백/대소문자 무시) (0)
- 없음

### address 완전 동일 (0)
- 없음

### address 유사 (0)
- 없음

### 전화번호 동일 (0)
- 없음

### 카카오맵 URL 동일 (0)
- 없음

### candidate restaurant_name 중복(미변환) (0)
- 없음

## area 집계
- 서면: 13
- 해운대: 11
- 광안리: 11
- 남포동: 11
- 기장: 8
- 기타: 7
- 남구: 7
- 영도: 5
- 사상: 4
- 동래: 3
- 연제: 3
- 북구: 1

## category 집계
- 한식: 23
- 해산물: 11
- 돼지국밥: 10
- 고기: 7
- 베이커리/디저트: 7
- 분식/길거리: 6
- 밀면: 5
- 회: 4
- 일식: 3
- 아시안: 2
- 중식: 2
- 버거/양식: 1
- 분식: 1
- 라면: 1
- 곱창: 1

## 이상 area 후보 (1)
- 북구: 1

## appearance 경고 (32)
- restaurant_id=285d3c9e-7319-4378-92e5-c45ecc2a482e (한국인의 밥상) → episode_title_missing, broadcast_date_missing, video_url_missing
- restaurant_id=99e9aaf9-23df-4a5b-8ad2-a209bbab23d0 (생활의달인) → video_url_missing
- restaurant_id=86eedb54-793c-4ff4-98fd-468b89cc81bd (생활의달인) → video_url_missing
- restaurant_id=37e8fa0a-be8e-4886-852d-9e982e16cae2 (생방송투데이 2221회) → episode_title_missing, video_url_missing
- restaurant_id=2cb55410-d8ca-4bc1-a2b7-d2aacfaa4fe1 (백반기행) → video_url_missing
- restaurant_id=4f4203b7-ae0e-481b-b93a-c9ba0317c803 (풍자 또간집) → broadcast_date_missing, video_url_missing
- restaurant_id=e76f9e91-8352-4e49-9d8c-382e9f5d9605 (맛있는녀석들) → video_url_missing
- restaurant_id=df042825-7247-47be-860e-9fb2af554903 (식객 허영만의 백반기행) → video_url_missing
- restaurant_id=5dc190c3-aa4c-4a5e-ae50-f829653a6fa4 (생활의달인) → video_url_missing
- restaurant_id=0106a35c-6674-4c09-9963-4fb131f7449f (삼대천왕) → video_url_missing
- restaurant_id=fdb05ce6-5755-4b40-88ee-ea206ef596ee (백반기행) → video_url_missing
- restaurant_id=db028631-6eae-4cf9-b497-80c897d612da (생활의달인) → video_url_missing
- restaurant_id=a2dbb9ed-7fe6-43ad-828c-c6d46278b09f (생활의달인) → video_url_missing
- restaurant_id=cc75a2f8-52cd-4c3b-a34d-7fac494e8a0b (식객 허영만의 백반기행) → video_url_missing
- restaurant_id=2b3ba8cc-c936-4389-aae4-7329501d75f0 (생활의달인) → video_url_missing
- restaurant_id=83060508-2554-49cf-bff0-2c7217a55561 (맛있는녀석들) → video_url_missing
- restaurant_id=02114234-4586-4813-bac8-7e1697f492f2 (백반기행) → video_url_missing
- restaurant_id=b2db448e-57c1-455a-ad64-e5949c05df74 (2TV 생생정보) → video_url_missing
- restaurant_id=f8560a38-de47-4618-b687-6ccfbb4bded0 (성시경의 먹을텐데) → broadcast_date_missing
- restaurant_id=a84edf85-7e49-4822-851c-1a3d0fb9003e (생활의달인) → broadcast_date_missing, video_url_missing
- restaurant_id=4af7b487-eaf1-45b4-8511-27e6089fd604 (맛있는녀석들) → video_url_missing
- restaurant_id=62026b24-c99e-4dba-a023-2540c3226258 (성시경의 먹을텐데) → episode_title_missing
- restaurant_id=aed96196-233c-456b-89a9-cb15482dd9cc (백종원의 3대 천왕) → episode_title_missing, video_url_missing
- restaurant_id=78384686-3a01-49c0-b103-15a33b169149 (식객 허영만의 백반기행) → video_url_missing
- restaurant_id=712dff4f-dd54-4a5b-b25e-f0ec710d204b (전현무계획) → video_url_missing
- restaurant_id=dddc9249-aee2-480a-ad9b-2b7871f3071e (생활의달인) → video_url_missing
- restaurant_id=98f115ea-7870-43fc-a152-ef0a8e910ff8 (식객 허영만의 백반기행) → video_url_missing
- restaurant_id=d46a5c10-f620-40d0-a602-e49aacbc5999 (삼대천왕) → video_url_missing
- restaurant_id=cd695bb9-fb12-4824-b6c7-de5dcc0de631 (식객 허영만의 백반기행) → video_url_missing
- restaurant_id=403d0165-46c6-489a-aca7-0ddb863f8419 (전현무계획3) → video_url_missing
- restaurant_id=574a0e06-0835-4496-a809-9a80388070b3 (SBS 생활의 달인) → video_url_missing
- restaurant_id=67053b94-6d0f-4bf8-ba48-70dbbd44bd9b (SBS 생활의 달인) → video_url_missing

## 대표/appearance 출처 불일치 (0)
- 없음

## appearance 2개 이상 (3)
- kimyusun-daegu-bbol-jjim (김유순대구뽈찜전문점) ×2
- baekban-dongnae-pajeon (동래할매파전) ×2
- sungsik-nampodong-jungang-gomtang (중앙곰탕) ×2

## 공개 식당 필수값 누락 (21)
- matnyuk-sasang-doejigalbi
- saengdal-jeonpo-toda-park
- saengdal-ssangdungyi-doejigukbap
- baekban-yeongdo-jinju-sikdang
- bapsang-gijang-haebyeon-jipbul-gomjangeo
- samdae-haeundae-wonjo-halmae-gukbap
- baekban-haeundae-yangs-yanggopchang
- saengsaeng-sasang-jurye-suyuk-kalguksu
- baekban-seomyeon-masan-sikdang
- sungsik-gwangalli-geumson-1983
- saengdal-gwangalli-jin-doejigomtang
- saengdal-suyeong-dongyang-sarada-namcheon
- saengdal-suyeong-sushibashiku
- saengdal-haeundae-amisan
- saengdal-sasang-peanut-bbangatgan
- jeonhyun-gijang-haenyeo-halmaejib
- saengbang-gwangalli-sanhae-hoejip
- baekban-yeongdo-jungri-haenyeochon
- baekban-yeonje-godeungeo-datchi
- ddoganjip-pungnyeon-gopchang
- wonjo-gaya-milmyeon

## 비공개인데 converted (0)
- 없음

## 테스트 흔적 후보 (0)
- 없음
