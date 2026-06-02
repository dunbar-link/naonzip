# 나온집 데이터 품질 점검 리포트

- 생성시각: 2026. 6. 2. PM 6:46:08 (KST) / 2026-06-02T09:46:08.034Z
- 부산 좌표 범위: lat 34.8~35.5, lng 128.7~129.5
- 읽기 전용 점검. DB 수정 없음. 웹검색·사실검증 미포함(코드 식별 문제 후보만).

## 요약
```text
restaurants: 86
appearances: 88
candidates: 16
published: 70
unpublished: 16
missing_required: 70
no_thumbnail: 86
coordinate_warnings: 0
duplicate_coords: 0
url_warnings: 68
duplicate_slug: 0
duplicate_name: 2
duplicate_norm_name: 0
duplicate_address: 1
duplicate_phone: 0
duplicate_kakao: 0
duplicate_candidates: 0
odd_areas: 0
etc_area_count: 9
appearance_warnings: 65
rep_mismatch: 0
multi_appearance: 2
published_missing: 54
unpublished_but_converted: 0
test_traces: 0
```

## 필수값 누락 (70)
- saengdal-dongnae-gopchang-jungol (동래 곱창전골) [비공개] → kakao_map_url, video_url
- matnyuk-sasang-doejigalbi (시골집명품석갈비) [공개] → video_url
- baekban-dongnae-pajeon (동래할매파전) [공개] → video_url
- matnyuk-gwangalli-nakgopsae (광안리 낙곱새) [비공개] → kakao_map_url, video_url
- jeonhyun-jeonpo-vietnam-ssal-guksu (전포 베트남쌀국수) [비공개] → kakao_map_url, video_url
- sungsik-seomyeon-sogeumgui (서면 소금구이 명가) [비공개] → kakao_map_url
- hibab-gwangalli-chamchi-hoe (광안리 참치회) [비공개] → kakao_map_url
- samdae-gijang-myeolchi-ssambap (기장 멸치쌈밥) [비공개] → kakao_map_url, video_url
- baekban-gijang-jeonbok-juk (기장 전복죽) [비공개] → kakao_map_url, video_url
- pani-nampo-ssiat-ppang (남포동 씨앗빵 본점) [비공개] → kakao_map_url
- tzuyang-jagalchi-bibim-dangmyeon (자갈치 비빔당면) [비공개] → kakao_map_url
- tzuyang-haeundae-sujeburger (해운대 수제버거) [비공개] → kakao_map_url
- saengdal-ssangdungyi-doejigukbap (쌍둥이돼지국밥) [공개] → video_url
- iganae-tteokbokki (이가네떡볶이 본점) [공개] → broadcast_date, video_url
- baekban-beomeosa-sanche-bibimbap (범어사 산채비빔밥) [비공개] → kakao_map_url, video_url
- hibab-gwangalli-jogae-gui-pocha (광안리 조개구이 포차) [비공개] → kakao_map_url
- subyeon-choego-doejigukbap-minrak (수변최고돼지국밥 민락본점) [공개] → broadcast_date, video_url
- sokssiwonhan-daegutang-haeundae (속씨원한 대구탕 해운대 본점) [공개] → broadcast_date, video_url
- mulkkong-sikdang (물꽁식당) [공개] → broadcast_date, video_url
- hoeguksu-halmaejip (회국수할매집) [공개] → broadcast_date, video_url
- baekban-nampo-18-wandang (18번완당집) [공개] → broadcast_date, video_url
- baekban-yeongdo-jinju-sikdang (진주식당) [공개] → video_url
- bapsang-gijang-haebyeon-jipbul-gomjangeo (해변짚불곰장어) [공개] → broadcast_date, video_url
- samdae-haeundae-wonjo-halmae-gukbap (해운대원조할매국밥) [공개] → video_url
- baekban-haeundae-yangs-yanggopchang (양가네 양곱창) [공개] → video_url
- baekban-seomyeon-marathon-jib (마라톤집) [공개] → broadcast_date, video_url
- saengsaeng-sasang-jurye-suyuk-kalguksu (주례수육칼국수 2호점) [공개] → video_url
- saengdal-saha-cheramie (쉐라미과자점) [공개] → broadcast_date, video_url
- saengdal-geumjeong-songs-bakery (송스 베이커리) [공개] → broadcast_date, video_url
- saengsaeng-dongnae-halmae-pajeon (동래할매파전) [공개] → broadcast_date, video_url
- pungja-nampo-milyangjib (밀양집) [공개] → broadcast_date, video_url
- baekban-seomyeon-masan-sikdang (마산식당) [공개] → video_url
- matnyuk-seomyeon-songjeong-3dae-gukbap (송정3대국밥) [공개] → broadcast_date, video_url
- samdae-seomyeon-gijang-son-kalguksu (기장손칼국수) [공개] → broadcast_date, video_url
- sungsik-gwangalli-jinmi-eonyang-bulgogi (진미언양불고기) [공개] → broadcast_date
- sungsik-gwangalli-geumson-1983 (금손1983) [공개] → broadcast_date
- saengdal-gijang-ilgwangdang (일광당) [공개] → broadcast_date, video_url
- saengdal-gijang-jeil-bunsik (제일분식) [공개] → broadcast_date, video_url
- saengdal-bukgu-shunsaikubo (슌사이쿠보 화명) [공개] → video_url
- samdae-donggu-shinbalwon (신발원) [비공개] → broadcast_date, kakao_map_url, video_url
- samdae-seomyeon-wonjo-halmae-nakji (원조할매낙지) [공개] → broadcast_date, video_url
- saengdal-gwangalli-jin-doejigomtang (진돼지곰탕) [공개] → video_url
- saengdal-suyeong-dongyang-sarada-namcheon (동양사라다 남천본점) [공개] → video_url
- saengdal-suyeong-sushibashiku (스시바시쿠) [공개] → video_url
- tzuyang-haeundae-ppalgan-tteokbokki (빨간떡볶이) [공개] → broadcast_date, video_url
- saengdal-haeundae-missaem-ssalbbang (미쌤쌀빵) [공개] → broadcast_date, video_url
- saengdal-haeundae-amisan (아미산) [공개] → video_url
- saengdal-sasang-peanut-bbangatgan (피넛빵앗간) [공개] → video_url
- jeonhyun-gijang-haenyeo-halmaejib (5번 친구해녀할매집) [공개] → video_url
- naeho-naengmyeon (내호냉면) [공개] → broadcast_date, video_url
- tzuyang-yeonje-yeonji-yanggopchang (연지가양곱창) [공개] → broadcast_date, video_url
- samdaecheonwang-shinbalwon (신발원) [공개] → broadcast_date, video_url
- saengbang-gwangalli-sanhae-hoejip (산해횟집) [공개] → video_url
- baekban-yeongdo-gamasot-doejigukbap (가마솥돼지국밥 영도점) [공개] → broadcast_date, video_url
- baekban-yeongdo-jungri-haenyeochon (영도 중리해녀촌) [공개] → video_url
- saengdal-yeonje-gukje-milmyeon (국제밀면 본점) [공개] → video_url
- baekban-yeonje-godeungeo-datchi (고등어다찌 연산본점) [공개] → video_url
- baekban-namgu-chossijib (궁중해물탕 조씨집 대연본점) [공개] → broadcast_date, video_url
- saengdal-namgu-daeyeon-milmyeon (대연밀면) [공개] → video_url
- pungja-namgu-hapcheon-gukbap (합천국밥집) [공개] → broadcast_date, video_url
- saengdal-namgu-namji-ramyeon (남지라면천국) [비공개] → broadcast_date, kakao_map_url, video_url
- live-today-samjin-eomuk (삼진어묵 본점) [공개] → broadcast_date, video_url
- ddoganjip-hapcheon-ilryu-dwaeji-gukbap (합천일류돼지국밥) [공개] → broadcast_date, video_url
- ddoganjip-pungnyeon-gopchang (풍년곱창) [공개] → broadcast_date, video_url
- saengdal-yeongdo-sato-bunsik (사또분식) [공개] → broadcast_date, video_url
- matnyuk-gijang-daege-jjim (기장 대게찜 본점) [비공개] → kakao_map_url, video_url
- samdae-haeundae-haemul-pajeon (해운대 해물파전) [비공개] → kakao_map_url, video_url
- hanyakbang-gukbap-hyeongje-food (한약방돼지국밥 형제식품) [공개] → broadcast_date, kakao_map_url
- wonjo-gaya-milmyeon (원조가야밀면) [공개] → video_url
- saengdal-jeonpo-toda-park (토다공원) [공개] → kakao_map_url, video_url

