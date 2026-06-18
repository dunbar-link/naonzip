# 우체국 추천 맛집가이드 2026 — 부산권 92곳 감사

> read-only 감사. DB/Storage/앱코드 변경 없음. 원본 PDF·렌더·API 덤프는 저장소 미포함.

## 개요
- 발행처: 부산지방우정청 / 발행일: 2026-06 / 전체범위: 부산·울산·경남 (이번 조사: **부산만**)
- 부산권 PDF 페이지: 4~33 / 추출 **92곳** (울산권 34~40·경남권 41~84 제외, 혼입 0)
- 추출 방식: pdfplumber 좌표·폰트 기반 (식당명 size 18.5 앵커, 페이지=2열×2행 박스). pdftotext 는 폰트 인코딩 오매핑으로 폐기, pypdf/pdfplumber 정상.
- 공식 출처명: **우체국 추천 맛집가이드 2026** / 사용자 표시명(별칭): **우슐랭** / source_kind: guide / 내부 필터키: postoffice

## 우체국별 수량 (추출/기대 — 전량 일치)
| 우체국 | 추출/기대 | 일치 |
|---|---|---|
| 부산우체국 | 4 / 4 | OK |
| 동래우체국 | 8 / 8 | OK |
| 남부산우체국 | 8 / 8 | OK |
| 부산사상우체국 | 6 / 6 | OK |
| 부산금정우체국 | 6 / 6 | OK |
| 부산사하우체국 | 4 / 4 | OK |
| 해운대우체국 | 8 / 8 | OK |
| 부산진우체국 | 8 / 8 | OK |
| 북부산우체국 | 8 / 8 | OK |
| 부산연제우체국 | 6 / 6 | OK |
| 동부산우체국 | 6 / 6 | OK |
| 부산영도우체국 | 6 / 6 | OK |
| 부산강서우체국 | 8 / 8 | OK |
| 기장우체국 | 6 / 6 | OK |

합계: **92 / 92**

## DB 대조 결과 (현재 restaurants 111 / 공개 94)
| 분류 | 수 |
|---|---|
| EXISTING_LINKABLE | 0 |
| READY_FOR_IMAGE | 80 |
| REVIEW | 12 |
| DUPLICATE | 0 |
| CLOSED_OR_MOVED | 0 |
| NOT_RECOMMENDED | 0 |

- 전화 교집합 **0** (DB 전화 다수가 placeholder), 주소(도로명) 교집합 **0**, 이름 교집합 1(‘명가’ — PDF 동구 감자탕집 vs DB 부산진구 소금구이집 = **다른 식당**, 제외).
- → 나온집(방송 향토맛집)과 우체국 가이드(한식 64·카페 7·중식 5·간식 4 등)는 큐레이션 교집합이 사실상 없음.

## REVIEW 12곳 (Kakao 자동매칭 실패 / 구 불일치)
| 우체국 | # | 식당 | 사유 |
|---|---|---|---|
| 부산우체국 | 04 | 분식회계 | kakao_no_match |
| 동래우체국 | 08 | 베르 | kakao_gu_mismatch |
| 부산사상우체국 | 05 | 첨단돌솥감자탕 엄궁점 | kakao_no_match |
| 부산금정우체국 | 04 | LAB 이흥용과자점 두실점 | kakao_no_match |
| 부산금정우체국 | 06 | 강명장요리가 | kakao_no_match |
| 북부산우체국 | 08 | 가마솥추어탕 | kakao_gu_mismatch |
| 부산연제우체국 | 02 | 차애전할매칼국수 | kakao_gu_mismatch |
| 동부산우체국 | 02 | 명가 | kakao_gu_mismatch |
| 동부산우체국 | 03 | 감포참가자미 | kakao_gu_mismatch |
| 동부산우체국 | 06 | 용궁횟집 | kakao_gu_mismatch |
| 부산강서우체국 | 04 | 시골추어탕 | kakao_gu_mismatch |
| 기장우체국 | 05 | 청기와 식육식당 | kakao_gu_mismatch |

## 핵심 판정
- **EXISTING_LINKABLE 0** → 기존 식당에 우체국 출처만 연결할 대상이 없음.
- 92곳 중 **80곳**은 Kakao place·좌표 확인된 신규 등록 후보(사진만 준비하면 등록 가능).
- **12곳**은 Kakao 자동매칭 실패/주소 구 불일치 → 수기 확인 필요.

## 검증
- DB write 0 / Storage write 0 / restaurants·trust_sources write 0 / 앱코드 0 / schema 0 / migration 0
- Kakao 좌표·place 추정 0 (공식 Local API 결과만), 임의 전화 입력 0
- 원본 PDF·렌더 이미지·API 원본 덤프 저장소 미포함 / 임시파일 repo 밖 처리 후 삭제

## 생성 리포트
- postoffice-busan-2026.md (이 파일)
- postoffice-busan-2026.csv (92곳 전체 필드)
- postoffice-db-matches-2026-06.csv (DB 대조)
- postoffice-source-overlap-2026-06.json (교집합)
- postoffice-filter-feasibility-2026-06.md (우슐랭 필터 타당성)
- postoffice-source-urls-2026-06.json (공식 URL)
