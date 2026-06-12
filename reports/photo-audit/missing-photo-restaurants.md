# 나온집 사진 누락 식당 목록

- 조사일: 2026-06-10 (read-only, DB 변경 없음)
- 기준: `restaurants.thumbnail` 이 null 또는 빈 값인 식당 (DB 실제 컬럼명은 `thumbnail` — 리포트의 thumbnail_url과 동일 의미)
- 정렬: 공개 우선 → 지역(가나다) → 식당명(가나다)
- CSV: `reports/photo-audit/missing-photo-restaurants.csv` (83행)

## 요약

- 전체 restaurants 수: **107**
- 공개 restaurants 수: **91**
- 비공개 restaurants 수: **16**
- 사진 없는 전체 식당 수: **83**
- 사진 없는 공개 식당 수: **68**
- 사진 없는 비공개 식당 수: **15**

> 참고: 사진 없는 공개 식당은 현재 카테고리 이모지 fallback으로 표시되고 있다(빈 화면 아님).
> 공개 68곳을 우선 보강하고, 비공개 15곳은 공개 전환 시점에 함께 준비하면 된다.

## 사진 없는 공개 식당 (68곳)

| No | 식당명 | slug | 지역 | 추천 파일명 |
|---:|---|---|---|---|
| 1 | 금손1983 | sungsik-gwangalli-geumson-1983 | 광안리 | sungsik-gwangalli-geumson-1983.jpg |
| 2 | 동양사라다 남천본점 | saengdal-suyeong-dongyang-sarada-namcheon | 광안리 | saengdal-suyeong-dongyang-sarada-namcheon.jpg |
| 3 | 만우장 | sungsik-gwangalli-manujang | 광안리 | sungsik-gwangalli-manujang.jpg |
| 4 | 블랑제리 라센 | saengdal-gwangalli-boulangerie-lassence | 광안리 | saengdal-gwangalli-boulangerie-lassence.jpg |
| 5 | 비와술잔 | jeonhyun-gwangalli-biwa-suljan | 광안리 | jeonhyun-gwangalli-biwa-suljan.jpg |
| 6 | 산해횟집 | saengbang-gwangalli-sanhae-hoejip | 광안리 | saengbang-gwangalli-sanhae-hoejip.jpg |
| 7 | 수변최고돼지국밥 민락본점 | subyeon-choego-doejigukbap-minrak | 광안리 | subyeon-choego-doejigukbap-minrak.jpg |
| 8 | 연합횟집 | jeonhyun-gwangalli-yeonhap-hoejip | 광안리 | jeonhyun-gwangalli-yeonhap-hoejip.jpg |
| 9 | 진돼지곰탕 | saengdal-gwangalli-jin-doejigomtang | 광안리 | saengdal-gwangalli-jin-doejigomtang.jpg |
| 10 | 해진아나고 | sungsik-gwangalli-haejin-anago | 광안리 | sungsik-gwangalli-haejin-anago.jpg |
| 11 | 일광당 | saengdal-gijang-ilgwangdang | 기장 | saengdal-gijang-ilgwangdang.jpg |
| 12 | 제일분식 | saengdal-gijang-jeil-bunsik | 기장 | saengdal-gijang-jeil-bunsik.jpg |
| 13 | 해변짚불곰장어 | bapsang-gijang-haebyeon-jipbul-gomjangeo | 기장 | bapsang-gijang-haebyeon-jipbul-gomjangeo.jpg |
| 14 | 삼성갈미조개 | tzuyang-gangseo-samseong-galmijogae | 기타 | tzuyang-gangseo-samseong-galmijogae.jpg |
| 15 | 송스 베이커리 | saengdal-geumjeong-songs-bakery | 기타 | saengdal-geumjeong-songs-bakery.jpg |
| 16 | 쉐라미과자점 | saengdal-saha-cheramie | 기타 | saengdal-saha-cheramie.jpg |
| 17 | 옛날국수집 | baekban-seogu-yetnal-guksujip | 기타 | baekban-seogu-yetnal-guksujip.jpg |
| 18 | 김유순대구뽈찜전문점 | kimyusun-daegu-bbol-jjim | 남구 | kimyusun-daegu-bbol-jjim.jpg |
| 19 | 대연밀면 | saengdal-namgu-daeyeon-milmyeon | 남구 | saengdal-namgu-daeyeon-milmyeon.jpg |
| 20 | 수타혜미칼국수 | jeonhyun-namgu-suta-hyemi-kalguksu | 남구 | jeonhyun-namgu-suta-hyemi-kalguksu.jpg |
| 21 | 풍년곱창 | ddoganjip-pungnyeon-gopchang | 남구 | ddoganjip-pungnyeon-gopchang.jpg |
| 22 | 합천국밥집 | pungja-namgu-hapcheon-gukbap | 남구 | pungja-namgu-hapcheon-gukbap.jpg |
| 23 | 18번완당집 | baekban-nampo-18-wandang | 남포동 | baekban-nampo-18-wandang.jpg |
| 24 | 깡돼후 | 2tv-bupyeong-kkang-dwaehu | 남포동 | 2tv-bupyeong-kkang-dwaehu.jpg |
| 25 | 남포동 씨앗호떡 | tzuyang-nampo-ssiat-hotteok | 남포동 | tzuyang-nampo-ssiat-hotteok.jpg |
| 26 | 물꽁식당 | mulkkong-sikdang | 남포동 | mulkkong-sikdang.jpg |
| 27 | 물레방아 즉석구이 | jeonhyun-nampo-mullebanga-jeukseokgui | 남포동 | jeonhyun-nampo-mullebanga-jeukseokgui.jpg |
| 28 | 밀양집 | pungja-nampo-milyangjib | 남포동 | pungja-nampo-milyangjib.jpg |
| 29 | 백화양곱창 1호 | baekhwa-yanggopchang-1ho | 남포동 | baekhwa-yanggopchang-1ho.jpg |
| 30 | 삼미집 | oneuln-nampo-sammi-jip | 남포동 | oneuln-nampo-sammi-jip.jpg |
| 31 | 수복센타 | baekban-nampo-subok-centa | 남포동 | baekban-nampo-subok-centa.jpg |
| 32 | 여송제 | jeonhyun-nampo-yeosongje | 남포동 | jeonhyun-nampo-yeosongje.jpg |
| 33 | 이가네떡볶이 본점 | iganae-tteokbokki | 남포동 | iganae-tteokbokki.jpg |
| 34 | 중앙곰탕 | sungsik-nampodong-jungang-gomtang | 남포동 | sungsik-nampodong-jungang-gomtang.jpg |
| 35 | 동래할매파전 | baekban-dongnae-pajeon | 동래 | baekban-dongnae-pajeon.jpg |
| 36 | 슌사이쿠보 화명 | saengdal-bukgu-shunsaikubo | 북구 | saengdal-bukgu-shunsaikubo.jpg |
| 37 | 시골집명품석갈비 | matnyuk-sasang-doejigalbi | 사상 | matnyuk-sasang-doejigalbi.jpg |
| 38 | 주례수육칼국수 2호점 | saengsaeng-sasang-jurye-suyuk-kalguksu | 사상 | saengsaeng-sasang-jurye-suyuk-kalguksu.jpg |
| 39 | 합천일류돼지국밥 | ddoganjip-hapcheon-ilryu-dwaeji-gukbap | 사상 | ddoganjip-hapcheon-ilryu-dwaeji-gukbap.jpg |
| 40 | 개금 밀면 본점 | sungsik-gaegeum-milmyeon | 서면 | sungsik-gaegeum-milmyeon.jpg |
| 41 | 기장손칼국수 | samdae-seomyeon-gijang-son-kalguksu | 서면 | samdae-seomyeon-gijang-son-kalguksu.jpg |
| 42 | 동춘이만두 | tzuyang-seomyeon-dongchuni-mandu | 서면 | tzuyang-seomyeon-dongchuni-mandu.jpg |
| 43 | 마라톤집 | baekban-seomyeon-marathon-jib | 서면 | baekban-seomyeon-marathon-jib.jpg |
| 44 | 문화양곱창 | sungsik-seomyeon-yanggopchang | 서면 | sungsik-seomyeon-yanggopchang.jpg |
| 45 | 쌍둥이돼지국밥 | saengdal-ssangdungyi-doejigukbap | 서면 | saengdal-ssangdungyi-doejigukbap.jpg |
| 46 | 원조할매낙지 | samdae-seomyeon-wonjo-halmae-nakji | 서면 | samdae-seomyeon-wonjo-halmae-nakji.jpg |
| 47 | 토다공원 | saengdal-jeonpo-toda-park | 서면 | saengdal-jeonpo-toda-park.jpg |
| 48 | 한약방돼지국밥 형제식품 | hanyakbang-gukbap-hyeongje-food | 서면 | hanyakbang-gukbap-hyeongje-food.jpg |
| 49 | 회국수할매집 | hoeguksu-halmaejip | 서면 | hoeguksu-halmaejip.jpg |
| 50 | 고등어다찌 연산본점 | baekban-yeonje-godeungeo-datchi | 연제 | baekban-yeonje-godeungeo-datchi.jpg |
| 51 | 국제밀면 본점 | saengdal-yeonje-gukje-milmyeon | 연제 | saengdal-yeonje-gukje-milmyeon.jpg |
| 52 | 연지가양곱창 | tzuyang-yeonje-yeonji-yanggopchang | 연제 | tzuyang-yeonje-yeonji-yanggopchang.jpg |
| 53 | 동방밀면 | tzuyang-yeongdo-dongbang-milmyeon | 영도 | tzuyang-yeongdo-dongbang-milmyeon.jpg |
| 54 | 동삼동불짬뽕 | tzuyang-yeongdo-dongsamdong-buljjampong | 영도 | tzuyang-yeongdo-dongsamdong-buljjampong.jpg |
| 55 | 사또분식 | saengdal-yeongdo-sato-bunsik | 영도 | saengdal-yeongdo-sato-bunsik.jpg |
| 56 | 삼진어묵 본점 | live-today-samjin-eomuk | 영도 | live-today-samjin-eomuk.jpg |
| 57 | 영도 중리해녀촌 | baekban-yeongdo-jungri-haenyeochon | 영도 | baekban-yeongdo-jungri-haenyeochon.jpg |
| 58 | 왔다식당 | jeonhyun-yeongdo-watda-sikdang | 영도 | jeonhyun-yeongdo-watda-sikdang.jpg |
| 59 | 진주식당 | baekban-yeongdo-jinju-sikdang | 영도 | baekban-yeongdo-jinju-sikdang.jpg |
| 60 | 미쌤쌀빵 | saengdal-haeundae-missaem-ssalbbang | 해운대 | saengdal-haeundae-missaem-ssalbbang.jpg |
| 61 | 불백고수락 센텀본점 | saengdal-centum-bulbaek-gosurak | 해운대 | saengdal-centum-bulbaek-gosurak.jpg |
| 62 | 빨간떡볶이 | tzuyang-haeundae-ppalgan-tteokbokki | 해운대 | tzuyang-haeundae-ppalgan-tteokbokki.jpg |
| 63 | 상국이네 | tzuyang-haeundae-sanggukine | 해운대 | tzuyang-haeundae-sanggukine.jpg |
| 64 | 속씨원한 대구탕 해운대 본점 | sokssiwonhan-daegutang-haeundae | 해운대 | sokssiwonhan-daegutang-haeundae.jpg |
| 65 | 아미산 | saengdal-haeundae-amisan | 해운대 | saengdal-haeundae-amisan.jpg |
| 66 | 양가네 양곱창 | baekban-haeundae-yangs-yanggopchang | 해운대 | baekban-haeundae-yangs-yanggopchang.jpg |
| 67 | 청사포 회센터 | hibab-cheongsa-hoe-center | 해운대 | hibab-cheongsa-hoe-center.jpg |
| 68 | 초필살돼지구이 해운대본점 | tzuyang-haeundae-chopilsal | 해운대 | tzuyang-haeundae-chopilsal.jpg |

