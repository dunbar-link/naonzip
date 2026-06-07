# 나온집 DATA-G5 — 신규 private 13곳 보완 + 공개 전환

> 생성일: 2026-06-07 · mode=APPLY
> 허용 쓰기: 가격 2곳(placeholder→보완) / 방영일 1곳(이재모피자 2025-06-15, YouTube 직접확인) / 13곳 공개 전환.
> appearance row 미수정. Storage 미변경.

## 요약
```text
preflight: 13/13 통과
price 보완: 2
date 보완: 1
공개 전환: 13
공개 식당 수: 78 → 91
전체 restaurants 수: 107 → 107
```

## 공개 전환 결과 (13곳)

| status | slug | 식당명 | before | after | price_before | price_after | date_before | date_after | thumbnail | note |
|---|---|---|---|---|---|---|---|---|---|---|
| published | jeonhyun-gwangalli-biwa-suljan | 비와술잔 | false | true | 이모카세 35,000원(스페셜 50,000원) | 이모카세 35,000원(스페셜 50,000원) | 2024-12-13 | 2024-12-13 | missing |  |
| published | jeonhyun-yeongdo-watda-sikdang | 왔다식당 | false | true | 전골 1인 14,000원 / 스지수육(소) 45,000원 | 전골 1인 14,000원 / 스지수육(소) 45,000원 | 2024-11-29 | 2024-11-29 | missing |  |
| published | jeonhyun-gwangalli-yeonhap-hoejip | 연합횟집 | false | true | 코스 35,000원~ / 회세트(2인) 55,000원 | 코스 35,000원~ / 회세트(2인) 55,000원 | 2024-11-29 | 2024-11-29 | missing |  |
| published | jeonhyun-nampo-yeosongje | 여송제 | false | true | (소) 35,000원 / (대) 50,000원 | (소) 35,000원 / (대) 50,000원 | 2024-12-13 | 2024-12-13 | missing |  |
| published | jeonhyun-nampo-mullebanga-jeukseokgui | 물레방아 즉석구이 | false | true | 안금무 32,000원 | 안금무 32,000원 | 2024-11-29 | 2024-11-29 | missing |  |
| published | 2tv-sasang-yeonghui-halmae-jaecheopguk | 영희할매재첩국 | false | true | 재첩국 약 7,000원 | 재첩국 약 7,000원 | 2026-04-07 | 2026-04-07 | missing |  |
| published | baekban-seogu-yetnal-guksujip | 옛날국수집 | false | true | 국수 5,000원 / 사골설렁탕 11,000원 | 국수 5,000원 / 사골설렁탕 11,000원 | 2024-04-07 | 2024-04-07 | missing |  |
| published | baekban-nampo-subok-centa | 수복센타 | false | true | 스지어묵탕 38,000원 / 다타키 29,000원 | 스지어묵탕 38,000원 / 다타키 29,000원 | 2019-06-06 | 2019-06-06 | missing |  |
| published_with_date_fix | tzuyang-nampo-ijaemo-pizza | 이재모피자 본점 | false | true | 피자 25,000~29,000원 / 김치볶음밥 11,000원 | 피자 25,000~29,000원 / 김치볶음밥 11,000원 | (null) | 2025-06-15 | missing |  |
| published | tzuyang-haeundae-chopilsal | 초필살돼지구이 해운대본점 | false | true | 껍데기 9,500원 / 오겹살 12,000원 | 껍데기 9,500원 / 오겹살 12,000원 | 2022-07-09 | 2022-07-09 | missing |  |
| published | ansungjae-yeonje-mapobonga | 마포본가 | false | true | 돼지갈비 1근(600g) 30,000원 | 돼지갈비 1근(600g) 30,000원 | 2025-12-11 | 2025-12-11 | missing |  |
| published_with_price_fix | saengdal-gwangalli-baegil-pyeongnaeng | 백일평냉 | false | true | 가격 확인 필요 | 평양냉면 13,000원 / 이북만두 10,000원 | 2025-07-28 | 2025-07-28 | missing |  |
| published_with_price_fix | saengdal-seomyeon-dammiok | 담미옥 | false | true | 가격 확인 필요 | 평양냉면(물) 13,000원 / 녹두전 8,000원 | 2025-07-28 | 2025-07-28 | missing |  |

## 사후 SELECT 검증

| slug | 식당명 | is_published | price_text | broadcast_date | thumbnail |
|---|---|---|---|---|---|
| jeonhyun-gwangalli-yeonhap-hoejip | 연합횟집 | true | 코스 35,000원~ / 회세트(2인) 55,000원 | 2024-11-29 | missing |
| jeonhyun-nampo-yeosongje | 여송제 | true | (소) 35,000원 / (대) 50,000원 | 2024-12-13 | missing |
| 2tv-sasang-yeonghui-halmae-jaecheopguk | 영희할매재첩국 | true | 재첩국 약 7,000원 | 2026-04-07 | missing |
| baekban-seogu-yetnal-guksujip | 옛날국수집 | true | 국수 5,000원 / 사골설렁탕 11,000원 | 2024-04-07 | missing |
| tzuyang-haeundae-chopilsal | 초필살돼지구이 해운대본점 | true | 껍데기 9,500원 / 오겹살 12,000원 | 2022-07-09 | missing |
| ansungjae-yeonje-mapobonga | 마포본가 | true | 돼지갈비 1근(600g) 30,000원 | 2025-12-11 | missing |
| saengdal-gwangalli-baegil-pyeongnaeng | 백일평냉 | true | 평양냉면 13,000원 / 이북만두 10,000원 | 2025-07-28 | missing |
| saengdal-seomyeon-dammiok | 담미옥 | true | 평양냉면(물) 13,000원 / 녹두전 8,000원 | 2025-07-28 | missing |
| tzuyang-nampo-ijaemo-pizza | 이재모피자 본점 | true | 피자 25,000~29,000원 / 김치볶음밥 11,000원 | 2025-06-15 | missing |
| jeonhyun-gwangalli-biwa-suljan | 비와술잔 | true | 이모카세 35,000원(스페셜 50,000원) | 2024-12-13 | missing |
| jeonhyun-yeongdo-watda-sikdang | 왔다식당 | true | 전골 1인 14,000원 / 스지수육(소) 45,000원 | 2024-11-29 | missing |
| jeonhyun-nampo-mullebanga-jeukseokgui | 물레방아 즉석구이 | true | 안금무 32,000원 | 2024-11-29 | missing |
| baekban-nampo-subok-centa | 수복센타 | true | 스지어묵탕 38,000원 / 다타키 29,000원 | 2019-06-06 | missing |

## 비고
- 이재모피자: restaurants.broadcast_date 만 보완(=2025-06-15). 표시·정렬 중 목록 정렬은 이 컬럼을 사용하나, 카드/상세 날짜 텍스트는 appearance 값을 우선하므로(appearance 미수정) 추후 appearance backfill 전까지 날짜 텍스트는 비표시일 수 있음.
- 13곳 thumbnail 없음 — 공개 후 홈/목록 상단(영희할매재첩국·마포본가·백일평냉·담미옥)은 기본 일러스트 fallback. 이미지 보강은 다음 Phase.