## 좌표 경고 (0)
- 없음

## 동일 좌표 (0)
- 없음

## URL 경고 (68)
- saengdal-dongnae-gopchang-jungol (동래 곱창전골) → kakao_map_url_missing, video_url_missing
- matnyuk-sasang-doejigalbi (시골집명품석갈비) → video_url_missing
- baekban-dongnae-pajeon (동래할매파전) → video_url_missing
- matnyuk-gwangalli-nakgopsae (광안리 낙곱새) → kakao_map_url_missing, video_url_missing
- jeonhyun-jeonpo-vietnam-ssal-guksu (전포 베트남쌀국수) → kakao_map_url_missing, video_url_missing
- sungsik-seomyeon-sogeumgui (서면 소금구이 명가) → kakao_map_url_missing
- hibab-gwangalli-chamchi-hoe (광안리 참치회) → kakao_map_url_missing
- samdae-gijang-myeolchi-ssambap (기장 멸치쌈밥) → kakao_map_url_missing, video_url_missing
- baekban-gijang-jeonbok-juk (기장 전복죽) → kakao_map_url_missing, video_url_missing
- pani-nampo-ssiat-ppang (남포동 씨앗빵 본점) → kakao_map_url_missing
- tzuyang-jagalchi-bibim-dangmyeon (자갈치 비빔당면) → kakao_map_url_missing
- tzuyang-haeundae-sujeburger (해운대 수제버거) → kakao_map_url_missing
- saengdal-ssangdungyi-doejigukbap (쌍둥이돼지국밥) → video_url_missing
- iganae-tteokbokki (이가네떡볶이 본점) → video_url_missing
- baekban-beomeosa-sanche-bibimbap (범어사 산채비빔밥) → kakao_map_url_missing, video_url_missing
- hibab-gwangalli-jogae-gui-pocha (광안리 조개구이 포차) → kakao_map_url_missing
- subyeon-choego-doejigukbap-minrak (수변최고돼지국밥 민락본점) → video_url_missing
- sokssiwonhan-daegutang-haeundae (속씨원한 대구탕 해운대 본점) → video_url_missing
- mulkkong-sikdang (물꽁식당) → video_url_missing
- hoeguksu-halmaejip (회국수할매집) → video_url_missing
- baekban-nampo-18-wandang (18번완당집) → video_url_missing
- baekban-yeongdo-jinju-sikdang (진주식당) → video_url_missing
- bapsang-gijang-haebyeon-jipbul-gomjangeo (해변짚불곰장어) → video_url_missing
- samdae-haeundae-wonjo-halmae-gukbap (해운대원조할매국밥) → video_url_missing
- baekban-haeundae-yangs-yanggopchang (양가네 양곱창) → video_url_missing
- baekban-seomyeon-marathon-jib (마라톤집) → video_url_missing
- saengsaeng-sasang-jurye-suyuk-kalguksu (주례수육칼국수 2호점) → video_url_missing
- saengdal-saha-cheramie (쉐라미과자점) → video_url_missing
- saengdal-geumjeong-songs-bakery (송스 베이커리) → video_url_missing
- saengsaeng-dongnae-halmae-pajeon (동래할매파전) → video_url_missing
- pungja-nampo-milyangjib (밀양집) → video_url_missing
- baekban-seomyeon-masan-sikdang (마산식당) → video_url_missing
- matnyuk-seomyeon-songjeong-3dae-gukbap (송정3대국밥) → video_url_missing
- samdae-seomyeon-gijang-son-kalguksu (기장손칼국수) → video_url_missing
- saengdal-gijang-ilgwangdang (일광당) → video_url_missing
- saengdal-gijang-jeil-bunsik (제일분식) → video_url_missing
- saengdal-bukgu-shunsaikubo (슌사이쿠보 화명) → video_url_missing
- samdae-donggu-shinbalwon (신발원) → kakao_map_url_missing, video_url_missing
- samdae-seomyeon-wonjo-halmae-nakji (원조할매낙지) → video_url_missing
- saengdal-gwangalli-jin-doejigomtang (진돼지곰탕) → video_url_missing
- saengdal-suyeong-dongyang-sarada-namcheon (동양사라다 남천본점) → video_url_missing
- saengdal-suyeong-sushibashiku (스시바시쿠) → video_url_missing
- tzuyang-haeundae-ppalgan-tteokbokki (빨간떡볶이) → video_url_missing
- saengdal-haeundae-missaem-ssalbbang (미쌤쌀빵) → video_url_missing
- saengdal-haeundae-amisan (아미산) → video_url_missing
- saengdal-sasang-peanut-bbangatgan (피넛빵앗간) → video_url_missing
- jeonhyun-gijang-haenyeo-halmaejib (5번 친구해녀할매집) → video_url_missing
- naeho-naengmyeon (내호냉면) → video_url_missing
- tzuyang-yeonje-yeonji-yanggopchang (연지가양곱창) → video_url_missing
- samdaecheonwang-shinbalwon (신발원) → video_url_missing
- saengbang-gwangalli-sanhae-hoejip (산해횟집) → video_url_missing
- baekban-yeongdo-gamasot-doejigukbap (가마솥돼지국밥 영도점) → video_url_missing
- baekban-yeongdo-jungri-haenyeochon (영도 중리해녀촌) → video_url_missing
- saengdal-yeonje-gukje-milmyeon (국제밀면 본점) → video_url_missing
- baekban-yeonje-godeungeo-datchi (고등어다찌 연산본점) → video_url_missing
- baekban-namgu-chossijib (궁중해물탕 조씨집 대연본점) → video_url_missing
- saengdal-namgu-daeyeon-milmyeon (대연밀면) → video_url_missing
- pungja-namgu-hapcheon-gukbap (합천국밥집) → video_url_missing
- saengdal-namgu-namji-ramyeon (남지라면천국) → kakao_map_url_missing, video_url_missing
- live-today-samjin-eomuk (삼진어묵 본점) → video_url_missing
- ddoganjip-hapcheon-ilryu-dwaeji-gukbap (합천일류돼지국밥) → video_url_missing
- ddoganjip-pungnyeon-gopchang (풍년곱창) → video_url_missing
- saengdal-yeongdo-sato-bunsik (사또분식) → video_url_missing
- matnyuk-gijang-daege-jjim (기장 대게찜 본점) → kakao_map_url_missing, video_url_missing
- samdae-haeundae-haemul-pajeon (해운대 해물파전) → kakao_map_url_missing, video_url_missing
- hanyakbang-gukbap-hyeongje-food (한약방돼지국밥 형제식품) → kakao_map_url_missing
- wonjo-gaya-milmyeon (원조가야밀면) → video_url_missing
- saengdal-jeonpo-toda-park (토다공원) → kakao_map_url_missing, video_url_missing

