# 나온집 식당 대표사진 후보 수집 리포트 (Phase IMG-E1)

- 목적: thumbnail 이 없는 공개 식당의 대표사진 후보를 **공개·합법(SAFE)** 출처 중심으로 조사/수집.
- 본 작업 범위: **후보 수집만**. Storage 업로드 ❌, DB UPDATE ❌, upload --apply ❌.
- SAFE 로 판정한 이미지만 `C:\work\naonzip-thumbnail-input\{slug}.webp` 로 변환·저장.
- 변환: sharp(기존 의존성), 가로 800px, webp q82. 신규 패키지 설치 없음.

## 요약
```text
대상(공개·thumbnail 없음): 58
downloaded_safe   : 2
review_needed     : 26
skipped_unsafe    : 26
no_candidate_found: 4
download_failed   : 0
conversion_failed : 0
risk: safe=18 review=10 unsafe=26 unknown=4
Storage 업로드: 안 함 / DB UPDATE: 안 함
```

## 핵심 결론
- 자동 수집으로 규칙상 **SAFE** 한 깔끔한 음식사진을 확보한 곳은 **2곳**뿐(공식 홈페이지 보유 식당). 대부분 소규모 노포/시장 식당은 자체 홈페이지가 없고, 깔끔한 음식사진은 개인 블로그·인스타·지도 사용자사진(UNSAFE)에 몰려 있어 다운로드 대상에서 제외함.
- 다수 식당은 **Visit Busan / 대한민국 구석구석(관광공사)** 등 공공관광 페이지(SAFE-tier)에 등재돼 있으나, 이미지가 JavaScript 로 로딩되어 자동 추출이 불가 → `review_needed` 로 분류하고 출처 페이지 URL 을 남김(운영자가 직접 저장 가능).
- 결론: **자동 수집 품질이 낮아 수동 후보 보강을 권장**(아래 7번 참고).

## 1. 대상 식당 기준
- 조회: `is_published = true AND (thumbnail IS NULL OR trim(thumbnail) = '')` (SELECT only)
- 전체 공개 식당 69곳 중 thumbnail 보유 11곳 제외 → 대상 58곳.

## 2. 수집 결과 요약
| 구분 | 수 |
|---|---:|
| downloaded_safe | 2 |
| review_needed | 26 |
| skipped_unsafe | 26 |
| no_candidate_found | 4 |
| download_failed | 0 |
| conversion_failed | 0 |

## 3. SAFE 다운로드 목록 (input 폴더에 저장됨)
| slug | 식당명 | source_type | source_page_url | local_file |
|---|---|---|---|---|
| hibab-haeundae-amsogalbi | 해운대 암소갈비집 | official_site | https://www.haeundaegalbi.com/galbi | hibab-haeundae-amsogalbi.webp |
| sungsik-gwangalli-jinmi-eonyang-bulgogi | 진미언양불고기 | official_site | https://jinmi1982.com/sub/sub3.php | sungsik-gwangalli-jinmi-eonyang-bulgogi.webp |

