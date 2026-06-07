# 나온집 DATA-G4 — 신규 private 13곳 공개 전 preflight 검증

> 생성일: 2026-06-07 · 읽기 전용 SELECT 검증(DB 무변경). 대상: DATA-G3 비공개 등록 13곳.
> 부산 하드범위 lat 34.8~35.5 / lng 128.7~129.5. 권역 범위는 §6 기준 advisory.

## 요약
```text
대상: 13
존재: 13/13
is_published=false: 13/13
좌표 부산권역 정상: 13/13
필수필드 ok: 0/13
중복 unique/weak/strong: 8/5/0
appearance ok: 13/13
price 보완 필요: 2
broadcast_date 보완 필요: 1
thumbnail 없음: 13
publish_ready: 0
publish_ready_with_minor_review: 13
needs_fix_before_publish: 0
hold: 0
(참고) 전체 공개 식당 수: 78
```

## 검증 상세 (13곳)

| decision | slug | 식당명 | 좌표 | 필드 | 중복 | appearance | 가격 | 방영일 | 썸네일 | note |
|---|---|---|---|---|---|---|---|---|---|---|
| publish_ready_with_minor_review | jeonhyun-gwangalli-biwa-suljan | 비와술잔 | ok | missing:kakao_map_url | unique | ok(1) | ok | ok | missing | 썸네일 없음 |
| publish_ready_with_minor_review | jeonhyun-yeongdo-watda-sikdang | 왔다식당 | ok | missing:kakao_map_url | weak:shared_video_url(jeonhyun-gwangalli-yeonhap-hoejip) | ok(1) | ok | ok | missing | weak:shared_video_url(jeonhyun-gwangalli-yeonhap-hoejip); 썸네일 없음 |
| publish_ready_with_minor_review | jeonhyun-gwangalli-yeonhap-hoejip | 연합횟집 | ok | missing:kakao_map_url | weak:shared_video_url(jeonhyun-yeongdo-watda-sikdang) | ok(1) | ok | ok | missing | weak:shared_video_url(jeonhyun-yeongdo-watda-sikdang); 썸네일 없음 |
| publish_ready_with_minor_review | jeonhyun-nampo-yeosongje | 여송제 | ok | missing:kakao_map_url | weak:shared_video_url(jeonhyun-namgu-suta-hyemi-kalguksu) | ok(1) | ok | ok | missing | weak:shared_video_url(jeonhyun-namgu-suta-hyemi-kalguksu); 썸네일 없음 |
| publish_ready_with_minor_review | jeonhyun-nampo-mullebanga-jeukseokgui | 물레방아 즉석구이 | ok | missing:kakao_map_url | unique | ok(1) | ok | ok | missing | 썸네일 없음 |
| publish_ready_with_minor_review | 2tv-sasang-yeonghui-halmae-jaecheopguk | 영희할매재첩국 | ok | missing:kakao_map_url | unique | ok(1) | ok | ok | missing | 썸네일 없음 |
| publish_ready_with_minor_review | baekban-seogu-yetnal-guksujip | 옛날국수집 | ok | missing:kakao_map_url | unique | ok(1) | ok | ok | missing | 썸네일 없음 |
| publish_ready_with_minor_review | baekban-nampo-subok-centa | 수복센타 | ok | missing:kakao_map_url | unique | ok(1) | ok | ok | missing | 썸네일 없음 |
| publish_ready_with_minor_review | tzuyang-nampo-ijaemo-pizza | 이재모피자 본점 | ok | missing:kakao_map_url | unique | ok(1) | ok | null | missing | 방영일 null; 썸네일 없음 |
| publish_ready_with_minor_review | tzuyang-haeundae-chopilsal | 초필살돼지구이 해운대본점 | ok | missing:kakao_map_url | unique | ok(1) | ok | ok | missing | 썸네일 없음 |
| publish_ready_with_minor_review | ansungjae-yeonje-mapobonga | 마포본가 | ok | missing:kakao_map_url | unique | ok(1) | ok | ok | missing | 썸네일 없음 |
| publish_ready_with_minor_review | saengdal-gwangalli-baegil-pyeongnaeng | 백일평냉 | ok | missing:kakao_map_url | weak:shared_video_url(saengdal-seomyeon-dammiok) | ok(1) | placeholder | ok | missing | weak:shared_video_url(saengdal-seomyeon-dammiok); 가격 확인 필요; 썸네일 없음 |
| publish_ready_with_minor_review | saengdal-seomyeon-dammiok | 담미옥 | ok | missing:kakao_map_url | weak:shared_video_url(saengdal-gwangalli-baegil-pyeongnaeng) | ok(1) | placeholder | ok | missing | weak:shared_video_url(saengdal-gwangalli-baegil-pyeongnaeng); 가격 확인 필요; 썸네일 없음 |

