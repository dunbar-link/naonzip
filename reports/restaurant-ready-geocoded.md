# 나온집 ready 후보 10곳 좌표/Kakao URL 보강 (Phase DATA-F2)

> 생성일: 2026-06-06 · DATA-F1 ready_to_register 10곳 대상. **DB INSERT/UPDATE·Storage 업로드 없음.**
> **좌표 추정 금지 원칙 준수** — 검증 불가한 좌표는 비워 두고 보류 처리했다.

## 핵심 결론

이 작업 환경에서는 **건물 정밀·장소명 검증 좌표를 얻을 수 없었다.** 따라서 geocoded_ready로 확정한 후보는 **0곳**이며, 10곳 모두 좌표 검토가 필요하다.

- geocoded_ready: **0**
- geocoding_review: **8** (주소가 올바른 부산 구·도로로 지오코딩됨, 도로 수준 근사좌표 제공)
- geocoding_failed: **2** (삼성갈미조개=장거리 도로 오구간, 동춘이만두=결과 없음 → 좌표 보류)

### 왜 geocoded_ready가 0인가 (환경 제약, 데이터 문제 아님)

좌표/Kakao URL 확보를 위해 가능한 모든 경로를 시도했고 각각 막혔다:

1. **Kakao JS SDK (앱 내 지도)** — preview 브라우저가 `dapi.kakao.com` 스크립트를 로드하지 못함(`script-error`). 네트워크 샌드박스 또는 JS 키 도메인 제한.
2. **Kakao REST 지오코딩** — `.env.local`에 **JS 키만** 있고 REST API 키가 없음. JS 키로는 REST 호출 불가(401).
3. **Kakao 장소 페이지 WebFetch** — `place.map.kakao.com/{id}`는 JS 렌더링이라 주소·좌표가 정적 HTML에 없음. 게다가 검색이 노출한 place ID가 실제 상호와 불일치(예: id=581800893 → "로옹", 해진아나고 아님)하여 신뢰 불가.
4. **다이닝코드 WebFetch** — 도로명주소·상호는 확인되나 좌표는 JS 로딩이라 추출 불가.
5. **Nominatim(OSM, 키 불필요)** — 유일하게 동작했으나 한국 도로명은 **도로 수준**까지만 해석(건물 번지 정밀도 아님). 장거리 도로(르노삼성대로)는 엉뚱한 구간을 잡음.

→ 결론: **정밀 좌표는 운영자의 Admin quick-register에 내장된 Kakao 지오코딩(실제 도메인에서 동작)으로 확정하는 것이 정답.** 주소는 DATA-F1 + 교차출처로 확인되어 있어 등록 자체는 막히지 않는다.

---

## 1. 좌표 보강 결과 요약

| status | slug | 식당명 | 주소 | lat | lng | Kakao URL | confidence | note |
|---|---|---|---|---:|---:|---|---|---|
| review | jeonhyun-namgu-suta-hyemi-kalguksu | 수타혜미칼국수 | 남구 문현금융로 4 | 35.144787 | 129.064929 | — | medium | 도로수준 근사 |
| review | sungsik-gwangalli-haejin-anago | 해진아나고 | 수영구 광서로10번길 47 | 35.164726 | 129.113690 | — | medium | 주소 재확인 권장(검색서 광안해변로 249 표기) |
| review | sungsik-gwangalli-manujang | 만우장 | 수영구 수영로594번길 28-2 | 35.158385 | 129.116510 | — | medium | 도로수준 근사 |
| review | saengdal-gwangalli-boulangerie-lassence | 블랑제리 라센 | 수영구 남천바다로9번길 8 | 35.151082 | 129.112244 | — | medium | 다이닝코드 주소·상호 일치 |
| review | tzuyang-gwangalli-darijip | 다리집 | 수영구 남천바다로10번길 70 | 35.147672 | 129.111286 | — | medium | 도로수준 근사 |
| review | tzuyang-haeundae-sanggukine | 상국이네 | 해운대구 구남로41번길 40-1 | 35.161531 | 129.162349 | — | medium | 해운대전통시장 인근 |
| review | tzuyang-yeongdo-dongbang-milmyeon | 동방밀면 | 영도구 꿈나무길 239 | 35.087669 | 129.043800 | — | medium | 도로수준 근사 |
| review | tzuyang-yeongdo-dongsamdong-buljjampong | 동삼동불짬뽕 | 영도구 동삼남로 21 | 35.077755 | 129.068226 | — | medium | 도로수준 근사 |
| failed | tzuyang-gangseo-samseong-galmijogae | 삼성갈미조개 | 강서구 르노삼성대로 602 | — | — | — | low | 장거리 도로 오구간 매칭 → 좌표 보류 |
| failed | tzuyang-seomyeon-dongchuni-mandu | 동춘이만두 | 부산진구 당감로25번길 11 | — | — | — | low | Nominatim 결과 없음 → 좌표 보류 |