## 4. REVIEW 목록 (운영자 수동 확인 권장)
| slug | 식당명 | risk | source_type | source_page_url | 사유 |
|---|---|---|---|---|---|
| live-today-samjin-eomuk | 삼진어묵 본점 | review | official_site | https://www.samjinfood.com/ | 자체 공식 쇼핑몰 있음(대기업 삼진어묵). 다만 홈페이지 이미지는 캠핑굿즈 배너·선물세트 포장 등 마케팅 위주라 깔끔한 어묵 음식사진 추출이 어려움(REVIEW). 제품 상세페이지에서 깔끔한 어묵컷 수동 확보 가능. |
| sungsik-gaegeum-milmyeon | 개금 밀면 본점 | safe | public_tourism | https://www.visitbusan.net/index.do?menuCd=DOM_000000201002002001&uc_seq=1602&lang_cd=ko | Visit Busan + 관광공사 기사(SAFE). 이미지 JS 로딩. 페이스북 페이지는 로그인 필요(사용 불가). 운영자 수동 확보 권장. |
| saengdal-haeundae-missaem-ssalbbang | 미쌤쌀빵 | review | article | https://www.newsbuzz.co.kr/news/articleView.html?idxno=5884 | 공식 홈페이지/스마트스토어 미발견. 생활의달인 소개 언론기사(REVIEW)에 빵 사진 가능. 인스타(@misam_ricebread)는 로그인 필요. 운영자 판단 필요. |
| iganae-tteokbokki | 이가네떡볶이 본점 | review | official_site | https://leegane.co.kr/ | 자체 도메인 공식몰 있음. 다만 양념장 제품/마케팅 상세이미지(텍스트·인물 다수) 위주라 깔끔한 떡볶이 단독 음식사진 추출 어려움(REVIEW). 메뉴 페이지에 떡볶이 사진 있으나 합성 상세컷. |
| kimyusun-daegu-bbol-jjim | 김유순대구뽈찜전문점 | safe | public_tourism | https://www.visitbusan.net/index.do?menuCd=DOM_000000201002001000&uc_seq=564&lang_cd=ko | 공식 홈페이지 없음. Visit Busan + 관광공사(SAFE) 존재. 정적 HTML 은 placeholder(top_bg_error.gif)만 노출 → 자동추출 불가. 운영자 수동 확보 권장. |
| saengdal-ssangdungyi-doejigukbap | 쌍둥이돼지국밥 | safe | public_tourism | https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=19ff9114-d5d7-40f3-9cd1-0564e8f023ee | 관광공사(KTO) 등재(SAFE). tong.visitkorea CDN 에서 추출한 이미지는 음식이 아닌 외관(간판) 사진이라 제외. 본점이 대연동(서면 아님) 가능성 — 데이터 확인 필요. 운영자가 관광공사 페이지에서 음식사진 직접 확인 권장. |
| hoeguksu-halmaejip | 회국수할매집 | safe | public_tourism | https://access.visitkorea.or.kr/food/detail.do?cotId=b480c9c1-7231-4eca-9541-6adb84e1ae00 | 공식 홈페이지 없음. 열린관광(관광공사) 음식 페이지 존재(SAFE), 갤러리 5장이나 JS 슬라이더 로딩으로 자동추출 불가. 운영자 수동 확보 권장. |
| mulkkong-sikdang | 물꽁식당 | safe | public_tourism | https://ncms.nculture.org/food/story/762 | 공식 홈페이지 없음. 지역N문화(한국문화원연합회)·부산역사문화대전 등 공공자료에 부산아구찜/물꽁식당 소개(SAFE-tier). 이미지 JS 로딩으로 자동추출 불가. 운영자 수동 확보 권장. |
| baekban-yeongdo-jinju-sikdang | 진주식당 | safe | public_tourism | https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=53234 | 공식 홈페이지 없음. 관광공사 영문 페이지 존재(SAFE). 본문 사진 JS 로딩으로 자동추출 불가. 운영자 수동 확보 권장. |
| bapsang-gijang-haebyeon-jipbul-gomjangeo | 해변짚불곰장어 | safe | public_tourism | https://ncms.nculture.org/food/story/1931 | 공식 홈페이지 없음. 기장군청 관광 + 지역N문화 짚불곰장어 소개(SAFE-tier). 사진이 이 식당 특정인지 확인 필요 + JS 로딩. 운영자 검토 권장. |
| subyeon-choego-doejigukbap-minrak | 수변최고돼지국밥 민락본점 | safe | public_tourism | https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=82d02bcb-77d4-40d5-a92c-e9e12f00dfea | 자체 도메인(수변최고돼지국밥.kr) 있으나 SSL 인증서 만료로 접근 불가. 관광공사 페이지(SAFE)는 이미지 JS 로딩. 운영자 수동 확보 권장. |
| saengdal-saha-cheramie | 쉐라미과자점 | review | article | https://www.busan.com/view/busan/view.php?code=20181009000192 | 공식 홈페이지 없음. 부산일보 기사(REVIEW)에 애플파이 사진 있음. 직접 다운로드는 핫링크 차단으로 실패(download_failed) → 운영자가 기사 페이지에서 확인 필요. |
| samdae-seomyeon-gijang-son-kalguksu | 기장손칼국수 | safe | public_tourism | https://www.visitbusan.net/index.do?menuCd=DOM_000000201002001000&uc_seq=1817&lang_cd=ko | 공식 홈페이지 없음. Visit Busan(SAFE) 페이지 존재. 음식사진 JS 로딩으로 자동추출 불가. 운영자 수동 확보 권장. |
| samdae-seomyeon-wonjo-halmae-nakji | 원조할매낙지 | review | article |  | 공식 홈페이지 없음. 서울경제(sedaily) 기사 존재(REVIEW). 컬리 밀키트는 "원조 조방낙지" 로 브랜드가 달라(조방낙지≠원조할매낙지) 사용 금지 — 동일 식당 보장 안 됨. 운영자 직접 확인 필요. |
| baekhwa-yanggopchang-1ho | 백화양곱창 1호 | safe | public_tourism | https://www.visitbusan.net/index.do?lang_cd=ko&menuCd=DOM_000000201002004001&uc_seq=2483 | Visit Busan(SAFE) 페이지 존재. 정적 HTML 에서 뽑힌 이미지는 실제 사진이 아닌 "VISIT BUSAN" 음식 일러스트라 제외. 운영자가 페이지에서 실제 사진 확인 권장. |
| saengdal-gwangalli-jin-doejigomtang | 진돼지곰탕 | review | article | https://www.diningcode.com/profile.php?rid=1Qyoo0oTqgd2 | 공식 홈페이지 없음. 톱스타뉴스 등 기사(REVIEW) 존재. 그 외는 블로그/다이닝코드(UGC). 운영자 판단 필요. |
| baekban-dongnae-pajeon | 동래할매파전 | safe | public_tourism | https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=e4b90c28-16ca-4349-857f-0ed4b0a49b6d | 한국관광공사 대한민국 구석구석 + Visit Busan 에 동래파전 사진 있음(SAFE). 단 이미지가 JS 로딩이라 자동 다운로드 불가. 공식 홈페이지 사진은 저작권 제한 명시. 운영자가 관광공사 페이지에서 직접 저장 가능. |
| ddoganjip-hapcheon-ilryu-dwaeji-gukbap | 합천일류돼지국밥 | safe | public_tourism | https://www.visitbusan.net/index.do?menuCd=DOM_000000201002001000&uc_seq=167&lang_cd=ko | Visit Busan + 관광공사 등재(SAFE). 단 Visit Busan 항목은 placeholder(사진 미업로드), 관광공사는 JS 로딩 → 자동추출 불가. 운영자 수동 확보 권장. |
| saengdal-haeundae-amisan | 아미산 | review | official_site | https://chineserestaurant.co.kr/ | 자체 도메인 공식 홈페이지 있음. 불도장 등 음식사진 있으나 "아미산" 워터마크가 박혀 있어 규칙상 SAFE 다운로드 제외(REVIEW). 일부 갤러리컷은 빈 룸 사진. 운영자 판단 필요. |
| pungja-namgu-hapcheon-gukbap | 합천국밥집 | safe | public_tourism | https://www.visitbusan.net/index.do?menuCd=DOM_000000201002001000&uc_seq=1511&lang_cd=ko | Visit Busan 등재(SAFE)이나 placeholder(사진 미업로드). 미쉐린 가이드 페이지(REVIEW)는 403. 운영자 수동 확보 권장. |
| saengbang-gwangalli-sanhae-hoejip | 산해횟집 | review | article | https://www.imaeil.com/page/view/2019072417305114614 | 공식 홈페이지 없음. 매일신문 기사(REVIEW)가 최선이나 첨부 이미지는 음식이 아닌 네이버지도 캡처. 그 외 다이닝코드/인스타(UGC). 운영자 직접 확인 필요. |
| baekban-nampo-18-wandang | 18번완당집 | review | article | https://www.thingoolmarket.com/goods/goods_view.php?goodsNo=1000025031 | 공식 홈페이지 없음. 밀키트 판매처(띵굴마켓/컨비니)에 완당 제품사진 있으나 식당 자체 권리 아님(REVIEW). 운영자 판단 필요. |
| baekban-yeongdo-jungri-haenyeochon | 영도 중리해녀촌 | safe | public_tourism | https://www.visitbusan.net/index.do?menuCd=DOM_000000202008001000&uc_seq=2097&lang_cd=ko | 부산시 관광(Visit Busan) 페이지 존재(SAFE)이나 음식사진은 placeholder GIF 로 표시. 운영자 수동 확보 권장. |
| baekban-yeonje-godeungeo-datchi | 고등어다찌 연산본점 | safe | public_tourism | https://www.visitbusan.net/index.do?menuCd=DOM_000000201002001000&uc_seq=1836&lang_cd=ko | 공식 홈페이지 없음. Visit Busan(SAFE) 음식 페이지 존재. 이미지 JS 로딩으로 자동추출 불가. 운영자 수동 확보 권장. |
| saengdal-yeonje-gukje-milmyeon | 국제밀면 본점 | safe | public_tourism | https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=58680c46-8aad-4dea-b535-fa37dc79207f | 관광공사 밀면 BEST4 여행기사 + Visit Busan(SAFE). 이미지 JS 로딩으로 자동추출 불가. 공식 홈페이지 없음. 운영자 수동 확보 권장. |
| oneuln-nampo-sammi-jip | 삼미집 | review | article | https://www.wikifoodie.co.kr/news/articleView.html?idxno=1152 | 공식 홈페이지 없음. 위키푸디 기사(REVIEW)가 최선이나 첨부 이미지가 "셔터스톡 참고용" 으로 명시 — 실제 식당 음식 아님. 사용 금지. 운영자 직접 확인 필요. |

