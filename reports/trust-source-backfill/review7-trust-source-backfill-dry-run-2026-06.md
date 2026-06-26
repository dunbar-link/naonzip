# 잔여 REVIEW trust_source 백필 — DRY-RUN (2026-06)

- 스크립트: scripts/backfill-review-trust-sources-2026-06.mjs (dry-run, DB 수정 0)
- trust 0개 대상 7 / INSERT 예정 7 / 제외 0 / 중복skip 0 / url null 0
- 확정 규칙: slug prefix(tzuyang-→쯔양 / sungsik-→성시경) + source_title 키워드 이중 일치만 to_insert
- source_kind=youtube, label='YouTube 출연', verified_at=2026-06-26

## 확정 근거표

| slug | 식당 | source_name | source_title 근거 | url | status |
|---|---|---|---|---|---|
| sungsik-gwangalli-haejin-anago | 해진아나고 | 성시경 | slug 'sungsik-' + source_title '성시경' 일치 | ✓ | to_insert |
| tzuyang-gangseo-samseong-galmijogae | 삼성갈미조개 | 쯔양 | slug 'tzuyang-' + source_title '쯔양' 일치 | ✓ | to_insert |
| tzuyang-gwangalli-darijip | 다리집 | 쯔양 | slug 'tzuyang-' + source_title '쯔양' 일치 | ✓ | to_insert |
| tzuyang-haeundae-sanggukine | 상국이네 | 쯔양 | slug 'tzuyang-' + source_title '쯔양' 일치 | ✓ | to_insert |
| tzuyang-seomyeon-dongchuni-mandu | 동춘이만두 | 쯔양 | slug 'tzuyang-' + source_title '쯔양' 일치 | ✓ | to_insert |
| tzuyang-yeongdo-dongbang-milmyeon | 동방밀면 | 쯔양 | slug 'tzuyang-' + source_title '쯔양' 일치 | ✓ | to_insert |
| tzuyang-yeongdo-dongsamdong-buljjampong | 동삼동불짬뽕 | 쯔양 | slug 'tzuyang-' + source_title '쯔양' 일치 | ✓ | to_insert |
