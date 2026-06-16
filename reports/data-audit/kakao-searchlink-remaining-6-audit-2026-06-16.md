# Kakao 검색링크 신규 발견 6곳 감사 — 2026-06-16

> 직전 EXACT4 반영(d9fc300) 중 발견된, top15 감사 범위 밖의 검색링크 6곳을 Kakao Local API로 재검증. **read-only — DB/앱 미수정**. 기존 REVIEW 2곳(구로마쯔·토다공원)은 제외.

## Summary

- 공개 검색링크 잔여: 8
- 기존 REVIEW 제외: 2 (구로마쯔·토다공원)
- 신규 조사 대상: 6
- EXACT_MATCH: 4
- REVIEW: 2
- NO_MATCH: 0
- CLOSED_OR_MOVED: 0
- BLOCKED: 0
- DB 수정: 0
- 앱 코드 변경: 0

## 전수 재확인

- 공개 검색링크 총수: 8 (place.map.kakao.com/{id} 아닌 Kakao URL — 전수 90곳 SELECT 확인)
- 기존 REVIEW: saengdal-jeonpo-toda-park(토다공원), 2tv-gwangan-kuromatsu(구로마쯔) — 이번 미조사
- 신규 대상: 할매김밥·회국수할매집·금신전선 상유십이·합천일류돼지국밥·금죽헌 금정산성점·불백고수락 센텀본점
- 누락·중복: 없음 (8 = 2 + 6)

## 대상별 현재 상태

| 식당 | slug | 현재 URL 형태 | 현재 좌표 | 주소 | 전화 |
|---|---|---|---|---|---|
| 회국수할매집 | hoeguksu-halmaejip | 검색링크(itemId=11260858) | 35.160999, 129.055556 | 서면문화로 5 | 051-817-9260 |
| 금신전선 상유십이 | live-today-suyeong-geumsin-jeonseon-sangyusibi | link/search | 35.1563, 129.1148 | 수영로582번길 28 | 0507-1426-2201 |
| 합천일류돼지국밥 | ddoganjip-hapcheon-ilryu-dwaeji-gukbap | kko.to 단축 | 35.1633, 128.9818 | 광장로 34 | 051-317-2478 |
| 불백고수락 센텀본점 | saengdal-centum-bulbaek-gosurak | link/search | 35.1739, 129.1263 | 센텀중앙로 90 205호 | 0507-1354-7574 |
| 금죽헌 금정산성점 | 2tv-gumjeong-geumjukheon | link/search | 35.24418, 129.05671 | 산성로 531 1층 | 0507-1347-5448 |
| 할매김밥 | live-today-donggu-halme-gimbap | link/search | 35.12985, 129.04645 | 동구 고관로 106 상가아파트 | 0507-1349-0547 |

## EXACT_MATCH (4)

| 식당 | place ID | 권장 URL | 좌표(lat/lng) | 핵심 근거 | 반영 가능 |
|---|---:|---|---|---|---|
| 회국수할매집 | 11260858 | https://place.map.kakao.com/11260858 | 35.1582241900753 / 129.057583103138 | name·도로명(서면문화로 5)·전화(051-817-9260) 일치, DB itemId 동일, 단일 | 예 |
| 금신전선 상유십이 | 1905565479 | https://place.map.kakao.com/1905565479 | 35.1574229558888 / 129.114560618088 | name·도로명(수영로582번길 28)·전화(0507-1426-2201 DB와 정확 일치) 일치, 단일 | 예 |
| 합천일류돼지국밥 | 10928210 | https://place.map.kakao.com/10928210 | 35.162262056483875 / 128.98007978034923 | name·도로명(광장로 34)·전화(051-317-2478) 일치, 주차장 후보 배제. DB는 kko.to 단축 | 예 |
| 불백고수락 센텀본점 | 987828015 | https://place.map.kakao.com/987828015 | 35.1754435363346 / 129.126430643978 | name·도로명(센텀중앙로 90) 일치·단일. Kakao 전화 051-781-7574=공식 Threads 일치(신뢰출처 보강) | 예 |