## 중복 가능성
### slug 중복 (0)
- 없음

### name 완전 동일 (2)
- 동래할매파전 → baekban-dongnae-pajeon, saengsaeng-dongnae-halmae-pajeon
- 신발원 → samdae-donggu-shinbalwon, samdaecheonwang-shinbalwon

### name 유사(공백/대소문자 무시) (0)
- 없음

### address 완전 동일 (1)
- 부산 동래구 명륜로94번길 43-10 → baekban-dongnae-pajeon, saengsaeng-dongnae-halmae-pajeon

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
- 기타: 9
- 기장: 8
- 남구: 7
- 영도: 5
- 동래: 4
- 사상: 4
- 연제: 3

## category 집계
- 한식: 24
- 해산물: 11
- 돼지국밥: 10
- 고기: 7
- 베이커리/디저트: 7
- 분식/길거리: 6
- 밀면: 5
- 회: 4
- 아시안: 3
- 일식: 3
- 중식: 2
- 버거/양식: 1
- 분식: 1
- 라면: 1
- 곱창: 1

## 이상 area 후보 (0)
- 없음

## appearance 경고 (65)
- restaurant_id=168c8089-fc82-4c44-8009-fa9e80158d0d (백종원의 3대천왕) → broadcast_date_missing, video_url_missing
- restaurant_id=5ad03bde-3af4-43ab-bcf9-e307d32521ae (수요미식회) → episode_title_missing, broadcast_date_missing, video_url_missing
- restaurant_id=285d3c9e-7319-4378-92e5-c45ecc2a482e (한국인의 밥상) → episode_title_missing, broadcast_date_missing, video_url_missing
- restaurant_id=b7a9baa2-c394-4f3f-a47b-b93f02fb638c (6시내고향) → episode_title_missing, broadcast_date_missing, video_url_missing
- restaurant_id=99e9aaf9-23df-4a5b-8ad2-a209bbab23d0 (생활의달인) → video_url_missing
- restaurant_id=8332e69a-dfef-4ddb-b96d-07655cef7ef5 (쯔양) → broadcast_date_missing, video_url_missing
- restaurant_id=86eedb54-793c-4ff4-98fd-468b89cc81bd (생활의달인) → video_url_missing
- restaurant_id=37e8fa0a-be8e-4886-852d-9e982e16cae2 (생방송투데이 2221회) → episode_title_missing, video_url_missing
- restaurant_id=2cb55410-d8ca-4bc1-a2b7-d2aacfaa4fe1 (백반기행) → video_url_missing
- restaurant_id=4f4203b7-ae0e-481b-b93a-c9ba0317c803 (풍자 또간집) → broadcast_date_missing, video_url_missing
- restaurant_id=d83abb1b-2f00-4593-a66f-8dc2e782afb9 (생활의달인) → episode_title_missing, video_url_missing
- restaurant_id=4924d90c-a5c1-4d0a-8712-d63094586897 (식객 허영만의 백반기행) → episode_title_missing, broadcast_date_missing, video_url_missing
- restaurant_id=e8a9ce4a-be01-4808-bf3c-985958ed8a01 (백종원의 3대천왕) → episode_title_missing, broadcast_date_missing, video_url_missing
- restaurant_id=534984b5-7b03-4945-9f1e-0d88fd57b7a3 (생활의달인) → broadcast_date_missing, video_url_missing
- restaurant_id=e76f9e91-8352-4e49-9d8c-382e9f5d9605 (맛있는녀석들) → video_url_missing
- restaurant_id=df042825-7247-47be-860e-9fb2af554903 (식객 허영만의 백반기행) → video_url_missing
- restaurant_id=4bb57c0f-1571-4c30-9e28-e5e89d062d93 (식객 허영만의 백반기행) → episode_title_missing, broadcast_date_missing, video_url_missing
- restaurant_id=5dc190c3-aa4c-4a5e-ae50-f829653a6fa4 (생활의달인) → video_url_missing
- restaurant_id=6d2db73a-f31b-4a82-85aa-c4c55e6a76db (생활의달인) → broadcast_date_missing, video_url_missing
- restaurant_id=0106a35c-6674-4c09-9963-4fb131f7449f (삼대천왕) → video_url_missing
- restaurant_id=6cf98194-e08c-4af5-9495-6bbe7957a70c (쯔양) → broadcast_date_missing, video_url_missing
- restaurant_id=9fa8c2f5-452d-4bc0-9c8e-6f2079c7dd65 (생활의달인) → broadcast_date_missing, video_url_missing
- restaurant_id=fdb05ce6-5755-4b40-88ee-ea206ef596ee (백반기행) → video_url_missing
- restaurant_id=db028631-6eae-4cf9-b497-80c897d612da (생활의달인) → video_url_missing
- restaurant_id=ab83b139-74f4-40e4-a5f4-53eea8688981 (백종원의 3대 천왕) → broadcast_date_missing, video_url_missing
- restaurant_id=a2dbb9ed-7fe6-43ad-828c-c6d46278b09f (생활의달인) → video_url_missing
- restaurant_id=34486e2a-fee3-4ed3-a6e3-c24bd84e4f3c (생활의달인) → video_url_missing
- restaurant_id=6fa20bbf-ca29-4065-8eca-39d19b904d27 (또간집) → episode_title_missing, broadcast_date_missing, video_url_missing
- restaurant_id=cc75a2f8-52cd-4c3b-a34d-7fac494e8a0b (식객 허영만의 백반기행) → video_url_missing
- restaurant_id=889f4bc5-cb01-40d3-aa7b-45f319a675bf (백종원의 3대 천왕) → episode_title_missing, broadcast_date_missing, video_url_missing
- restaurant_id=48b964a1-9de6-4716-8c29-1455a37e7b91 (식객 허영만의 백반기행) → episode_title_missing, broadcast_date_missing, video_url_missing
- restaurant_id=eadafd41-2633-4ead-aeeb-dd54c0d2e9de (생활의달인) → broadcast_date_missing, video_url_missing
- restaurant_id=fbb321a8-7901-4f8a-b05b-156474015b8c (성시경의 먹을텐데) → episode_title_missing, broadcast_date_missing
- restaurant_id=140d3045-01ea-4994-9338-514c3e19376c (생활의달인) → episode_title_missing, video_url_missing
- restaurant_id=2b3ba8cc-c936-4389-aae4-7329501d75f0 (생활의달인) → video_url_missing
- restaurant_id=83060508-2554-49cf-bff0-2c7217a55561 (맛있는녀석들) → video_url_missing
- restaurant_id=02114234-4586-4813-bac8-7e1697f492f2 (백반기행) → video_url_missing
- restaurant_id=b2db448e-57c1-455a-ad64-e5949c05df74 (2TV 생생정보) → video_url_missing
- restaurant_id=88dc61af-8218-48e9-a91f-c00e83bee6b8 (맛있는녀석들) → episode_title_missing, broadcast_date_missing, video_url_missing
- restaurant_id=dcd3d121-d898-4daa-8e37-d1797e4bac3c (생활의달인) → episode_title_missing, broadcast_date_missing, video_url_missing
- restaurant_id=f8560a38-de47-4618-b687-6ccfbb4bded0 (성시경의 먹을텐데) → broadcast_date_missing
- restaurant_id=9d8c1860-f09b-43fb-9028-0e5ba72c513d (식객 허영만의 백반기행) → episode_title_missing, broadcast_date_missing, video_url_missing
- restaurant_id=a84edf85-7e49-4822-851c-1a3d0fb9003e (생활의달인) → broadcast_date_missing, video_url_missing
- restaurant_id=f8296659-33ba-4c61-981c-0fd32cd54ab7 (2TV 생생정보) → broadcast_date_missing, video_url_missing
- restaurant_id=806a5428-1d73-421e-b878-cee596c76e36 (또간집) → broadcast_date_missing, video_url_missing
- restaurant_id=4af7b487-eaf1-45b4-8511-27e6089fd604 (맛있는녀석들) → video_url_missing
- restaurant_id=62026b24-c99e-4dba-a023-2540c3226258 (성시경의 먹을텐데) → episode_title_missing
- restaurant_id=081ea8e9-c0e1-49b2-bcc8-90369c730855 (맛있는녀석들) → episode_title_missing, broadcast_date_missing, video_url_missing
- restaurant_id=aed96196-233c-456b-89a9-cb15482dd9cc (백종원의 3대 천왕) → episode_title_missing, video_url_missing
- restaurant_id=78384686-3a01-49c0-b103-15a33b169149 (식객 허영만의 백반기행) → video_url_missing
- restaurant_id=712dff4f-dd54-4a5b-b25e-f0ec710d204b (전현무계획) → video_url_missing
- restaurant_id=0b3a8b91-d42b-4dbc-b980-230ee493feb1 (풍자 또간집) → broadcast_date_missing, video_url_missing
- restaurant_id=1fc41847-7c8e-4586-bcca-96570e959486 (생방송 투데이) → episode_title_missing, broadcast_date_missing, video_url_missing
- restaurant_id=07193125-d1c3-4f98-8ddc-e7c6e7ff0004 (식객 허영만의 백반기행) → episode_title_missing, broadcast_date_missing, video_url_missing
- restaurant_id=dddc9249-aee2-480a-ad9b-2b7871f3071e (생활의달인) → video_url_missing
- restaurant_id=5f964861-93aa-413e-b1bd-f92423c6e722 (백종원의 3대 천왕) → episode_title_missing, broadcast_date_missing, video_url_missing
- restaurant_id=98f115ea-7870-43fc-a152-ef0a8e910ff8 (식객 허영만의 백반기행) → video_url_missing
- restaurant_id=d46a5c10-f620-40d0-a602-e49aacbc5999 (삼대천왕) → video_url_missing
- restaurant_id=b159834b-1ebe-467e-aecc-e3f24fc4675b (생활의달인) → broadcast_date_missing, video_url_missing
- restaurant_id=9316bfb2-9c49-494d-a501-96893a9ad13e (맛있는녀석들) → episode_title_missing, broadcast_date_missing, video_url_missing
- restaurant_id=cd695bb9-fb12-4824-b6c7-de5dcc0de631 (식객 허영만의 백반기행) → video_url_missing
- restaurant_id=403d0165-46c6-489a-aca7-0ddb863f8419 (전현무계획3) → video_url_missing
- restaurant_id=6bb141ff-de22-42de-92bf-e541ee559463 (전현무계획3) → broadcast_date_missing
- restaurant_id=574a0e06-0835-4496-a809-9a80388070b3 (SBS 생활의 달인) → video_url_missing
- restaurant_id=67053b94-6d0f-4bf8-ba48-70dbbd44bd9b (SBS 생활의 달인) → video_url_missing

