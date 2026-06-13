# 공개 phone 누락 식당 상위 15곳 감사 — 2026-06-13

read-only(SELECT + Kakao Local API + 웹 출처 교차). DB 미수정.

## 요약
- 공개 phone 누락 전체: 43
- 상위 감사 대상: 15
- EXACT_MATCH: 8
- REVIEW: 6
- NO_MATCH: 1
- CLOSED_OR_MOVED: 0
- BLOCKED: 0
- DB 수정: 없음
- 앱 코드 변경: 없음

## 우선순위 선정 기준
- 적용 규칙(점수): kakao_map_url 보유 +3, trust source 보유 +2, 주요지역(해운대/광안리/남포동/서면) +1. 동점은 broadcast_date 최신순(목록 노출 정렬 `compareForList`와 동일), 그다음 slug.
- 상위 15곳 선정 이유: 지도가 연결돼 전화만 채우면 상세페이지·CTA 완성도가 바로 오르는 식당 우선. 전부 유명 출처(쯔양·전현무계획·성시경·백반기행·수요미식회·생활의달인 등) + 주요 관광권역.
- 후순위·제외: 비공개 식당 제외(43곳 모두 공개). broadcast_date 없는 식당, 지방 비주요 권역, 노점/정체 불명은 후순위.

## EXACT_MATCH (8곳 — 전화 Kakao + 웹 2출처 동일)
| 순위 | 식당명 | slug | 주소 | 확인 전화 | 주요 출처 | 반영 가능 |
| -: | --- | --- | --- | --- | --- | --- |
| 4 | 물꽁식당 | mulkkong-sikdang | 중구 흑교로59번길 3 | 051-257-3230 | Kakao·다이닝·망고·비짓부산 | phone만 가능(주소·지도 별도) |
| 6 | 빨간떡볶이 | tzuyang-haeundae-ppalgan-tteokbokki | 해운대 우동1로20번길 74 | 051-743-2814 | Kakao·다이닝·식신 | 가능(주소 표기 별도확인) |
| 8 | 여송제 | jeonhyun-nampo-yeosongje | 중구 광복로18번길 5 | 051-246-2111 | Kakao·다이닝 | 가능 |
| 9 | 미쌤쌀빵 | saengdal-haeundae-missaem-ssalbbang | 해운대 센텀중앙로 145 | 051-743-6778 | Kakao·다이닝 | 가능 |
| 11 | 물레방아 즉석구이 | jeonhyun-nampo-mullebanga-jeukseokgui | 중구 중앙대로41번길 11-1 | 051-245-1195 | Kakao·다이닝·비짓부산·식신 | 가능 |
| 13 | 진미언양불고기 | sungsik-gwangalli-jinmi-eonyang-bulgogi | 수영구 남천바다로33번길 7 | 051-753-1632 | Kakao·식신·다이닝 | 가능 |
| 14 | 수복센타 | baekban-nampo-subok-centa | 중구 남포길 25-3 | 051-245-9986 | Kakao·식신·트립닷컴 | 가능 |
| 15 | 수변최고돼지국밥 민락본점 | subyeon-choego-doejigukbap-minrak | 수영구 광안해변로370번길 9-32 | 051-754-9222 | Kakao·구석구석·다이닝 | 가능(0507 안심번호 아닌 지역번호) |

## REVIEW (6곳)
| 순위 | 식당명 | slug | 전화 후보 | 충돌 | 추가 확인 |
| -: | --- | --- | --- | --- | --- |
| 1 | 백일평냉 | saengdal-gwangalli-baegil-pyeongnaeng | 051-625-5515(Kakao) / 0507-1419-5515(식신) | 지역번호 vs 안심번호 | 네이버지도 지역번호 확인 |
| 2 | 이재모피자 본점 | tzuyang-nampo-ijaemo-pizza | 051-255-9494(Kakao) / 051-245-1478(식신·비짓·캐치·나무위키) | 지역번호 2개 충돌 | 본점 회선 확인 |
| 3 | 한약방돼지국밥 형제식품 | hanyakbang-gukbap-hyeongje-food | 051-646-3102(Kakao) / 0507-1329-5026(다이닝·캐치) | 지역 vs 안심 + 주소 지번/도로명 | 도로명 매칭·지역번호 확인 |
| 5 | 백화양곱창 1호 | baekhwa-yanggopchang-1ho | 051-245-0105(Kakao·다이닝) / 051-257-3352(식신) | 식신 번호 충돌 | 051-245-0105 우세, 재확인 |
| 7 | 비와술잔 | jeonhyun-gwangalli-biwa-suljan | 051-621-2540(Kakao 단독) | 2차 출처 미확보 | 네이버지도 교차 |
| 10 | 블랑제리 라센 | saengdal-gwangalli-boulangerie-lassence | 051-710-1417(Kakao 단독) | 2차 출처 미확보 | 네이버지도 교차 |

## NO_MATCH (1곳)
| 순위 | 식당명 | slug | 조사 출처 | 결과 |
| -: | --- | --- | --- | --- |
| 12 | 남포동 씨앗호떡 | tzuyang-nampo-ssiat-hotteok | Kakao·다이닝·한국민족문화대백과 | BIF광장 씨앗호떡은 거리 노점 통칭, 단일 업소·전화 특정 불가. 노점 특성상 전화 없음 |

## CLOSED_OR_MOVED (0곳)
- 해당 없음. 상위 15곳 모두 영업 확인.

## 예상 before / after (EXACT_MATCH 8곳만)
| 식당 | slug | phone before | recommended phone | 출처 |
| --- | --- | --- | --- | --- |
| 물꽁식당 | mulkkong-sikdang | null | 051-257-3230 | Kakao+다이닝+망고+비짓부산 |
| 빨간떡볶이 | tzuyang-haeundae-ppalgan-tteokbokki | null | 051-743-2814 | Kakao+다이닝+식신 |
| 여송제 | jeonhyun-nampo-yeosongje | null | 051-246-2111 | Kakao+다이닝 |
| 미쌤쌀빵 | saengdal-haeundae-missaem-ssalbbang | null | 051-743-6778 | Kakao+다이닝 |
| 물레방아 즉석구이 | jeonhyun-nampo-mullebanga-jeukseokgui | null | 051-245-1195 | Kakao+다이닝+비짓부산+식신 |
| 진미언양불고기 | sungsik-gwangalli-jinmi-eonyang-bulgogi | null | 051-753-1632 | Kakao+식신+다이닝 |
| 수복센타 | baekban-nampo-subok-centa | null | 051-245-9986 | Kakao+식신+트립닷컴 |
| 수변최고돼지국밥 민락본점 | subyeon-choego-doejigukbap-minrak | null | 051-754-9222 | Kakao+구석구석+다이닝 |

## 다음 단계
- EXACT_MATCH 8곳만 사용자 승인 후 phone 반영. (물꽁식당은 phone만 반영, 주소·kakao_map_url은 별도 교정 작업으로 분리)
- REVIEW 6곳은 네이버지도 등 2차 출처로 충돌/안심번호 해소 후 반영.
- NO_MATCH(씨앗호떡)는 현 상태 유지.
- 전체 43곳을 자동 수정하지 않음. 다음 우선순위 16~43위는 별도 감사.
