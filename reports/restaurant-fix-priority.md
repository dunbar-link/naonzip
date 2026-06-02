# 나온집 공개 식당 보강 우선순위 리포트

- 생성시각: 2026. 6. 2. PM 10:21:35 (KST) / 2026-06-02T13:21:35.709Z
- 대상: 공개 식당(is_published=true). 읽기 전용. DB 수정 없음. 웹검색 미포함.
- thumbnail 누락은 점수 제외(별도 집계). naver/tmap URL 누락은 점수 대상 아님(좌표 자동생성 정책).

## Summary
```text
published_restaurants: 69
priority_candidates: 52
top_score: 16
no_thumbnail: 69
video_url_missing: 20
kakao_map_url_missing: 0
broadcast_date_missing: 3
appearance_broadcast_date_missing: 3
episode_title_missing: 22
source_title_missing: 0
program_or_creator_missing: 0
```

## TOP 20 보강 대상
| # | score | slug | name | area | category | 출처 | 방영일 | video | kakao | app | 추천 액션 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 16 | bapsang-gijang-haebyeon-jipbul-gomjangeo | 해변짚불곰장어 | 기장 | 해산물 | 한국인의 밥상 | - | missing | ok | 1 | 영상 URL / 방영일 / 방영일(출연) 보강 |
| 2 | 13 | ddoganjip-pungnyeon-gopchang | 풍년곱창 | 남구 | 곱창 | 풍자 또간집 | - | missing | ok | 1 | 영상 URL / 방영일 / 방영일(출연) 보강 |
| 3 | 10 | samdae-haeundae-wonjo-halmae-gukbap | 해운대원조할매국밥 | 해운대 | 한식 | 백종원의 3대 천왕 | 2016-07-30 | missing | ok | 1 | 영상 URL / 에피소드 / 가격대 보강 |
| 4 | 8 | saengbang-gwangalli-sanhae-hoejip | 산해횟집 | 광안리 | 회 | 생방송투데이 | 2018-12-04 | missing | ok | 1 | 영상 URL / 에피소드 보강 |
| 5 | 8 | sungsik-gwangalli-geumson-1983 | 금손1983 | 광안리 | 한식 | 성시경의 먹을텐데 | - | ok | ok | 1 | 방영일 / 방영일(출연) 보강 |
| 6 | 7 | baekban-haeundae-yangs-yanggopchang | 양가네 양곱창 | 해운대 | 고기 | 식객 허영만의 백반기행 | 2022-03-25 | missing | ok | 1 | 영상 URL / 가격대 보강 |
| 7 | 7 | baekban-yeongdo-jinju-sikdang | 진주식당 | 영도 | 한식 | 식객 허영만의 백반기행 | 2020-07-24 | missing | ok | 1 | 영상 URL / 가격대 보강 |
| 8 | 7 | baekban-yeongdo-jungri-haenyeochon | 영도 중리해녀촌 | 영도 | 해산물 | 식객 허영만의 백반기행 | 2020-07-24 | missing | ok | 1 | 영상 URL / 가격대 보강 |
| 9 | 7 | saengdal-sasang-peanut-bbangatgan | 피넛빵앗간 | 사상 | 베이커리/디저트 | 생활의달인 | 2026-04-13 | missing | ok | 1 | 영상 URL / 가격대 보강 |
| 10 | 7 | saengdal-suyeong-sushibashiku | 스시바시쿠 | 광안리 | 일식 | 생활의달인 | 2026-04-20 | missing | ok | 1 | 영상 URL / 대표메뉴 보강 |
| 11 | 7 | wonjo-gaya-milmyeon | 원조가야밀면 | 기타 | 밀면 | 생활의 달인 | 2026-05-25 | missing | ok | 1 | 영상 URL / 설명 / 지역 재분류 보강 |
| 12 | 6 | naeho-naengmyeon | 내호냉면 | 남구 | 밀면 | 맛있는녀석들 | 2022-03-25 | ok | ok | 1 | 에피소드 / 대표메뉴 / 설명 보강 |
| 13 | 5 | baekban-namgu-chossijib | 궁중해물탕 조씨집 대연본점 | 남구 | 해산물 | 식객 허영만의 백반기행 | 2026-02-22 | ok | ok | 1 | 에피소드 / 가격대 보강 |
| 14 | 5 | baekban-nampo-18-wandang | 18번완당집 | 남포동 | 한식 | 식객 허영만의 백반기행 | 2020-07-24 | ok | ok | 1 | 에피소드 / 대표메뉴 보강 |
| 15 | 5 | baekban-seomyeon-masan-sikdang | 마산식당 | 서면 | 돼지국밥 | 식객 허영만의 백반기행 | 2026-02-22 | missing | ok | 1 | 영상 URL 보강 |
| 16 | 5 | baekban-yeongdo-gamasot-doejigukbap | 가마솥돼지국밥 영도점 | 영도 | 돼지국밥 | 식객 허영만의 백반기행 | 2026-02-22 | ok | ok | 1 | 에피소드 / 가격대 보강 |
| 17 | 5 | baekban-yeonje-godeungeo-datchi | 고등어다찌 연산본점 | 연제 | 회 | 식객 허영만의 백반기행 | 2026-02-22 | missing | ok | 1 | 영상 URL 보강 |
| 18 | 5 | jeonhyun-gijang-haenyeo-halmaejib | 5번 친구해녀할매집 | 기장 | 해산물 | 전현무계획3 | 2026-01-09 | missing | ok | 1 | 영상 URL 보강 |
| 19 | 5 | matnyuk-sasang-doejigalbi | 시골집명품석갈비 | 사상 | 고기 | 맛있는녀석들 | 2024-07-17 | missing | ok | 1 | 영상 URL 보강 |
| 20 | 5 | matnyuk-seomyeon-songjeong-3dae-gukbap | 송정3대국밥 | 서면 | 돼지국밥 | 맛있는녀석들 | 2016-02-05 | ok | ok | 1 | 에피소드 / 가격대 보강 |

