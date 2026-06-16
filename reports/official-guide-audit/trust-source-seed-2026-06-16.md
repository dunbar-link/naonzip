# 공식 출처 trust_sources 연결 결과 — 11건 (2026-06-16)

> read-only 조사 후 trust_sources INSERT 11건. restaurants row 무수정. schema/CHECK 변경 0.
> idempotent: (restaurant_id, source_name) 기준 중복 방지(재실행 시 추가 INSERT 0).

## 결과 요약

- 연결 대상: 11곳 (2026 부산의 맛 10 + 미쉐린 가이드 부산 2026 1)
- 정확 매칭: 11 / REVIEW(미매칭): 0
- 신규 INSERT: 11 / 기존 중복 skip: 0
- 기존 restaurants 수정: 0 (source_type tv 73 / youtube 35 / guide 1 유지)
- source_kind: 전부 `guide`(기존 허용값) · is_public: true · verified_at: 2026-06-16

## 연결 식당 (각 1건)

### 2026 부산의 맛 (10) — source_name='2026 부산의 맛'
| 식당 | slug | 대표 source_type |
|---|---|---|
| 고등어다찌 연산본점 | baekban-yeonje-godeungeo-datchi | tv |
| 국제밀면 본점 | saengdal-yeonje-gukje-milmyeon | tv |
| 물꽁식당 | mulkkong-sikdang | tv |
| 백일평냉 | saengdal-gwangalli-baegil-pyeongnaeng | tv |
| 신발원 | samdaecheonwang-shinbalwon | tv |
| 쌍둥이돼지국밥 본점 | saengdal-ssangdungyi-doejigukbap | tv |
| 원조할매낙지 | samdae-seomyeon-wonjo-halmae-nakji | tv |
| 해변짚불곰장어 | bapsang-gijang-haebyeon-jipbul-gomjangeo | tv |
| 김유순대구뽈찜전문점 | kimyusun-daegu-bbol-jjim | youtube |
| 이재모피자 본점 | tzuyang-nampo-ijaemo-pizza | youtube |

- source_url: https://www.visitbusan.net/board/download.do?boardId=BBS_0000007&dataSid=5445&fileSid=10322

### 미쉐린 가이드 부산 2026 (1) — source_name='미쉐린 가이드 부산 2026', trust_label='빕 구르망'
| 식당 | slug | 대표 source_type |
|---|---|---|
| 뫼밀집 | michelin-haeundae-moemiljip | guide |

- source_url: https://guide.michelin.com/kr/ko/article/michelin-guide-ceremony/korea-bib-gourmand-2026

## ⚠ 예상 외 발견 — 기존 trust_sources 6행 (이번 작업 무관)

trust_sources 총 행은 **17**(내 11 + 기존 6). 기존 6행은 **2026-06-09 생성**(이번 작업 1주일 전 시드,
TRUST-H4 단계 테스트 데이터로 추정). 이번 작업과 무관해 **수정하지 않음**.

| 식당 | source_name | kind | is_public | verified_at |
|---|---|---|---|---|
| 할매재첩국 | 운영자 확인 | operator | true | (null) |
| 백일평냉 | 미쉐린 가이드(빕구르망) | guide | **false** | 2026-06-09 |
| 담미옥 | 미쉐린 가이드(빕구르망) | guide | **false** | 2026-06-09 |
| 해운대 암소갈비집 | 미쉐린 가이드(등재) | guide | **false** | 2026-06-09 |
| 해운대 암소갈비집 | 비짓부산(부산 공식 관광) | local | true | 2026-06-09 |
| 이재모피자 본점 | 비짓부산(부산 공식 관광) | local | true | 2026-06-09 |

- 직전 감사에서 "trust_sources 0행"으로 보고했으나, 그것은 count 쿼리(head:true) 사용 오류였고
  실제로는 6행이 존재했다. **정정**.
- 내 11건과 source_name 이 달라 중복 아님(백일평냉·이재모피자는 기존 출처 + 내 출처 별개).
- 참고(검토용, 이번 미반영):
  - 기존 백일평냉 "미쉐린 빕구르망"(pub=false) + 내 "2026 부산의 맛"(pub=true) → 백일평냉이 미쉐린·부산공식 동시일 수.
  - 이재모피자: 기존 "비짓부산"(local) + 내 "2026 부산의 맛"(guide) — 둘 다 부산공식 계열(자료는 다름). 의미 일부 겹침.
  - 기존 미쉐린 3행이 pub=false(비공개)라 공개 화면엔 미표시. 공개 전환 여부는 별도 판단.

## 검증

- trust_sources 총 17 (내 11 신규 + 기존 6)
- 내 11곳 각 1건 연결 확인(백일평냉·이재모는 기존 별개 source_name 추가 보유)
- 미쉐린(이번): 1 / 부산공식(이번): 10
- orphan trust source: 0 (전부 유효 restaurant_id) / 기존 restaurants 수정: 0
- source_type 집계 무변화: tv 73 / youtube 35 / guide 1
