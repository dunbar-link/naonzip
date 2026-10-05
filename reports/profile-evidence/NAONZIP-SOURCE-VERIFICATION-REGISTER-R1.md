# 나온집 공개 신뢰 출처 검증 등록부 R1

- 기준일: 2026-10-05 KST
- 범위: 공개 `restaurant_trust_sources` 중 원천 URL이 없는 58행
- 원칙: 원천 페이지가 식당·프로그램(또는 가이드 수록)을 직접 확인할 수 있을 때만 공개 DB에 URL을 반영한다. 발행처 페이지, 제3자 정리글, 검색 스니펫은 후보일 뿐 자동 반영 근거가 아니다.

## 집계

| 묶음 | 행 | 현재 원천 상태 | DB 조치 |
| --- | ---: | --- | --- |
| 우체국 추천 맛집가이드 2026 | 40 | 공식 2026 안내 PDF에서 이름·주소 40/40 일치 | 공식 안내 URL·2026-10-05 확인일 반영 완료 |
| 방송·유튜브 | 18 | 신뢰 URL 없음. 연결된 `restaurant_appearances.video_url`도 18건 모두 없음 | 변경 없음 |

## 우체국 가이드 40건

- 발행처 공식 후보: https://www.koreapost.go.kr/user/bbs/421c/98/2742/bbsDataView/100099515.do?bbsDataCategory=&column=&page=19&search=&searchEDate=&searchSDate=
- 확인된 사실: 부산지방우정청 예금영업과가 담당으로 표기된 2026년 가이드 안내 페이지이며 PDF 첨부가 있다. PDF 88쪽의 본문에서 DB 40개 식당의 이름과 주소가 모두 일치했다.
- 페이지 근거: `postoffice-2026-guide-verification.csv`에 40개별 PDF 이름/주소 페이지를 기록했다.
- 반영: 40개 공개 출처에 위 공식 안내 URL과 `2026-10-05` 확인일을 반영했다. PDF 직접 URL을 추정 생성하지 않았다.

## 방송·유튜브 18건

| 출처 | 식당 수 | URL 상태 | 식당 동일성 근거 상태 |
| --- | ---: | --- | --- |
| 생활의 달인/생활의달인 | 7 | 없음 | 회차·방영일은 DB에 있으나 원천 영상/회차 페이지 미확인 |
| 식객 허영만의 백반기행 | 4 | 없음 | 회차·방영일은 DB에 있으나 원천 페이지 미확인 |
| 2TV 생생정보 | 1 | 없음 | 회차·방영일은 DB에 있으나 원천 페이지 미확인 |
| 맛있는녀석들 | 1 | 없음 | 회차·방영일은 DB에 있으나 원천 페이지 미확인 |
| 미친맛집 | 1 | 없음 | 프로그램 표기만 있고 방영일·원천 페이지 미확인 |
| 백종원의 3대 천왕 | 1 | 없음 | 방영일은 있으나 원천 페이지 미확인 |
| 생방송투데이 | 1 | 없음 | 방영일은 있으나 원천 페이지 미확인 |
| 전현무계획3 | 1 | 없음 | 회차·방영일은 DB에 있으나 원천 페이지 미확인 |
| 풍자 또간집 | 1 | 없음 | 프로그램 표기만 있고 방영일·원천 페이지 미확인 |

### 2026-10-05 공식 원천 선별 검색 결과

아래 검사는 프로그램명·식당명·회차(있는 경우)를 결합해 공식 방송사 또는 제작자 도메인으로 한정했다. `OFFICIAL_SEARCH_NO_RESULT`는 검색 결과가 없었다는 사실이며, 방송 사실의 부정이나 원천 부재의 확정 판정이 아니다. 제3자 정리글·검색 스니펫은 공개 출처로 반영하지 않았다.