## 5. SKIP / UNSAFE 목록 (UGC 만 존재 → 다운로드 안 함)
| slug | 식당명 | source_type | 사유 |
|---|---|---|---|
| baekban-seomyeon-marathon-jib | 마라톤집 | user_generated | 공식 홈페이지 없음(백년가게). 식신·다이닝코드·인스타(UGC)만. SAFE 후보 없음. |
| tzuyang-haeundae-ppalgan-tteokbokki | 빨간떡볶이 | user_generated | 우일종합시장 노점. 공식 홈페이지 없음. 다이닝코드·트립·인스타(UGC)만. SAFE 후보 없음. |
| sungsik-seomyeon-yanggopchang | 문화양곱창 | user_generated | 양곱창 골목 식당. 공식 홈페이지 없음. 식신·다이닝코드·망고플레이트·트립(UGC)만. SAFE 후보 없음. |
| 2tv-gumjeong-geumjukheon | 금죽헌 금정산성점 | user_generated | 공식 홈페이지 없음. 캐치테이블·스레드·메뉴통(UGC)만. 관광페이지는 식당이 아닌 금정산성 일대 소개. SAFE 후보 없음. |
| saengdal-centum-bulbaek-gosurak | 불백고수락 센텀본점 | user_generated | 공식 홈페이지 없음. 다이닝코드·스레드(사장 계정)만. SAFE 후보 없음. |
| saengdal-jeonpo-toda-park | 토다공원 | official_sns | 공식 인스타(@toda_park)만 존재 — 인스타는 로그인 필요/규칙상 UNSAFE. 다른 SAFE 출처 없음. |
| live-today-donggu-halme-gimbap | 할매김밥 | user_generated | 공식 홈페이지/관광페이지 없음. 다이닝코드·SNS(UGC)만. SAFE 후보 없음. |
| baekban-haeundae-yangs-yanggopchang | 양가네 양곱창 | user_generated | 공식 홈페이지/관광페이지 없음. 식신·다이닝코드·트립(UGC). 백반기행 기사(텍스트)만. SAFE 후보 없음. |
| saengdal-geumjeong-songs-bakery | 송스 베이커리 | official_sns | 공식 홈페이지 없음. 인스타(@songsbakery, 로그인 필요)·다이닝코드·당근(UGC)만. SAFE 후보 없음. |
| saengsaeng-sasang-jurye-suyuk-kalguksu | 주례수육칼국수 2호점 | user_generated | 공식 홈페이지 없음. 다이닝코드·식신·블로그(UGC)만. SAFE 후보 없음. |
| live-today-suyeong-geumsin-jeonseon-sangyusibi | 금신전선 상유십이 | user_generated | 공식 홈페이지/관광페이지 없음. 다이닝코드·블로그(UGC)만. SAFE 후보 없음. |
| saengdal-bukgu-shunsaikubo | 슌사이쿠보 화명 | official_sns | 공식 홈페이지 없음. 인스타(@sevenstar1001, 로그인 필요)·블로그·리뷰(UGC)만. SAFE 후보 없음. |
| pungja-nampo-milyangjib | 밀양집 | user_generated | 깡통시장 노포. 공식 홈페이지 없음. 다이닝코드·블루어·트립(UGC)만. SAFE 후보 없음. |
| sungsik-gwangalli-geumson-1983 | 금손1983 | official_sns | 자체 도메인 없음. 인스타(로그인 필요)·캐치테이블·식신·다이닝코드(UGC)만. SAFE 후보 없음. |
| saengdal-gijang-ilgwangdang | 일광당 | user_generated | 포장 위주 가게. 공식 홈페이지 없음. 블로그·다이닝코드(UGC)만. SAFE 후보 없음. |
| saengdal-gijang-jeil-bunsik | 제일분식 | user_generated | 간판 없는 노포. 공식 홈페이지 없음. 블로그·식신·인스타·다이닝코드(UGC)만. SAFE 후보 없음. |
| 2tv-bupyeong-kkang-dwaehu | 깡돼후 | official_sns | 공식 페이스북(로그인 필요)만. SSG/비비수산 밀키트는 깡돼후 브랜드 확인 안 됨(귀속 금지). SAFE 후보 없음. |
| saengdal-suyeong-dongyang-sarada-namcheon | 동양사라다 남천본점 | user_generated | 샐러드빵 베이커리. 공식 홈페이지 없음. 블로그·다이닝코드·트립(UGC)만. SAFE 후보 없음. |
| tzuyang-yeonje-yeonji-yanggopchang | 연지가양곱창 | user_generated | 공식 홈페이지 없음. 다이닝코드·식신·트립(UGC)만. SAFE 후보 없음. |
| saengdal-namgu-daeyeon-milmyeon | 대연밀면 | user_generated | 공식 홈페이지 없음. 관광페이지엔 동래밀면/개금밀면만 등재(대연밀면 아님). 다이닝코드·블로그(UGC)만. SAFE 후보 없음. |
| sungsik-nampodong-jungang-gomtang | 중앙곰탕 | user_generated | 공식 홈페이지 없음. 다이닝코드·식신·트립·페이스북(UGC)만. SAFE 후보 없음. |
| 2tv-gwangan-kuromatsu | 구로마쯔 | user_generated | 공식 홈페이지 없음. 캐치테이블·다이닝코드·블로그(UGC)만. SAFE 후보 없음. |
| sokssiwonhan-daegutang-haeundae | 속씨원한 대구탕 해운대 본점 | user_generated | 공식 홈페이지/관광페이지 없음. 다이닝코드·식신·트립 등 리뷰플랫폼 사용자사진만. (미포본점 표기 혼재) SAFE 후보 없음. |
| ddoganjip-pungnyeon-gopchang | 풍년곱창 | user_generated | 공식 홈페이지 없음. 메뉴판닷컴(외관컷)·다이닝코드·캐치테이블(UGC)만. SAFE 음식사진 없음. |
| saengdal-yeongdo-sato-bunsik | 사또분식 | user_generated | 공식 홈페이지 없음. 인스타·폴레·블로그(UGC)만. SAFE 후보 없음. |
| hanyakbang-gukbap-hyeongje-food | 한약방돼지국밥 형제식품 | user_generated | 공식 홈페이지 없음. 다이닝코드·캐치테이블·인스타·브런치(UGC)만. SAFE 후보 없음. |

