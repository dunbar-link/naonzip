# P1 trust_source 백필 — DRY-RUN (2026-06)

- 스크립트: scripts/backfill-p1-trust-sources-2026-06.mjs (dry-run, DB 수정 0)
- P1 대상 47 / INSERT 예정 40 / 제외(REVIEW) 7 / 제외(no_name) 0 / 중복skip 0
- INSERT 내역: tv 25 / youtube 15 / url null 10
- verified_at=2026-06-26, label: tv='방송 출연' / youtube='YouTube 출연'

## INSERT 예정

- `2tv-bupyeong-kkang-dwaehu` 깡돼후 (남포동/고기) | tv | 2TV 생생정보 / 요즘 시장 24시 - 부산 부평깡통시장 돼지갈비 후라이드 / url✓
- `2tv-gumjeong-geumjukheon` 금죽헌 금정산성점 (기타/한식) | tv | 2TV 생생정보 / 맛집 맞수다 - 가족 외식 메뉴 최강자는? 소불고기전골 / url✓
- `2tv-gwangan-kuromatsu` 구로마쯔 (광안리/일식) | tv | 2TV 생생정보 / 장PD의 AI 여행기 - 부산 광안리 오션뷰 철판 코스 맛집 / url✓
- `baekban-dongnae-pajeon` 동래할매파전 (동래/한식) | tv | 백반기행 / 부산 동래 편 — 60년 전통 / url✓
- `baekban-haeundae-yangs-yanggopchang` 양가네 양곱창 (해운대/고기) | tv | 식객 허영만의 백반기행 / 찐 부산인 정우가 알려주는 부산사투리 (145회) / url=null
- `baekban-namgu-chossijib` 궁중해물탕 조씨집 대연본점 (남구/해산물) | tv | 식객 허영만의 백반기행 / 식객 허영만의 백반기행 / url✓
- `baekban-nampo-18-wandang` 18번완당집 (남포동/한식) | tv | 식객 허영만의 백반기행 / 식객 허영만의 백반기행 / url✓
- `baekban-nampo-subok-centa` 수복센타 (남포동/한식) | tv | 식객 허영만의 백반기행 / 4회 단디 차린 부산밥상 / url✓
- `baekban-seogu-yetnal-guksujip` 옛날국수집 (기타/분식/길거리) | tv | 식객 허영만의 백반기행 / 242회 호탕하다 부산밥상 / url✓
- `baekban-seomyeon-marathon-jib` 마라톤집 (서면/한식) | tv | 식객 허영만의 백반기행 / 식객 허영만의 백반기행 / url✓
- `baekban-seomyeon-masan-sikdang` 마산식당 (서면/돼지국밥) | tv | 식객 허영만의 백반기행 / 맑게 우려낸 국물 깊은 맛의 돼지국밥 (336회) / url=null
- `baekban-yeongdo-gamasot-doejigukbap` 가마솥돼지국밥 영도점 (영도/돼지국밥) | tv | 식객 허영만의 백반기행 / 식객 허영만의 백반기행 / url✓
- `baekban-yeongdo-jinju-sikdang` 진주식당 (영도/한식) | tv | 식객 허영만의 백반기행 / 부산 속살 맛보러 오이소! 진짜배기 부산 밥상 (61회) / url=null
- `baekban-yeongdo-jungri-haenyeochon` 영도 중리해녀촌 (영도/해산물) | tv | 식객 허영만의 백반기행 / 부산 속살 맛보러 오이소! 진짜배기 부산 밥상 (61회) / url=null
- `baekhwa-yanggopchang-1ho` 백화양곱창 1호 (남포동/한식) | youtube | 쯔양 / 여기가 제 부산1등 입니다.. 이모님과 손님들 모두가 놀란 양곱창 이모카세 먹방 / url✓
- `ddoganjip-hapcheon-ilryu-dwaeji-gukbap` 합천일류돼지국밥 (사상/돼지국밥) | youtube | 풍자 또간집 / 또간집 부산 국밥편 / url✓
- `ddoganjip-pungnyeon-gopchang` 풍년곱창 (남구/곱창) | youtube | 풍자 또간집 / 또간집 부산편 / url=null
- `hibab-cheongsa-hoe-center` 청사포 도희네 조개구이 (해운대/해산물) | youtube | 히밥 / 부산 회 가성비 끝판왕 / url✓
- `hoeguksu-halmaejip` 회국수할매집 (서면/한식) | tv | 식객 허영만의 백반기행 / 식객 허영만의 백반기행 / url✓
- `iganae-tteokbokki` 이가네떡볶이 본점 (남포동/분식/길거리) | tv | 백종원의 3대천왕 / 이가네떡볶이 방송 소개 / url✓
- `michinmatjip-seogu-sinchang-gukbap` 신창국밥 본점 (기타/돼지국밥) | tv | 미친맛집 / 부산 편 / url=null
- `pungja-namgu-hapcheon-gukbap` 합천국밥집 (남구/돼지국밥) | youtube | 또간집 / 또간집 / url✓
- `pungja-nampo-milyangjib` 밀양집 (남포동/돼지국밥) | youtube | 또간집 / 부산 돼지국밥 1등 편 / url✓
- `saengdal-centum-bulbaek-gosurak` 불백고수락 센텀본점 (해운대/한식) | tv | 생활의 달인 / 공깃밥 달인 / url✓
- `saengdal-gwangalli-boulangerie-lassence` 블랑제리 라센 (광안리/카페/베이커리) | tv | 생활의 달인 / 960회 빵의 전쟁 부산 1탄 / url✓
- `saengdal-jeonpo-toda-park` 토다공원 (서면/일식) | tv | 생활의 달인 / 부산 오코노미야키·몬자야키 달인 / url=null
- `saengsaeng-sasang-jurye-suyuk-kalguksu` 주례수육칼국수 2호점 (사상/한식) | tv | 2TV 생생정보 / 가격파괴 WHY — 4000원 수육칼국수 / url=null
- `samdae-haeundae-wonjo-halmae-gukbap` 해운대원조할매국밥 (해운대/한식) | tv | 백종원의 3대 천왕 / 백종원의 3대 천왕 / url=null
- `samdae-seomyeon-gijang-son-kalguksu` 기장손칼국수 (서면/한식) | tv | 백종원의 3대 천왕 / 47회 / url✓
- `subyeon-choego-doejigukbap-minrak` 수변최고돼지국밥 민락본점 (광안리/돼지국밥) | tv | 수요미식회 / 수요미식회 / url✓
- `sungsik-gaegeum-milmyeon` 개금 밀면 본점 (서면/밀면) | youtube | 먹을텐데 / 부산 밀면 투어 (feat. 성시경) / url✓
- `sungsik-gwangalli-geumson-1983` 금손1983 (광안리/한식) | youtube | 성시경의 먹을텐데 / 부산 금손1983 with 이대호 / url✓
- `sungsik-gwangalli-jinmi-eonyang-bulgogi` 진미언양불고기 (광안리/고기) | youtube | 성시경의 먹을텐데 / 성시경의 먹을텐데 / url✓
- `sungsik-nampodong-jungang-gomtang` 중앙곰탕 (남포동/한식) | youtube | 먹을텐데 / 성시경의 먹을텐데 / url✓
- `sungsik-seomyeon-yanggopchang` 문화양곱창 (서면/한식) | youtube | 먹을텐데 / 부산 곱창 원정대 / url✓
- `tzuyang-haeundae-chopilsal` 초필살돼지구이 해운대본점 (해운대/고기) | youtube | 쯔양 / 부산 먹방 여행 1편 / url✓
- `tzuyang-haeundae-ppalgan-tteokbokki` 빨간떡볶이 (해운대/분식/길거리) | youtube | 쯔양 / 부산 3대 떡볶이 투어 1번째 / url✓
- `tzuyang-nampo-ssiat-hotteok` 남포동 씨앗호떡 (남포동/분식/길거리) | youtube | 쯔양 / 부산 길거리 음식 먹방 / url✓
- `tzuyang-yeonje-yeonji-yanggopchang` 연지가양곱창 (연제/고기) | youtube | 쯔양 / 부산 먹방투어 1등 맛집 / url✓
- `wonjo-gaya-milmyeon` 원조가야밀면 (기타/밀면) | tv | 생활의 달인 / 은둔식당 - 가야 밀면 달인 / url=null

## 제외(REVIEW — program/creator 미상, 추정 금지)

- `sungsik-gwangalli-haejin-anago` 해진아나고 (광안리/회/해산물) | source_title=부산 해진아나고
- `tzuyang-gangseo-samseong-galmijogae` 삼성갈미조개 (기타/회/해산물) | source_title=명지 갈삼구이 먹방
- `tzuyang-gwangalli-darijip` 다리집 (광안리/분식/길거리) | source_title=부산 3대 떡볶이 투어
- `tzuyang-haeundae-sanggukine` 상국이네 (해운대/분식/길거리) | source_title=부산 3대 떡볶이 투어
- `tzuyang-seomyeon-dongchuni-mandu` 동춘이만두 (서면/분식/길거리) | source_title=당감동 가성비 맛집 먹방
- `tzuyang-yeongdo-dongbang-milmyeon` 동방밀면 (영도/밀면) | source_title=부산 밀면 먹방
- `tzuyang-yeongdo-dongsamdong-buljjampong` 동삼동불짬뽕 (영도/중식) | source_title=영도 불짬뽕 매운맛 도전