| slug | 출처 | DB 회차·방영일 | 상태 | 다음 근거 |
| --- | --- | --- | --- | --- |
| saengsaeng-sasang-jurye-suyuk-kalguksu | 2TV 생생정보 | 가격파괴 WHY - 4000원 수육칼국수 / 2017-08-09 | OFFICIAL_SEARCH_NO_RESULT | KBS 회차·영상에서 식당명과 부산 사상구 동일성 |
| matnyuk-sasang-doejigalbi | 맛있는녀석들 | 부산 돼지갈비 원정대 / 2024-07-17 | OFFICIAL_SEARCH_NO_RESULT | 제작자 공식 회차·영상에서 식당 동일성 |
| michinmatjip-seogu-sinchang-gukbap | 미친맛집 | 부산 편 / 날짜 없음 | OFFICIAL_SEARCH_NO_RESULT | 넷플릭스·제작자 원천에서 회차와 식당 동일성 |
| samdae-haeundae-wonjo-halmae-gukbap | 백종원의 3대 천왕 | 회차 없음 / 2016-07-30 | OFFICIAL_SEARCH_NO_RESULT | SBS 공식 회차·영상에서 식당 동일성 |
| saengbang-gwangalli-sanhae-hoejip | 생방송투데이 | 회차 없음 / 2018-12-04 | OFFICIAL_SEARCH_NO_RESULT | SBS 공식 회차·영상에서 식당 동일성 |
| wonjo-gaya-milmyeon | 생활의 달인 | 은둔식당 - 가야 밀면 달인 / 2026-05-25 | OFFICIAL_SEARCH_NO_RESULT | SBS 공식 회차·영상에서 식당 동일성 |
| saengdal-jeonpo-toda-park | 생활의 달인 | 부산 오코노미야키·몬자야키 달인 / 2026-05-04 | OFFICIAL_SEARCH_NO_RESULT | SBS 공식 회차·영상에서 식당 동일성 |
| saengdal-sasang-peanut-bbangatgan | 생활의달인 | 빵의 전쟁 1026회 부산 소금빵 / 2026-04-13 | OFFICIAL_SEARCH_NO_RESULT | SBS 공식 회차·영상에서 식당 동일성 |
| saengdal-suyeong-sushibashiku | 생활의달인 | 1027회 오사카에서 온 초밥 달인 / 2026-04-20 | OFFICIAL_SEARCH_NO_RESULT | SBS 공식 회차·영상에서 식당 동일성 |
| saengdal-suyeong-dongyang-sarada-namcheon | 생활의달인 | 989회 부산 샐러드빵 달인 / 2025-06-30 | OFFICIAL_SEARCH_NO_RESULT | SBS 공식 회차·영상에서 식당 동일성 |
| saengdal-gwangalli-jin-doejigomtang | 생활의달인 | M슐랭 돼지곰탕 달인 1022회 / 2026-03-23 | OFFICIAL_SEARCH_NO_RESULT | SBS 공식 회차·영상에서 식당 동일성 |
| saengdal-haeundae-amisan | 생활의달인 | 996회 양수평 대사부 중식 / 2025-08-18 | OFFICIAL_SEARCH_NO_RESULT | SBS 공식 회차·영상에서 식당 동일성 |
| baekban-seomyeon-masan-sikdang | 식객 허영만의 백반기행 | 맑게 우려낸 국물 깊은 맛의 돼지국밥 336회 / 2026-02-22 | OFFICIAL_SEARCH_NO_RESULT | TV조선 공식 회차·영상에서 식당 동일성 |
| baekban-yeongdo-jungri-haenyeochon | 식객 허영만의 백반기행 | 부산 속살 맛보러 오이소! 진짜배기 부산 밥상 61회 / 2020-07-24 | OFFICIAL_SEARCH_NO_RESULT | TV조선 공식 회차·영상에서 식당 동일성 |
| baekban-haeundae-yangs-yanggopchang | 식객 허영만의 백반기행 | 찐 부산인 정우가 알려주는 부산사투리 145회 / 2022-03-25 | OFFICIAL_SEARCH_NO_RESULT | TV조선 공식 회차·영상에서 식당 동일성 |
| baekban-yeongdo-jinju-sikdang | 식객 허영만의 백반기행 | 부산 속살 맛보러 오이소! 진짜배기 부산 밥상 61회 / 2020-07-24 | OFFICIAL_SEARCH_NO_RESULT | TV조선 공식 회차·영상에서 식당 동일성 |
| jeonhyun-gijang-haenyeo-halmaejib | 전현무계획3 | 시즌3 부산 기장 해녀촌 편 / 2026-01-09 | OFFICIAL_SEARCH_NO_RESULT | 채널S·제작자 공식 영상에서 식당 동일성 |
| ddoganjip-pungnyeon-gopchang | 풍자 또간집 | 부산편 / 날짜 없음 | OFFICIAL_SEARCH_NO_RESULT | 제작자 공식 영상에서 식당 동일성 |

## 감사 기준 교정

- 영상 URL이 존재하는 것만으로 신뢰 출처를 충족으로 보지 않는다.
- `restaurant_appearances.program_name`이 프로필의 선언 `source_title`과 정확히 일치하고, 해당 appearance에 HTTP(S) 영상 URL이 있을 때만 별도 사용자 추적 근거로 인정한다.
- 이번 18건은 영상 URL이 모두 없어 위 예외에 해당하지 않는다.

## 공개 반영·검수 기록 — 2026-10-05 19:33 KST

- 대장의 직접 승인에 따라 신뢰 프로필 범위 9개 커밋을 `origin/master`에 반영했다. 최종 revision은 `259fb1aaae55110b3e983b86c9c51972fac4dc3f`다.
- 공개 검수 URL: `https://naonzip.vercel.app/restaurants/saengsaeng-sasang-jurye-suyuk-kalguksu`. PC와 390px에서 `원천 링크 미등록` 표시, 가로 넘침 없음, 콘솔 오류 없음을 확인했다.
- 기존 출처 보존 검수 URL: `https://naonzip.vercel.app/restaurants/2tv-haeundae-sundori-boribap`. KBS 공식 링크 `https://iaudience.kbs.co.kr/broadcast/11290`가 유지됨을 확인했다.
- `BUILD_EXIT_UNAVAILABLE`: Next build의 종료 trace와 산출물은 확인했으나 실행 도구가 쉘 종료코드를 반환하지 않았다. 전체 140건 Kakao 감사 PASS/FAIL은 별도 미확정 상태로 유지한다.
