# 가격 교정 후보 7곳 반영 결과 — 2026-06-15

> 2026-06-15 주소·가격 상위 15곳 감사의 `PRICE_CORRECTION_CANDIDATE` 7곳에 대해 **`price_text` 필드만** 운영 DB에 반영.
> 각 UPDATE는 id+slug+기대 before 3중 조건, 영향행 정확히 1. price_text 외 필드 무변경.
> 변경 전 전체 row 백업: `reports/data-audit/price-exact-7-before-2026-06-15.json`

## Summary

- 대상: 7
- 검증 통과(READY): 7
- 반영 성공(APPLIED): 7
- REVIEW_HOLD: 0
- 실패: 0
- 수정 필드: `price_text` (단일)
- 앱 코드 변경: 0

## 식당별 결과

| 식당 | slug | price_text before | price_text after | 출처 최신성 | 영향행 | 결과 |
|---|---|---|---|---|---:|---|
| 속씨원한 대구탕 해운대 본점 | sokssiwonhan-daegutang-haeundae | 대구탕 14,000원 | 대구탕 15,000원 | 높음(다이닝코드 해운대본점, 2026-05) | 1 | APPLIED |
| 사또분식 | saengdal-yeongdo-sato-bunsik | 메뉴별 상이 (가격 확인 필요) | 당면 비빔김밥 6,500원 / 국수 6,000원 | 보통(인스타 reel·식신, 2024~2025) | 1 | APPLIED |
| 삼미집 | oneuln-nampo-sammi-jip | 소갈비찜탕, 소갈비찜, 닭계장 | 소갈비찜탕 9,000원 / 소갈비찜 30,000원~ / 닭계장 7,000원 | 보통(다이닝코드·생생정보) | 1 | APPLIED |
| 한약방돼지국밥 형제식품 | hanyakbang-gukbap-hyeongje-food | 1만원대 | 수육국밥 한상 10,000원 / 얼큰국밥 한상 12,000원 | 보통~높음(다이닝코드 메뉴판) | 1 | APPLIED |
| 피넛빵앗간 | saengdal-sasang-peanut-bbangatgan | 메뉴별 상이 (가격 확인 필요) | 플레인 소금빵 3,300원~ | 높음(생활의 달인 1026회, 2026-04) | 1 | APPLIED |
| 불백고수락 센텀본점 | saengdal-centum-bulbaek-gosurak | 돈카츠, 불백, 덮밥류 | 소고기불백 8,000원~ / 고수락돈카츠 10,000원 / 눈꽃치즈돈카츠 12,000원 | 높음(공식 Threads·다이닝코드) | 1 | APPLIED |
| 궁중해물탕 조씨집 대연본점 | baekban-namgu-chossijib | 메뉴별 상이 (가격 확인 필요) | 궁중해물탕(소) 35,000원~ / 백년해물탕(소) 42,000원 / 모듬회(소) 50,000원~ | 보통~높음(다이닝코드·공식fordining·백반기행, 2025-02) | 1 | APPLIED |

- 7곳 모두 반영 전 현재값이 기대 before와 정확히 일치(READY) → 최근 재교정 흔적 없음 확인.
- 독립 SELECT 재검증: 7곳 모두 price_text만 변경, 그 외 12개 필드(name·address·main_menu·kakao_map_url·phone·lat·lng·area·category·thumbnail·is_published·id) 전부 유지.

## 미수정 보호 대상 (이번 반영 제외 — 전 필드 미변경 확인)

| 식당 | slug | 사유 | 현재 price_text(유지) |
|---|---|---|---|
| 내호냉면 | naeho-naengmyeon | 주소·Kakao·좌표 통합 교정 별도 + 밀면 단가 충돌(REVIEW) | 밀면 9,000원 |
| 담미옥 | saengdal-seomyeon-dammiok | 개금→중구 이전, 주소·전화·Kakao·좌표·가격 통합 교정 별도 | 평양냉면(물) 13,000원 / 녹두전 8,000원 |
| 스시바시쿠 | saengdal-suyeong-sushibashiku | 오마카세 단가 비공개(REVIEW) | 오마카세 / 매장 문의 |
| 일광당 | saengdal-gijang-ilgwangdang | 가격 5,500/6,000 충돌 + 좌표 1.7km(REVIEW) | 찐빵 5개 6,000원 / 만두 6개 6,000원 |

## DB 전체 집계 (반영 후 독립 SELECT)

- 전체 restaurants: 107 (불변)
- 공개 restaurants: 90 (불변)
- 공개 thumbnail 보유: 90
- 공개 phone 누락: 13 (불변)
- 공개 kakao_map_url 누락: 1 (담미옥, 불변)

## 후속 작업 (별도 승인건)

- 내호냉면: 주소(장고개로 11-5 → 우암번영로26번길 17)·Kakao(place 11023144)·좌표 통합 교정
- 담미옥: 이전 정보(중구 해관로 82-1, place 1712286950) 주소·전화·Kakao·좌표·가격 통합 교정
- 속씨원한·삼미집·한약방·구로마쯔·토다공원·깡돼후: Kakao 검색링크 → place URL 전환
- 사또분식: 주소 번지 37/39 추가 확인 후 결정
- REVIEW(스시바시쿠·일광당) 가격: 공식 메뉴판 확보 후 재검토. 일광당 좌표 1.7km 별도 교정.
