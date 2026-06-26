# P2 trust_source 백필 — DRY-RUN (2026-06)

- 스크립트: scripts/backfill-p2-trust-sources-2026-06.mjs (dry-run, DB 수정 0)
- P2 대상 31 / INSERT 예정 31 / 제외(REVIEW) 0 / 제외(no_name) 0 / 중복skip 0
- INSERT 내역: tv 28 / youtube 3 / url null 8
- verified_at=2026-06-26, label: tv='방송 출연' / youtube='YouTube 출연'

## INSERT 예정

- `ansungjae-yeonje-mapobonga` 마포본가 (연제/고기) | youtube | 안성재 셰프 유튜브 / 김재훈 셰프 단골집 소개 / url✓
- `hanyakbang-gukbap-hyeongje-food` 한약방돼지국밥 형제식품 (서면/돼지국밥) | tv | 전현무계획3 / 부산 편 돼지국밥 맛집 / url✓
- `jeonhyun-gijang-haenyeo-halmaejib` 5번 친구해녀할매집 (기장/해산물) | tv | 전현무계획3 / 시즌3 부산 기장 해녀촌 편 (with 김혜은) / url=null
- `jeonhyun-gwangalli-biwa-suljan` 비와술잔 (광안리/일식) | youtube | 전현무계획2 / 9화 부산 이모카세 / url✓
- `jeonhyun-gwangalli-yeonhap-hoejip` 연합횟집 (광안리/회) | tv | 전현무계획2 / 8화 부산 로컬맛집 / url✓
- `jeonhyun-namgu-suta-hyemi-kalguksu` 수타혜미칼국수 (남구/분식/길거리) | tv | 전현무계획2 / 9회 부산편 / url✓
- `jeonhyun-nampo-mullebanga-jeukseokgui` 물레방아 즉석구이 (남포동/고기) | youtube | 전현무계획2 / 8화 부산 안금무 노포 / url✓
- `jeonhyun-nampo-yeosongje` 여송제 (남포동/한식) | tv | 전현무계획2 / 9화 부산 남포동 냉채족발 / url✓
- `jeonhyun-yeongdo-watda-sikdang` 왔다식당 (영도/고기) | tv | 전현무계획2 / 8화 부산 로컬맛집 / url✓
- `live-today-donggu-halme-gimbap` 할매김밥 (기타/분식) | tv | 생방송 투데이 / 인생분식 - 부산 할매김밥 50년 노포 / url✓
- `live-today-samjin-eomuk` 삼진어묵 본점 (영도/해산물) | tv | 생방송 투데이 / 생방송 투데이 / url✓
- `live-today-suyeong-geumsin-jeonseon-sangyusibi` 금신전선 상유십이 (기타/한식) | tv | 생방송 투데이 / 네가 왜 거기서 나와 - 카페에 등장한 특별한 손님 / url✓
- `matnyuk-sasang-doejigalbi` 시골집명품석갈비 (사상/고기) | tv | 맛있는녀석들 / 부산 돼지갈비 원정대 / url=null
- `matnyuk-seomyeon-songjeong-3dae-gukbap` 송정3대국밥 (서면/돼지국밥) | tv | 맛있는녀석들 / 맛있는녀석들 / url✓
- `naeho-naengmyeon` 내호냉면 (남구/밀면) | tv | 맛있는녀석들 / 맛있는녀석들 / url✓
- `oneuln-nampo-sammi-jip` 삼미집 (남포동/한식) | tv | 오늘N / 할매식당 - 부산 국제시장 소갈비찜탕 / url✓
- `saengbang-gwangalli-sanhae-hoejip` 산해횟집 (광안리/회) | tv | 생방송투데이 / 생방송투데이 2221회 / url=null
- `saengdal-bukgu-shunsaikubo` 슌사이쿠보 화명 (기타/아시안) | tv | 생활의달인 / 1027회 / url✓
- `saengdal-geumjeong-songs-bakery` 송스 베이커리 (기타/베이커리/디저트) | tv | 생활의달인 / 빵의 전쟁2 / url✓
- `saengdal-gijang-ilgwangdang` 일광당 (기장/베이커리/디저트) | tv | 생활의달인 / 생활의달인 / url✓
- `saengdal-gijang-jeil-bunsik` 제일분식 (기장/분식/길거리) | tv | 생활의달인 / 1024회 / url✓
- `saengdal-gwangalli-jin-doejigomtang` 진돼지곰탕 (광안리/돼지국밥) | tv | 생활의달인 / M슐랭 돼지곰탕 달인 (1022회) / url=null
- `saengdal-haeundae-amisan` 아미산 (해운대/중식) | tv | 생활의달인 / 996회 양수평 대사부 중식 / url=null
- `saengdal-haeundae-missaem-ssalbbang` 미쌤쌀빵 (해운대/베이커리/디저트) | tv | 생활의달인 / 빵의 전쟁2 편 / url✓
- `saengdal-namgu-daeyeon-milmyeon` 대연밀면 (남구/밀면) | tv | 생활의달인 / 생활의달인 / url✓
- `saengdal-saha-cheramie` 쉐라미과자점 (기타/베이커리/디저트) | tv | 생활의달인 / 빵의 전쟁2 / url✓
- `saengdal-sasang-peanut-bbangatgan` 피넛빵앗간 (사상/베이커리/디저트) | tv | 생활의달인 / 빵의 전쟁 1026회 부산 소금빵 / url=null
- `saengdal-suyeong-dongyang-sarada-namcheon` 동양사라다 남천본점 (광안리/베이커리/디저트) | tv | 생활의달인 / 989회 부산 샐러드빵 달인 / url=null
- `saengdal-suyeong-sushibashiku` 스시바시쿠 (광안리/일식) | tv | 생활의달인 / 1027회 오사카에서 온 초밥 달인 / url=null
- `saengdal-yeongdo-sato-bunsik` 사또분식 (영도/분식/길거리) | tv | 생활의달인 / 이색 김밥 달인 편 / url✓
- `sokssiwonhan-daegutang-haeundae` 속씨원한 대구탕 해운대 본점 (해운대/해산물) | tv | 맛있는녀석들 / 맛있는녀석들 / url✓
