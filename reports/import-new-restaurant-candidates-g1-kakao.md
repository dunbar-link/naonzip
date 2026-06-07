# 나온집 DATA-G3 Kakao 지오코딩 자동등록 결과 (최종 통합)

> 생성일: 2026-06-07 · Kakao REST 주소 지오코딩 후 DATA-G1 후보 13곳을 **비공개(is_published=false)** 자동 등록.
> 좌표 추정 금지(Kakao 공식 지오코딩 결과만). 두 번에 나눠 apply: 1차 12곳 + 2차 1곳(이재모피자, 부분날짜 null 처리 후).

## 요약

- Kakao REST API key: ✓ (존재, 값 미출력)
- 대상: 13곳
- geocoding 성공: **13/13** (전부 address 검색, confidence high, 부산 권역)
- geocoding 실패/애매: 0
- 신규 private 등록: **13** (inserted_private)
- skip: 0 / fail(최종): 0 (1차 이재모피자 날짜오류 → 수정 후 재등록 성공)
- 공개 식당 수: **78 유지**
- 전체 restaurants 수: **94 → 107 (+13)**
- appearance row: 13곳 각 1건 ✓
- 가격 검토 필요: 2곳 (백일평냉·담미옥, price_text="가격 확인 필요")
- 방영일 없음: 1곳 (이재모피자, "2025" 부분날짜 → null)
- DB 변경: restaurants +13 private INSERT + appearances +13 (그 외 무변경)
- is_published: 13곳 전부 false ✓

## 등록 결과 (13곳, 전부 inserted_private)

| slug | 식당명 | 지역 | lat | lng | method/conf | private | appearance | price재검토 | note |
|---|---|---|---:|---:|---|---|---|---|---|
| jeonhyun-gwangalli-biwa-suljan | 비와술잔 | 광안리 | 35.140208 | 129.109264 | address/high | false | inserted | false | |
| jeonhyun-yeongdo-watda-sikdang | 왔다식당 | 영도 | 35.094074 | 129.056330 | address/high | false | inserted | false | |
| jeonhyun-gwangalli-yeonhap-hoejip | 연합횟집 | 광안리 | 35.140460 | 129.109763 | address/high | false | inserted | false | |
| jeonhyun-nampo-yeosongje | 여송제 | 남포동 | 35.099318 | 129.027038 | address/high | false | inserted | false | 약중복(같은 기사 URL, 등록 허용) |
| jeonhyun-nampo-mullebanga-jeukseokgui | 물레방아 즉석구이 | 남포동 | 35.101373 | 129.036245 | address/high | false | inserted | false | |
| 2tv-sasang-yeonghui-halmae-jaecheopguk | 영희할매재첩국 | 사상 | 35.194384 | 128.985120 | address/high | false | inserted | false | |
| baekban-seogu-yetnal-guksujip | 옛날국수집 | 기타 | 35.099268 | 129.016100 | address/high | false | inserted | false | 서구 |
| baekban-nampo-subok-centa | 수복센타 | 남포동 | 35.098851 | 129.031456 | address/high | false | inserted | false | 2019 방영 |
| tzuyang-nampo-ijaemo-pizza | 이재모피자 본점 | 남포동 | 35.102103 | 129.030582 | address/high | false | inserted | false | 방영일 null(부분날짜) |
| tzuyang-haeundae-chopilsal | 초필살돼지구이 해운대본점 | 해운대 | 35.156647 | 129.146931 | address/high | false | inserted | false | |
| ansungjae-yeonje-mapobonga | 마포본가 | 연제 | 35.184343 | 129.082279 | address/high | false | inserted | false | 안성재 셰프 YT |
| saengdal-gwangalli-baegil-pyeongnaeng | 백일평냉 | 광안리 | 35.148563 | 129.111649 | address/high | false | inserted | **true** | 가격 확인 필요 |
| saengdal-seomyeon-dammiok | 담미옥 | 서면 | 35.151751 | 129.020608 | address/high | false | inserted | **true** | 가격 확인 필요 |

## 검증(SELECT)

- found 13/13, allPrivate=true, allHaveCoords(부산권역)=true, allHaveAppearance=true
- publishedCount 78(유지), totalCount 107(+13)
- 비공개라 공개 URL `/restaurants/{slug}` 는 404 정상(getRestaurantBySlug 가 is_published=true 만 조회)

## 후속(다음 Phase) 권장

- 공개 전 검수 후 공개 전환(DATA-F3/F4식 preflight)
- 가격 미확인 2곳(백일평냉·담미옥) price_text 보완
- 이재모피자 정확 방영일 확인 시 broadcast_date 보완
- 13곳 썸네일 보강(OPS-G2 스크립트, 운영자 사진)