> **필드 주석 — kakao_map_url 빈값은 공개 차단급이 아님.**
> 13곳 전부 `kakao_map_url` 이 비어 있으나, 공개 상세페이지 `ShareButtons.buildKakaoUrl` 는
> `kakao_map_url` 이 없으면 `https://map.kakao.com/link/map/{이름},{lat},{lng}` 를 좌표로 자동 생성한다.
> 13곳 전부 좌표가 정상이므로 **카카오맵 버튼은 정상 동작**한다. NOT NULL 컬럼도 아니다.
> 그 외 NOT NULL/핵심 필드(slug·name·area·category·address·main_menu·price_text·source_type·source_title·lat·lng·video_url)는 13곳 모두 충족.
> → 따라서 kakao_map_url 누락은 `needs_fix` 가 아닌 `minor_review`(공개 후 보강 권장)로 분류.

> **중복 주석 — strong 0건.** weak 5건은 같은 기사/영상 URL 을 공유한 묶음(왔다식당↔연합횟집, 여송제↔수타혜미칼국수, 백일평냉↔담미옥)으로,
> 식당명·주소가 모두 달라 실제 중복이 아니다. slug/name/normName/address exact 중복은 0건.

## 좌표 sanity (권역 대조)

| slug | 식당명 | area | lat | lng | 부산범위 | 권역 advisory |
|---|---|---|---:|---:|---|---|
| jeonhyun-gwangalli-biwa-suljan | 비와술잔 | 광안리 | 35.1402076759138 | 129.109263956848 | OK | OK(광안리) |
| jeonhyun-yeongdo-watda-sikdang | 왔다식당 | 영도 | 35.0940741825936 | 129.056330271999 | OK | OK(영도) |
| jeonhyun-gwangalli-yeonhap-hoejip | 연합횟집 | 광안리 | 35.1404596901443 | 129.109762929823 | OK | OK(광안리) |
| jeonhyun-nampo-yeosongje | 여송제 | 남포동 | 35.0993184361462 | 129.027038390805 | OK | OK(남포동) |
| jeonhyun-nampo-mullebanga-jeukseokgui | 물레방아 즉석구이 | 남포동 | 35.1013730572428 | 129.036245143996 | OK | OK(남포동) |
| 2tv-sasang-yeonghui-halmae-jaecheopguk | 영희할매재첩국 | 사상 | 35.1943840522469 | 128.985120470772 | OK | OK(사상) |
| baekban-seogu-yetnal-guksujip | 옛날국수집 | 기타 | 35.099268125477 | 129.016099525161 | OK | OK(서구) |
| baekban-nampo-subok-centa | 수복센타 | 남포동 | 35.0988509225395 | 129.031456197999 | OK | OK(남포동) |
| tzuyang-nampo-ijaemo-pizza | 이재모피자 본점 | 남포동 | 35.1021026782328 | 129.030582344104 | OK | OK(남포동) |
| tzuyang-haeundae-chopilsal | 초필살돼지구이 해운대본점 | 해운대 | 35.1566471472902 | 129.146930632686 | OK | OK(해운대) |
| ansungjae-yeonje-mapobonga | 마포본가 | 연제 | 35.184342930923 | 129.082279198059 | OK | OK(연제) |
| saengdal-gwangalli-baegil-pyeongnaeng | 백일평냉 | 광안리 | 35.1485634371324 | 129.111648737636 | OK | OK(광안리) |
| saengdal-seomyeon-dammiok | 담미옥 | 서면 | 35.1517508521743 | 129.020608015723 | OK | OK(서면) |

## 분류 기준
- publish_ready: 좌표(부산)·필수필드·appearance·중복 모두 정상 + 가격/방영일/썸네일도 충족
- publish_ready_with_minor_review: 핵심은 정상, 가격/방영일/썸네일만 미흡 → 공개 가능
- needs_fix_before_publish: 좌표/필수필드/appearance/강중복 문제 → 공개 전 수정
- hold: 상호/출처/영업상태 의심