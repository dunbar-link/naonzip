/**
 * Kakao Maps JS SDK(services 라이브러리 포함) 로더.
 *
 * client 전용 — window/document 는 함수 호출 시점에만 접근하므로
 * 서버/빌드 타임 import 는 안전하다(모듈 최상위에서 window 접근 안 함).
 *
 * KakaoMapView 의 로딩 방식(autoload=false → kakao.maps.load)을 따르되,
 * 주소 지오코딩/장소 검색을 위해 libraries=services 로 로드한다.
 */

let servicesPromise: Promise<KakaoServices> | null = null

export function loadKakaoServices(): Promise<KakaoServices> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('브라우저에서만 사용할 수 있어요.'))
  }
  // 이미 services 까지 로드돼 있으면 재사용.
  if (window.kakao?.maps?.services) {
    return Promise.resolve(window.kakao.maps.services)
  }
  if (servicesPromise) return servicesPromise

  const key = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY
  if (!key) {
    return Promise.reject(new Error('Kakao 지도 키가 설정되어 있지 않아요.'))
  }

  servicesPromise = new Promise<KakaoServices>((resolve, reject) => {
    const onReady = () => {
      try {
        window.kakao.maps.load(() => {
          if (window.kakao?.maps?.services) resolve(window.kakao.maps.services)
          else reject(new Error('Kakao services 라이브러리를 불러오지 못했어요.'))
        })
      } catch (e) {
        reject(e instanceof Error ? e : new Error('Kakao 로드 중 오류가 났어요.'))
      }
    }

    const existing = document.querySelector<HTMLScriptElement>('script[data-kakao-sdk="services"]')
    if (existing) {
      if (window.kakao?.maps) onReady()
      else existing.addEventListener('load', onReady, { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false&libraries=services`
    script.async = true
    script.dataset.kakaoSdk = 'services'
    script.addEventListener('load', onReady, { once: true })
    script.addEventListener(
      'error',
      () => {
        servicesPromise = null // 다음 시도에서 다시 주입할 수 있게 초기화
        reject(new Error('Kakao 지도 SDK 를 불러오지 못했어요.'))
      },
      { once: true }
    )
    document.head.appendChild(script)
  })

  return servicesPromise
}