## 6. 후보 없음
| slug | 식당명 | 사유 |
|---|---|---|
| matnyuk-sasang-doejigalbi | 시골집명품석갈비 | 검색으로 해당 지점(시골집명품석갈비/사상 돼지갈비)을 명확히 특정하지 못함. 공식·관광·SAFE 출처 미발견. 데이터(상호/지점) 확인 권장. |
| 2tv-gijang-kimmida-myeol | 김미다멸 본점 | 다양한 표기(김미다멸/기다멸)로 검색해도 해당 식당의 웹 노출 없음. 일반 기장미역 판매처/타 미역국집만 나옴. 출처 페이지 특정 불가. |
| tzuyang-nampo-ssiat-hotteok | 남포동 씨앗호떡 | 남포동 씨앗호떡은 BIFF광장 다수 노점의 통칭 — 단일 식당 공식출처 없음. 한국민족문화대백과 참고만. 대표 단일 사진 특정 불가. |
| hibab-cheongsa-hoe-center | 청사포 회센터 | "회센터"는 청사포 밀집 횟집의 통칭 — 정확히 일치하는 단일 식당/공식출처 없음. 데이터 확인 권장. |

## 7. 운영자가 다음에 할 일
1. `C:\work\naonzip-thumbnail-input` 폴더의 신규 2장(해운대 암소갈비집, 진미언양불고기)을 눈으로 확인.
2. 이상하거나 법적으로 애매한 사진은 삭제.
3. dry-run: `node scripts/upload-restaurant-thumbnails.mjs`
4. 문제 없으면 적용: `node scripts/upload-restaurant-thumbnails.mjs --apply`
5. 모바일 화면에서 사진 표시 확인.
6. (선택) REVIEW 목록의 공공관광 페이지(Visit Busan/관광공사)에서 음식사진을 직접 저장해 `{slug}.webp` 로 추가하면 SAFE 보강 가능.

## 8. 비고 (데이터 점검 후보)
- `saengdal-ssangdungyi-doejigukbap`: 관광공사상 본점이 대연동(서면 아님) 가능성.
- `samdae-seomyeon-wonjo-halmae-nakji`: 컬리 밀키트는 "조방낙지" 로 브랜드 상이 — 동일 식당 아님 주의.
- `2tv-gijang-kimmida-myeol`, `hibab-cheongsa-hoe-center`, `tzuyang-nampo-ssiat-hotteok`, `matnyuk-sasang-doejigalbi`: 웹 노출이 약하거나 통칭/지점 불명확 — 상호·지점 데이터 확인 권장.
