// Kakao Maps JavaScript SDK 최소 타입 선언
// 사용하는 API만 선언한다

interface KakaoMapOptions {
  center: KakaoLatLng
  level: number
}

interface KakaoMap {
  setCenter(latlng: KakaoLatLng): void
  panTo(latlng: KakaoLatLng): void
  setLevel(level: number): void
}

interface KakaoLatLng {
  getLat(): number
  getLng(): number
}

interface KakaoMarkerOptions {
  position: KakaoLatLng
  map?: KakaoMap
  title?: string
}

interface KakaoMarker {
  setMap(map: KakaoMap | null): void
  getPosition(): KakaoLatLng
}

// services 라이브러리 (Geocoder / Places) — 주소→좌표 지오코딩, 장소 검색용
type KakaoServicesStatus = 'OK' | 'ZERO_RESULT' | 'ERROR'

interface KakaoAddressSearchResult {
  x: string // 경도(lng)
  y: string // 위도(lat)
  address_name: string
}

interface KakaoGeocoder {
  addressSearch(
    address: string,
    callback: (result: KakaoAddressSearchResult[], status: KakaoServicesStatus) => void
  ): void
}

interface KakaoPlaceSearchResult {
  id: string
  place_name: string
  address_name: string
  road_address_name: string
  x: string // 경도(lng)
  y: string // 위도(lat)
  place_url: string
}

interface KakaoPlaces {
  keywordSearch(
    keyword: string,
    callback: (
      data: KakaoPlaceSearchResult[],
      status: KakaoServicesStatus,
      pagination: unknown
    ) => void
  ): void
}

interface KakaoServices {
  Status: {
    OK: KakaoServicesStatus
    ZERO_RESULT: KakaoServicesStatus
    ERROR: KakaoServicesStatus
  }
  Geocoder: new () => KakaoGeocoder
  Places: new () => KakaoPlaces
}

interface KakaoMapsStatic {
  load(callback: () => void): void
  Map: new (container: HTMLElement, options: KakaoMapOptions) => KakaoMap
  LatLng: new (lat: number, lng: number) => KakaoLatLng
  Marker: new (options: KakaoMarkerOptions) => KakaoMarker
  event: {
    addListener(target: object, type: string, callback: () => void): void
  }
  // libraries=services 로 로드했을 때만 런타임에 존재. 미로드 시 undefined.
  services: KakaoServices
}

interface KakaoStatic {
  maps: KakaoMapsStatic
}

interface Window {
  kakao: KakaoStatic
}
