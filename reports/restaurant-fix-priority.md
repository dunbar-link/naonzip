# 나온집 공개 식당 보강 우선순위 리포트

- 생성시각: 2026. 6. 2. PM 7:34:37 (KST) / 2026-06-02T10:34:37.942Z
- 대상: 공개 식당(is_published=true). 읽기 전용. DB 수정 없음. 웹검색 미포함.
- thumbnail 누락은 점수 제외(별도 집계). naver/tmap URL 누락은 점수 대상 아님(좌표 자동생성 정책).

## Summary
```text
published_restaurants: 69
priority_candidates: 57
top_score: 19
no_thumbnail: 69
video_url_missing: 50
kakao_map_url_missing: 2
broadcast_date_missing: 31
appearance_broadcast_date_missing: 32
episode_title_missing: 22
source_title_missing: 0
program_or_creator_missing: 0
```

## TOP 20 보강 대상
| # | score | slug | name | area | category | 출처 | 방영일 | video | kakao | app | 추천 액션 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 19 | naeho-naengmyeon | 내호냉면 | 남구 | 밀면 | 맛있는녀석들 | - | missing | ok | 1 | 영상 URL / 방영일 / 방영일(출연) 보강 |
| 2 | 18 | baekban-namgu-chossijib | 궁중해물탕 조씨집 대연본점 | 남구 | 해산물 | 식객 허영만의 백반기행 | - | missing | ok | 1 | 영상 URL / 방영일 / 방영일(출연) 보강 |
| 3 | 18 | baekban-nampo-18-wandang | 18번완당집 | 남포동 | 한식 | 식객 허영만의 백반기행 | - | missing | ok | 1 | 영상 URL / 방영일 / 방영일(출연) 보강 |
| 4 | 18 | baekban-yeongdo-gamasot-doejigukbap | 가마솥돼지국밥 영도점 | 영도 | 돼지국밥 | 식객 허영만의 백반기행 | - | missing | ok | 1 | 영상 URL / 방영일 / 방영일(출연) 보강 |
| 5 | 18 | matnyuk-seomyeon-songjeong-3dae-gukbap | 송정3대국밥 | 서면 | 돼지국밥 | 맛있는녀석들 | - | missing | ok | 1 | 영상 URL / 방영일 / 방영일(출연) 보강 |
| 6 | 18 | pungja-namgu-hapcheon-gukbap | 합천국밥집 | 남구 | 돼지국밥 | 또간집 | - | missing | ok | 1 | 영상 URL / 방영일 / 방영일(출연) 보강 |
| 7 | 18 | samdae-seomyeon-wonjo-halmae-nakji | 원조할매낙지 | 서면 | 한식 | 백종원의 3대 천왕 | - | missing | ok | 1 | 영상 URL / 방영일 / 방영일(출연) 보강 |
| 8 | 17 | hoeguksu-halmaejip | 회국수할매집 | 서면 | 한식 | 식객 허영만의 백반기행 | - | missing | ok | 1 | 영상 URL / 방영일 / 방영일(출연) 보강 |
| 9 | 17 | mulkkong-sikdang | 물꽁식당 | 남포동 | 해산물 | 6시내고향 | - | missing | ok | 1 | 영상 URL / 방영일 / 방영일(출연) 보강 |
| 10 | 17 | samdaecheonwang-shinbalwon | 신발원 | 기타 | 중식 | 백종원의 3대천왕 | - | missing | ok | 1 | 영상 URL / 방영일 / 방영일(출연) 보강 |
| 11 | 17 | sokssiwonhan-daegutang-haeundae | 속씨원한 대구탕 해운대 본점 | 해운대 | 해산물 | 맛있는녀석들 | - | missing | ok | 1 | 영상 URL / 방영일 / 방영일(출연) 보강 |
| 12 | 17 | subyeon-choego-doejigukbap-minrak | 수변최고돼지국밥 민락본점 | 광안리 | 돼지국밥 | 수요미식회 | - | missing | ok | 1 | 영상 URL / 방영일 / 방영일(출연) 보강 |
| 13 | 16 | baekban-seomyeon-marathon-jib | 마라톤집 | 서면 | 한식 | 식객 허영만의 백반기행 | - | missing | ok | 1 | 영상 URL / 방영일 / 방영일(출연) 보강 |
| 14 | 16 | bapsang-gijang-haebyeon-jipbul-gomjangeo | 해변짚불곰장어 | 기장 | 해산물 | 한국인의 밥상 | - | missing | ok | 1 | 영상 URL / 방영일 / 방영일(출연) 보강 |
| 15 | 16 | live-today-samjin-eomuk | 삼진어묵 본점 | 영도 | 해산물 | 생방송 투데이 | - | missing | ok | 1 | 영상 URL / 방영일 / 방영일(출연) 보강 |
| 16 | 16 | saengdal-geumjeong-songs-bakery | 송스 베이커리 | 기타 | 베이커리/디저트 | 생활의달인 | - | missing | ok | 1 | 영상 URL / 방영일 / 방영일(출연) 보강 |
| 17 | 16 | saengdal-gijang-ilgwangdang | 일광당 | 기장 | 베이커리/디저트 | 생활의달인 | - | missing | ok | 1 | 영상 URL / 방영일 / 방영일(출연) 보강 |
| 18 | 16 | saengdal-saha-cheramie | 쉐라미과자점 | 기타 | 베이커리/디저트 | 생활의달인 | - | missing | ok | 1 | 영상 URL / 방영일 / 방영일(출연) 보강 |
| 19 | 15 | pungja-nampo-milyangjib | 밀양집 | 남포동 | 돼지국밥 | 또간집 | - | missing | ok | 1 | 영상 URL / 방영일 / 방영일(출연) 보강 |
| 20 | 15 | saengdal-gijang-jeil-bunsik | 제일분식 | 기장 | 분식/길거리 | 생활의달인 | - | missing | ok | 1 | 영상 URL / 방영일 / 방영일(출연) 보강 |