### TOP 20 누락 사유 상세
- 1. **bapsang-gijang-haebyeon-jipbul-gomjangeo** (해변짚불곰장어) [score 16] — video_url, broadcast_date, appearance_broadcast_date, episode_title
- 2. **ddoganjip-pungnyeon-gopchang** (풍년곱창) [score 13] — video_url, broadcast_date, appearance_broadcast_date
- 3. **samdae-haeundae-wonjo-halmae-gukbap** (해운대원조할매국밥) [score 10] — video_url, episode_title, price_text
- 4. **saengbang-gwangalli-sanhae-hoejip** (산해횟집) [score 8] — video_url, episode_title
- 5. **sungsik-gwangalli-geumson-1983** (금손1983) [score 8] — broadcast_date, appearance_broadcast_date
- 6. **baekban-haeundae-yangs-yanggopchang** (양가네 양곱창) [score 7] — video_url, price_text
- 7. **baekban-yeongdo-jinju-sikdang** (진주식당) [score 7] — video_url, price_text
- 8. **baekban-yeongdo-jungri-haenyeochon** (영도 중리해녀촌) [score 7] — video_url, price_text
- 9. **saengdal-sasang-peanut-bbangatgan** (피넛빵앗간) [score 7] — video_url, price_text
- 10. **saengdal-suyeong-sushibashiku** (스시바시쿠) [score 7] — video_url, main_menu
- 11. **wonjo-gaya-milmyeon** (원조가야밀면) [score 7] — video_url, area_etc, description
- 12. **naeho-naengmyeon** (내호냉면) [score 6] — episode_title, main_menu, description
- 13. **baekban-namgu-chossijib** (궁중해물탕 조씨집 대연본점) [score 5] — episode_title, price_text
- 14. **baekban-nampo-18-wandang** (18번완당집) [score 5] — episode_title, main_menu
- 15. **baekban-seomyeon-masan-sikdang** (마산식당) [score 5] — video_url
- 16. **baekban-yeongdo-gamasot-doejigukbap** (가마솥돼지국밥 영도점) [score 5] — episode_title, price_text
- 17. **baekban-yeonje-godeungeo-datchi** (고등어다찌 연산본점) [score 5] — video_url
- 18. **jeonhyun-gijang-haenyeo-halmaejib** (5번 친구해녀할매집) [score 5] — video_url
- 19. **matnyuk-sasang-doejigalbi** (시골집명품석갈비) [score 5] — video_url
- 20. **matnyuk-seomyeon-songjeong-3dae-gukbap** (송정3대국밥) [score 5] — episode_title, price_text

## 이유별 집계 (우선순위 후보 기준)
### area별
- 서면: 8
- 광안리: 7
- 기타: 7
- 남구: 5
- 해운대: 5
- 영도: 5
- 기장: 4
- 남포동: 4
- 사상: 3
- 연제: 3
- 북구: 1
### category별
- 한식: 12
- 돼지국밥: 8
- 해산물: 7
- 베이커리/디저트: 5
- 고기: 4
- 밀면: 4
- 분식/길거리: 3
- 회: 2
- 일식: 2
- 중식: 2
- 곱창: 1
- 아시안: 1
- 분식: 1