## 대표/appearance 출처 불일치 (0)
- 없음

## appearance 2개 이상 (2)
- kimyusun-daegu-bbol-jjim (김유순대구뽈찜전문점) ×2
- sungsik-nampodong-jungang-gomtang (중앙곰탕) ×2

## 공개 식당 필수값 누락 (54)
- matnyuk-sasang-doejigalbi
- baekban-dongnae-pajeon
- saengdal-ssangdungyi-doejigukbap
- iganae-tteokbokki
- subyeon-choego-doejigukbap-minrak
- sokssiwonhan-daegutang-haeundae
- mulkkong-sikdang
- hoeguksu-halmaejip
- baekban-nampo-18-wandang
- baekban-yeongdo-jinju-sikdang
- bapsang-gijang-haebyeon-jipbul-gomjangeo
- samdae-haeundae-wonjo-halmae-gukbap
- baekban-haeundae-yangs-yanggopchang
- baekban-seomyeon-marathon-jib
- saengsaeng-sasang-jurye-suyuk-kalguksu
- saengdal-saha-cheramie
- saengdal-geumjeong-songs-bakery
- saengsaeng-dongnae-halmae-pajeon
- pungja-nampo-milyangjib
- baekban-seomyeon-masan-sikdang
- matnyuk-seomyeon-songjeong-3dae-gukbap
- samdae-seomyeon-gijang-son-kalguksu
- sungsik-gwangalli-jinmi-eonyang-bulgogi
- sungsik-gwangalli-geumson-1983
- saengdal-gijang-ilgwangdang
- saengdal-gijang-jeil-bunsik
- saengdal-bukgu-shunsaikubo
- samdae-seomyeon-wonjo-halmae-nakji
- saengdal-gwangalli-jin-doejigomtang
- saengdal-suyeong-dongyang-sarada-namcheon
- saengdal-suyeong-sushibashiku
- tzuyang-haeundae-ppalgan-tteokbokki
- saengdal-haeundae-missaem-ssalbbang
- saengdal-haeundae-amisan
- saengdal-sasang-peanut-bbangatgan
- jeonhyun-gijang-haenyeo-halmaejib
- naeho-naengmyeon
- tzuyang-yeonje-yeonji-yanggopchang
- samdaecheonwang-shinbalwon
- saengbang-gwangalli-sanhae-hoejip
- baekban-yeongdo-gamasot-doejigukbap
- baekban-yeongdo-jungri-haenyeochon
- saengdal-yeonje-gukje-milmyeon
- baekban-yeonje-godeungeo-datchi
- baekban-namgu-chossijib
- saengdal-namgu-daeyeon-milmyeon
- pungja-namgu-hapcheon-gukbap
- live-today-samjin-eomuk
- ddoganjip-hapcheon-ilryu-dwaeji-gukbap
- ddoganjip-pungnyeon-gopchang
- saengdal-yeongdo-sato-bunsik
- hanyakbang-gukbap-hyeongje-food
- wonjo-gaya-milmyeon
- saengdal-jeonpo-toda-park

## 비공개인데 converted (0)
- 없음

## 테스트 흔적 후보 (0)
- 없음