### TOP 20 누락 사유 상세
- 1. **naeho-naengmyeon** (내호냉면) [score 19] — video_url, broadcast_date, appearance_broadcast_date, episode_title, main_menu, description
- 2. **baekban-namgu-chossijib** (궁중해물탕 조씨집 대연본점) [score 18] — video_url, broadcast_date, appearance_broadcast_date, episode_title, price_text
- 3. **baekban-nampo-18-wandang** (18번완당집) [score 18] — video_url, broadcast_date, appearance_broadcast_date, episode_title, main_menu
- 4. **baekban-yeongdo-gamasot-doejigukbap** (가마솥돼지국밥 영도점) [score 18] — video_url, broadcast_date, appearance_broadcast_date, episode_title, price_text
- 5. **matnyuk-seomyeon-songjeong-3dae-gukbap** (송정3대국밥) [score 18] — video_url, broadcast_date, appearance_broadcast_date, episode_title, price_text
- 6. **pungja-namgu-hapcheon-gukbap** (합천국밥집) [score 18] — video_url, broadcast_date, appearance_broadcast_date, episode_title, price_text
- 7. **samdae-seomyeon-wonjo-halmae-nakji** (원조할매낙지) [score 18] — video_url, broadcast_date, appearance_broadcast_date, episode_title, price_text
- 8. **hoeguksu-halmaejip** (회국수할매집) [score 17] — video_url, broadcast_date, appearance_broadcast_date, episode_title, description
- 9. **mulkkong-sikdang** (물꽁식당) [score 17] — video_url, broadcast_date, appearance_broadcast_date, episode_title, description
- 10. **samdaecheonwang-shinbalwon** (신발원) [score 17] — video_url, broadcast_date, appearance_broadcast_date, episode_title, area_etc
- 11. **sokssiwonhan-daegutang-haeundae** (속씨원한 대구탕 해운대 본점) [score 17] — video_url, broadcast_date, appearance_broadcast_date, episode_title, description
- 12. **subyeon-choego-doejigukbap-minrak** (수변최고돼지국밥 민락본점) [score 17] — video_url, broadcast_date, appearance_broadcast_date, episode_title, description
- 13. **baekban-seomyeon-marathon-jib** (마라톤집) [score 16] — video_url, broadcast_date, appearance_broadcast_date, episode_title
- 14. **bapsang-gijang-haebyeon-jipbul-gomjangeo** (해변짚불곰장어) [score 16] — video_url, broadcast_date, appearance_broadcast_date, episode_title
- 15. **live-today-samjin-eomuk** (삼진어묵 본점) [score 16] — video_url, broadcast_date, appearance_broadcast_date, episode_title
- 16. **saengdal-geumjeong-songs-bakery** (송스 베이커리) [score 16] — video_url, broadcast_date, appearance_broadcast_date, price_text, area_etc
- 17. **saengdal-gijang-ilgwangdang** (일광당) [score 16] — video_url, broadcast_date, appearance_broadcast_date, episode_title
- 18. **saengdal-saha-cheramie** (쉐라미과자점) [score 16] — video_url, broadcast_date, appearance_broadcast_date, price_text, area_etc
- 19. **pungja-nampo-milyangjib** (밀양집) [score 15] — video_url, broadcast_date, appearance_broadcast_date, price_text
- 20. **saengdal-gijang-jeil-bunsik** (제일분식) [score 15] — video_url, broadcast_date, appearance_broadcast_date, price_text

## 이유별 집계 (우선순위 후보 기준)
### area별
- 서면: 9
- 기타: 8
- 광안리: 7
- 해운대: 6
- 남구: 5
- 남포동: 5
- 영도: 5
- 기장: 4
- 사상: 4
- 연제: 3
- 동래: 1
### category별
- 한식: 13
- 돼지국밥: 10
- 해산물: 7
- 베이커리/디저트: 6
- 밀면: 4
- 분식/길거리: 4
- 고기: 4
- 중식: 2
- 일식: 2
- 회: 2
- 곱창: 1
- 아시안: 1
- 분식: 1

