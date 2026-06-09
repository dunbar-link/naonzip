# 나온집 TRUST-H9 — 신뢰 출처 import 결과

- 실행일: 2026-06-09
- 대상: TRUST-H8 yes 후보 5건만 (hold/no 미대상)
- 방식: service_role insert(중복 방지 조회 후). **restaurants/appearances 무수정, 공개상태 무변경, schema 무변경.**
- 코드 변경 없음. 외부 본문/리뷰/이미지 복제 없음. env/secret 미출력.

## 처리 요약

| 항목 | 수 |
|------|----|
| H8 yes 후보 처리 | 5 |
| inserted_public_true | 2 |
| inserted_public_false (staged) | 3 |
| skipped_duplicate | 0 |
| skipped_hold | 0 |
| 최종 restaurant_trust_sources row count | 6 (신규 5 + 기존 operator 샘플 1) |
| operator 샘플(2tv-sasang) 유지 | 예 |

## 후보별 처리

| slug | 식당 | source_kind | source_name | is_public | 처리 | 사유 |
|------|------|-------------|-------------|-----------|------|------|
| tzuyang-nampo-ijaemo-pizza | 이재모피자 본점 | local | 비짓부산 | **true** | INSERTED_PUBLIC_TRUE | WebFetch로 페이지가 '이재모피자 본점' 다룸 확인. 공식 관광 도메인 |
| hibab-haeundae-amsogalbi | 해운대 암소갈비집 | local | 비짓부산 | **true** | INSERTED_PUBLIC_TRUE | WebFetch로 '해운대 암소갈비집' 확인. 공식 관광 도메인 |
| saengdal-gwangalli-baegil-pyeongnaeng | 백일평냉 | guide | 미쉐린 가이드 | **false** | INSERTED_PUBLIC_FALSE(staged) | 공식 미쉐린 도메인이나 자동 접근 403 → 본문 미확인. 운영자 확인 후 공개 권장 |
| saengdal-seomyeon-dammiok | 담미옥 | guide | 미쉐린 가이드 | **false** | INSERTED_PUBLIC_FALSE(staged) | 동일(미쉐린 403) |
| hibab-haeundae-amsogalbi | 해운대 암소갈비집 | guide | 미쉐린 가이드 | **false** | INSERTED_PUBLIC_FALSE(staged) | 동일(미쉐린 403) |

- 중복 방지: restaurant_id + source_kind + source_url 기준 조회 후 insert(없을 때만). 5건 모두 신규(중복 0).
- is_public 결정: 비짓부산(local) 2건은 WebFetch로 식당명 확인 → public true. 미쉐린(guide) 3건은 봇 403으로 본문 미확인 → staged false(운영자 클릭 확인 후 공개 전환 권장).
- source_note(전 행 동일): "TRUST-H8 후보 기반 자동 staged import. 운영자 최종 확인 필요." (공개 표시 제외 필드라 public 미노출).
- verified_at: 2026-06-09.

## Public 상세 노출 확인 (로컬 프리렌더 HTML)

> 주의: 직접 INSERT라 Next 데이터 캐시가 갱신되지 않아 1차 빌드엔 미반영 → `.next/cache` 클리어 후
> 재빌드에서 반영 확인. **운영 사이트는 ISR revalidate(최대 1시간) 또는 운영자 admin 수정 시
> revalidatePath로 자동 반영된다.** (admin 입력은 즉시 revalidate, 본 직접 import는 ISR 주기 반영)

| 페이지 | 기대 | 확인 |
|--------|------|------|
| /restaurants/tzuyang-nampo-ijaemo-pizza | local 칩 + "추가 출처" + "출처 보기"(비짓부산) | ✅ bg-amber-50 + "추가 출처" + `<a href="…visitbusan…" target=_blank rel=noopener noreferrer>출처 보기` + "부산 공식 관광 소개" |
| /restaurants/hibab-haeundae-amsogalbi | local(공개) 노출 + 미쉐린(staged) 미노출 | ✅ bg-amber-50 + "추가 출처" + "출처 보기" / ❎ 미쉐린·emerald·source_note 0 |
| /restaurants/saengdal-gwangalli-baegil-pyeongnaeng (백일평냉) | 미쉐린 staged → 추가영역 미노출 | ✅ "추가 출처"/emerald/amber/출처보기 0 (본문 설명 텍스트의 '미쉐린'은 기존 콘텐츠) |
| /restaurants/saengdal-seomyeon-dammiok (담미옥) | 미쉐린 staged → 추가영역 미노출 | ✅ 0 |
| / · /restaurants · /search · /map | 회귀 없음 | ✅ 223/223 빌드 정상 |

- source_note 내부 문구: 전 페이지 0건(공개 미노출).
- 기존 TV/Youtube 출처 칩: 유지(resolver append-only, 회귀 없음).
- is_public=false(미쉐린 staged): anon RLS + 쿼리 2중으로 public 미노출 확인(hibab에서 동일 식당의 local만 노출, guide 미노출).

## 리스크/남은 과제

- **staged false 3건(미쉐린 백일평냉/담미옥/암소갈비)**: 운영자가 미쉐린 가이드 페이지를 브라우저로 클릭 확인 후 Admin UI에서 is_public=true로 전환하면 즉시 공개(+revalidate).
- 운영 사이트 반영: 직접 import분은 ISR(≤1h) 주기 반영. 즉시 원하면 운영자가 해당 식당 Admin 수정을 한 번 저장(revalidatePath) 하면 됨.
- demo operator 샘플(2tv-sasang) 유지 중 — 불필요 시 Admin UI에서 삭제 가능.
- H8 hold 후보(캐치테이블/테이블링/블루리본/백년가게 등)는 미입력 — 운영자 현행/동일성 확인 후 별도 판단.