## "기타" area 공개 식당 (7)
- 2tv-gumjeong-geumjukheon (금죽헌 금정산성점) / 한식 / 부산 금정구 산성로 531 1층
- live-today-donggu-halme-gimbap (할매김밥) / 분식 / 부산 동구 고관로 106 상가아파트 상가안
- saengdal-geumjeong-songs-bakery (송스 베이커리) / 베이커리/디저트 / 부산 금정구 수림로 26
- saengdal-saha-cheramie (쉐라미과자점) / 베이커리/디저트 / 부산 사하구 낙동대로 238
- live-today-suyeong-geumsin-jeonseon-sangyusibi (금신전선 상유십이) / 한식 / 부산 수영구 수영로582번길 28
- samdaecheonwang-shinbalwon (신발원) / 중식 / 부산광역시 동구 대영로243번길 62
- wonjo-gaya-milmyeon (원조가야밀면) / 밀면 / 부산 사하구 낙동대로451번길 33

## appearance 보강 대상 TOP 20
| # | slug | name | app수 | 누락항목 | 누락수 |
|---|---|---|---|---|---|
| 1 | bapsang-gijang-haebyeon-jipbul-gomjangeo | 해변짚불곰장어 | 1 | broadcast_date, episode_title, video_url | 3 |
| 2 | ddoganjip-pungnyeon-gopchang | 풍년곱창 | 1 | broadcast_date, video_url | 2 |
| 3 | saengbang-gwangalli-sanhae-hoejip | 산해횟집 | 1 | episode_title, video_url | 2 |
| 4 | samdae-haeundae-wonjo-halmae-gukbap | 해운대원조할매국밥 | 1 | episode_title, video_url | 2 |
| 5 | baekban-dongnae-pajeon | 동래할매파전 | 2 | video_url | 1 |
| 6 | baekban-haeundae-yangs-yanggopchang | 양가네 양곱창 | 1 | video_url | 1 |
| 7 | baekban-seomyeon-masan-sikdang | 마산식당 | 1 | video_url | 1 |
| 8 | baekban-yeongdo-jinju-sikdang | 진주식당 | 1 | video_url | 1 |
| 9 | baekban-yeongdo-jungri-haenyeochon | 영도 중리해녀촌 | 1 | video_url | 1 |
| 10 | baekban-yeonje-godeungeo-datchi | 고등어다찌 연산본점 | 1 | video_url | 1 |
| 11 | jeonhyun-gijang-haenyeo-halmaejib | 5번 친구해녀할매집 | 1 | video_url | 1 |
| 12 | matnyuk-sasang-doejigalbi | 시골집명품석갈비 | 1 | video_url | 1 |
| 13 | saengdal-gwangalli-jin-doejigomtang | 진돼지곰탕 | 1 | video_url | 1 |
| 14 | saengdal-haeundae-amisan | 아미산 | 1 | video_url | 1 |
| 15 | saengdal-jeonpo-toda-park | 토다공원 | 1 | video_url | 1 |
| 16 | saengdal-sasang-peanut-bbangatgan | 피넛빵앗간 | 1 | video_url | 1 |
| 17 | saengdal-ssangdungyi-doejigukbap | 쌍둥이돼지국밥 | 1 | video_url | 1 |
| 18 | saengdal-suyeong-dongyang-sarada-namcheon | 동양사라다 남천본점 | 1 | video_url | 1 |
| 19 | saengdal-suyeong-sushibashiku | 스시바시쿠 | 1 | video_url | 1 |
| 20 | saengsaeng-sasang-jurye-suyuk-kalguksu | 주례수육칼국수 2호점 | 1 | video_url | 1 |

## 다음 작업 추천
1. TOP 20부터 영상 URL / 카카오맵 URL / 방영일을 우선 보강(화면·SEO·정렬 영향 큼).
2. 방영일은 restaurants.broadcast_date + 해당 appearance 양쪽을 함께 채워 대표 방송 정렬 정확도 확보.
3. "기타" area 식당은 실제 지역으로 재분류 가능한지 검토(지역 landing 노출).
4. 출처명/프로그램·크리에이터 누락 식당은 출처 확인 후 보강(콘텐츠 배지/landing 매핑).
5. 보강 후 이 스크립트를 재실행해 점수 하락을 추적.