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

interface KakaoMapsStatic {
  load(callback: () => void): void
  Map: new (container: HTMLElement, options: KakaoMapOptions) => KakaoMap
  LatLng: new (lat: number, lng: number) => KakaoLatLng
  Marker: new (options: KakaoMarkerOptions) => KakaoMarker
  event: {
    addListener(target: object, type: string, callback: () => void): void
  }
}

interface KakaoStatic {
  maps: KakaoMapsStatic
}

interface Window {
  kakao: KakaoStatic
}