## "기타" area 공개 식당 (8)
- 2tv-gumjeong-geumjukheon (금죽헌 금정산성점) / 한식 / 부산 금정구 산성로 531 1층
- live-today-donggu-halme-gimbap (할매김밥) / 분식 / 부산 동구 고관로 106 상가아파트 상가안
- saengdal-saha-cheramie (쉐라미과자점) / 베이커리/디저트 / 부산 사하구 낙동대로 238
- saengdal-geumjeong-songs-bakery (송스 베이커리) / 베이커리/디저트 / 부산 금정구 수림로 26
- live-today-suyeong-geumsin-jeonseon-sangyusibi (금신전선 상유십이) / 한식 / 부산 수영구 수영로582번길 28
- saengdal-bukgu-shunsaikubo (슌사이쿠보 화명) / 아시안 / 부산 북구 양달로4번길 17 금샘빌딩 1층
- samdaecheonwang-shinbalwon (신발원) / 중식 / 부산광역시 동구 대영로243번길 62
- wonjo-gaya-milmyeon (원조가야밀면) / 밀면 / 부산 사하구 낙동대로451번길 33

## appearance 보강 대상 TOP 20
| # | slug | name | app수 | 누락항목 | 누락수 |
|---|---|---|---|---|---|
| 1 | baekban-dongnae-pajeon | 동래할매파전 | 2 | video_url, broadcast_date | 3 |
| 2 | baekban-namgu-chossijib | 궁중해물탕 조씨집 대연본점 | 1 | broadcast_date, episode_title, video_url | 3 |
| 3 | baekban-nampo-18-wandang | 18번완당집 | 1 | broadcast_date, episode_title, video_url | 3 |
| 4 | baekban-seomyeon-marathon-jib | 마라톤집 | 1 | broadcast_date, episode_title, video_url | 3 |
| 5 | baekban-yeongdo-gamasot-doejigukbap | 가마솥돼지국밥 영도점 | 1 | broadcast_date, episode_title, video_url | 3 |
| 6 | bapsang-gijang-haebyeon-jipbul-gomjangeo | 해변짚불곰장어 | 1 | broadcast_date, episode_title, video_url | 3 |
| 7 | hoeguksu-halmaejip | 회국수할매집 | 1 | broadcast_date, episode_title, video_url | 3 |
| 8 | live-today-samjin-eomuk | 삼진어묵 본점 | 1 | broadcast_date, episode_title, video_url | 3 |
| 9 | matnyuk-seomyeon-songjeong-3dae-gukbap | 송정3대국밥 | 1 | broadcast_date, episode_title, video_url | 3 |
| 10 | mulkkong-sikdang | 물꽁식당 | 1 | broadcast_date, episode_title, video_url | 3 |
| 11 | naeho-naengmyeon | 내호냉면 | 1 | broadcast_date, episode_title, video_url | 3 |
| 12 | pungja-namgu-hapcheon-gukbap | 합천국밥집 | 1 | broadcast_date, episode_title, video_url | 3 |
| 13 | saengdal-gijang-ilgwangdang | 일광당 | 1 | broadcast_date, episode_title, video_url | 3 |
| 14 | samdae-seomyeon-wonjo-halmae-nakji | 원조할매낙지 | 1 | broadcast_date, episode_title, video_url | 3 |
| 15 | samdaecheonwang-shinbalwon | 신발원 | 1 | broadcast_date, episode_title, video_url | 3 |
| 16 | sokssiwonhan-daegutang-haeundae | 속씨원한 대구탕 해운대 본점 | 1 | broadcast_date, episode_title, video_url | 3 |
| 17 | subyeon-choego-doejigukbap-minrak | 수변최고돼지국밥 민락본점 | 1 | broadcast_date, episode_title, video_url | 3 |
| 18 | ddoganjip-hapcheon-ilryu-dwaeji-gukbap | 합천일류돼지국밥 | 1 | broadcast_date, video_url | 2 |
| 19 | ddoganjip-pungnyeon-gopchang | 풍년곱창 | 1 | broadcast_date, video_url | 2 |
| 20 | iganae-tteokbokki | 이가네떡볶이 본점 | 1 | broadcast_date, video_url | 2 |

## 다음 작업 추천
1. TOP 20부터 영상 URL / 카카오맵 URL / 방영일을 우선 보강(화면·SEO·정렬 영향 큼).
2. 방영일은 restaurants.broadcast_date + 해당 appearance 양쪽을 함께 채워 대표 방송 정렬 정확도 확보.
3. "기타" area 식당은 실제 지역으로 재분류 가능한지 검토(지역 landing 노출).
4. 출처명/프로그램·크리에이터 누락 식당은 출처 확인 후 보강(콘텐츠 배지/landing 매핑).
5. 보강 후 이 스크립트를 재실행해 점수 하락을 추적.