- 4곳 모두 부산 범위 내 좌표, 단일·확정, 영업중. 좌표 DB-place 거리 127~359m → place 좌표로 마커 정확도 향상.
- 불백고수락: DB phone(0507 안심번호)은 Kakao(051-781-7574 지역번호)와 표기 다르나, Kakao 전화가 공식 Threads(직전 가격감사 확인)와 일치하여 place 확정. **phone·price_text·주소는 이번 범위 밖(URL·좌표만 반영 대상)**.

## REVIEW (2)

| 식당 | 유력 후보 | 충돌 내용 | 추가 확인 |
|---|---|---|---|
| 금죽헌 금정산성점 | 1229339566 (산성로 531, dist 3m) | DB phone **0507-1347-5448** vs Kakao **0503-7153-6423** — 둘 다 안심(가상)번호, 직접 교차 불가 | 실번호 확인. name·도로명 완전일치+3m(동일좌표)+단일+생생정보 출연으로 place 매우 유력 — 실번호 확인 시 즉시 EXACT 승격 |
| 할매김밥 | 16286242 (고관로 106, dist 177m) | DB phone **0507-1349-0547**(안심) vs Kakao **051-467-0547**(지역) — 직접 교차 불가. '할매김밥' 동명 18곳 검색(노이즈) | 실번호 확인. 도로명(고관로 106)+다이닝코드 주소(고관로 106 상가아파트=DB 동일) 교차로 place 유력 — 실번호 확인 시 EXACT 승격 |

- 두 REVIEW 모두 place 후보 유력하나, phone이 안심(가상)번호라 직접 교차 미완 → 자동 EXACT 보류. phone은 이번 범위 밖이지만 place 동일성 판단에 필요해 기록.

## NO_MATCH / CLOSED_OR_MOVED / BLOCKED

- 해당 없음 (0건). 6곳 모두 Kakao place 후보 + 영업중 확인.

## 예상 before / after (EXACT_MATCH만)

| 식당 | URL before | URL after | lat/lng before | lat/lng after |
|---|---|---|---|---|
| 회국수할매집 | 검색링크(itemId=11260858) | https://place.map.kakao.com/11260858 | 35.160999 / 129.055556 | 35.1582241900753 / 129.057583103138 |
| 금신전선 상유십이 | link/search | https://place.map.kakao.com/1905565479 | 35.1563 / 129.1148 | 35.1574229558888 / 129.114560618088 |
| 합천일류돼지국밥 | kko.to 단축 | https://place.map.kakao.com/10928210 | 35.1633 / 128.9818 | 35.162262056483875 / 128.98007978034923 |
| 불백고수락 센텀본점 | link/search | https://place.map.kakao.com/987828015 | 35.1739 / 129.1263 | 35.1754435363346 / 129.126430643978 |

## 보호 대상

- 구로마쯔(2tv-gwangan-kuromatsu): 기존 REVIEW 유지, 미조사·미변경
- 토다공원(saengdal-jeonpo-toda-park): 기존 REVIEW 유지, 미조사·미변경

## 사용자 영향

- 현재 검색링크는 "카카오맵" CTA 클릭 시 검색 결과 목록이 먼저 떠 정확한 상세로 직행 못 함. place URL은 해당 식당으로 직행.
- 특히 **할매김밥**은 Kakao에 동명 18곳 → 검색링크 시 다른 김밥집 오인 위험 최대(단 REVIEW — phone 확인 후 반영 권장).
- **합천일류**(kko.to 단축링크)·**회국수할매집**(itemId 쿼리)도 정확 place URL 전환 시 안정성↑.
- 좌표: 검색링크 기반 DB 좌표가 Kakao 공식과 3~359m 차이 → 지도 마커 정확도 개선(EXACT 4곳).