## 사진 없는 비공개 식당 (15곳)

| No | 식당명 | slug | 지역 | 추천 파일명 |
|---:|---|---|---|---|
| 1 | 광안리 낙곱새 | matnyuk-gwangalli-nakgopsae | 광안리 | matnyuk-gwangalli-nakgopsae.jpg |
| 2 | 광안리 조개구이 포차 | hibab-gwangalli-jogae-gui-pocha | 광안리 | hibab-gwangalli-jogae-gui-pocha.jpg |
| 3 | 광안리 참치회 | hibab-gwangalli-chamchi-hoe | 광안리 | hibab-gwangalli-chamchi-hoe.jpg |
| 4 | 기장 대게찜 본점 | matnyuk-gijang-daege-jjim | 기장 | matnyuk-gijang-daege-jjim.jpg |
| 5 | 기장 멸치쌈밥 | samdae-gijang-myeolchi-ssambap | 기장 | samdae-gijang-myeolchi-ssambap.jpg |
| 6 | 기장 전복죽 | baekban-gijang-jeonbok-juk | 기장 | baekban-gijang-jeonbok-juk.jpg |
| 7 | 남지라면천국 | saengdal-namgu-namji-ramyeon | 남구 | saengdal-namgu-namji-ramyeon.jpg |
| 8 | 남포동 씨앗빵 본점 | pani-nampo-ssiat-ppang | 남포동 | pani-nampo-ssiat-ppang.jpg |
| 9 | 자갈치 비빔당면 | tzuyang-jagalchi-bibim-dangmyeon | 남포동 | tzuyang-jagalchi-bibim-dangmyeon.jpg |
| 10 | 동래 곱창전골 | saengdal-dongnae-gopchang-jungol | 동래 | saengdal-dongnae-gopchang-jungol.jpg |
| 11 | 범어사 산채비빔밥 | baekban-beomeosa-sanche-bibimbap | 동래 | baekban-beomeosa-sanche-bibimbap.jpg |
| 12 | 서면 소금구이 명가 | sungsik-seomyeon-sogeumgui | 서면 | sungsik-seomyeon-sogeumgui.jpg |
| 13 | 전포 베트남쌀국수 | jeonhyun-jeonpo-vietnam-ssal-guksu | 서면 | jeonhyun-jeonpo-vietnam-ssal-guksu.jpg |
| 14 | 해운대 수제버거 | tzuyang-haeundae-sujeburger | 해운대 | tzuyang-haeundae-sujeburger.jpg |
| 15 | 해운대 해물파전 | samdae-haeundae-haemul-pajeon | 해운대 | samdae-haeundae-haemul-pajeon.jpg |

### 주의

- 추천 파일명은 반드시 **slug.jpg** 형식 그대로 사용한다(폴더 매칭 자동화 전제).
- 사진은 저작권 안전 원칙 준수: 운영자 직접 촬영 / 명시적 재사용 가능 라이선스 / 직접 생성 placeholder만.
  블로그·지도리뷰·인스타·캐치테이블·네이버 이미지 무단 다운로드 금지.
- 비공개 16곳 중 1곳(김미다멸 본점)은 이미 일러스트 썸네일이 있어 이 목록에 없음.