> lat/lng는 Nominatim(OSM) **도로 수준 근사값**이며 건물 정밀 좌표가 아니다. Kakao URL은 검증된 장소 URL을 얻지 못해 전부 비움(운영자 편의용 Kakao 검색어는 note·CSV에 기재).

---

## 2. 등록 가능 후보 (좌표+Kakao URL 모두 확정)

| slug | 식당명 | 지역 | 카테고리 | 지도 검증 | 비고 |
|---|---|---|---|---|---|
| (없음) | — | — | — | — | 본 환경에서 좌표+Kakao URL을 동시에 확정한 후보 없음 |

§9 기준("좌표와 카카오맵URL이 확인된 후보만 등록 가능")에 따라 등록 가능 섹션은 비어 있다. 단, **주소가 확인된 8곳은 Admin Kakao 지오코딩만 거치면 즉시 등록 가능**하다(아래 3 참고).

---

## 3. 보류 후보 (좌표 검토 필요) — 10곳 전부

### 3-1. geocoding_review (8곳) — 주소 확인됨, 도로수준 근사좌표, Admin 지오코딩으로 정밀화

| slug | 식당명 | 보류 이유 | 필요한 조치 |
|---|---|---|---|
| jeonhyun-namgu-suta-hyemi-kalguksu | 수타혜미칼국수 | 도로수준 근사(건물 정밀 아님) | Admin Kakao 지오코딩으로 좌표 확정 |
| sungsik-gwangalli-haejin-anago | 해진아나고 | 도로수준 + 주소 표기 출처 간 차이 | 주소(광서로10번길 47 vs 광안해변로 249) 확인 후 지오코딩 |
| sungsik-gwangalli-manujang | 만우장 | 도로수준 근사 | Admin Kakao 지오코딩 |
| saengdal-gwangalli-boulangerie-lassence | 블랑제리 라센 | 도로수준 근사 | Admin Kakao 지오코딩 (주소·상호 다이닝코드 일치) |
| tzuyang-gwangalli-darijip | 다리집 | 도로수준 근사 | Admin Kakao 지오코딩 |
| tzuyang-haeundae-sanggukine | 상국이네 | 도로수준 근사 | Admin Kakao 지오코딩 |
| tzuyang-yeongdo-dongbang-milmyeon | 동방밀면 | 도로수준 근사 | Admin Kakao 지오코딩 |
| tzuyang-yeongdo-dongsamdong-buljjampong | 동삼동불짬뽕 | 도로수준 근사 | Admin Kakao 지오코딩 |

### 3-2. geocoding_failed (2곳) — 좌표 미확보, 주소는 유효

| slug | 식당명 | 보류 이유 | 필요한 조치 |
|---|---|---|---|
| tzuyang-gangseo-samseong-galmijogae | 삼성갈미조개 | 르노삼성대로(장거리)에서 녹산동 구간이 잡혀 명지동과 어긋남 → 신뢰 불가 | Admin Kakao 지오코딩(르노삼성대로 602 명지동)으로 확정 |
| tzuyang-seomyeon-dongchuni-mandu | 동춘이만두 | Nominatim 결과 없음(OSM 미수록) | Admin Kakao 지오코딩(당감로25번길 11)으로 확정 |

---

## 4. 검증 방법 메모

- 좌표 검증 기준: 결과의 행정구(구)가 후보 주소의 구와 일치하고 부산 좌표 범위(lat 34.8~35.5, lng 128.7~129.5, `src/lib/coords.ts`와 동일) 내에 있을 것.
- 8곳은 올바른 구·도로에 안착 → review(medium). 2곳은 오구간/무결과 → failed(low).
- 식당명-지도 장소명 일치 검증은 신뢰 가능한 Kakao 장소 데이터를 본 환경에서 얻지 못해 수행 불가(블랑제리 라센만 다이닝코드로 상호·주소 일치 확인).
- DATA-F1의 방송·메뉴·주소 정보는 그대로 보존했고, 새로 추정해 채운 항목은 없다.

---

## 5. 운영자 권장 절차

1. `restaurant-ready-quick-paste-final.md`의 블록을 Admin quick-register에 **비공개**로 붙여넣는다.
2. 각 후보의 **주소를 Admin의 Kakao 지오코딩 기능으로 변환**해 정밀 lat/lng를 확정한다(본 리포트의 도로수준 좌표는 참고용).
3. 지도에서 핀 위치가 상호/주소와 일치하는지 눈으로 확인한다.
4. 검수 후 공개로 전환한다.
