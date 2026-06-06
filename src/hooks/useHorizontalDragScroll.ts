'use client'

import { useEffect, useRef } from 'react'

/**
 * PC 마우스 드래그/휠로 horizontal scroll 가능하게 만드는 hook.
 *
 * - pointerType === 'mouse' 만 처리 → 모바일 터치는 native scroll 그대로 유지
 * - 드래그 이동 거리가 임계값 이상이면 직후 click 1회 차단
 *   (카드/버튼 클릭 오작동 방지)
 * - 가로 휠이 없는 마우스를 위해 wheel deltaY 가 deltaX 보다 클 때만
 *   scrollLeft 로 변환. trackpad 의 가로 스와이프는 native 처리 그대로
 *
 * 사용: const ref = useHorizontalDragScroll<HTMLDivElement>()
 *      <div ref={ref} className="overflow-x-auto ...">...</div>
 */
export function useHorizontalDragScroll<
  T extends HTMLElement = HTMLDivElement,
>() {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let isDragging = false
    let captured = false
    let startX = 0
    let startScrollLeft = 0
    let movedDistance = 0

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      isDragging = true
      captured = false
      startX = e.clientX
      startScrollLeft = el.scrollLeft
      movedDistance = 0
      // 주의: pointerdown 시점에 setPointerCapture 하지 않는다.
      // 컨테이너가 포인터를 캡처하면 직후 click 이벤트가 자식 button 대신
      // 컨테이너로 retarget 되어 PC 에서 지역칩 클릭이 동작하지 않는다.
      // 실제 드래그(임계값 초과)가 시작될 때만 onPointerMove 에서 캡처한다.
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return
      const dx = e.clientX - startX
      movedDistance = Math.max(movedDistance, Math.abs(dx))
      // 임계값을 넘긴 실제 드래그에서만 capture → 이후 cursor 가 영역을
      // 벗어나도 scroll 추적이 유지된다. 단순 click 은 capture 되지 않는다.
      if (!captured && movedDistance > 5) {
        try {
          el.setPointerCapture(e.pointerId)
          captured = true
        } catch {
          // setPointerCapture 가 실패해도 드래그 자체는 진행 가능
        }
        el.style.cursor = 'grabbing'
        el.style.userSelect = 'none'
      }
      el.scrollLeft = startScrollLeft - dx
    }

    const endDrag = (e: PointerEvent) => {
      if (!isDragging) return
      isDragging = false
      if (captured) {
        try {
          el.releasePointerCapture(e.pointerId)
        } catch {
          // pointer capture 해제 실패는 무시
        }
        captured = false
      }
      el.style.cursor = ''
      el.style.userSelect = ''
    }

    // 드래그 직후 첫 click 만 차단 (이후 정상 click 허용)
    const onClickCapture = (e: MouseEvent) => {
      if (movedDistance > 5) {
        e.preventDefault()
        e.stopPropagation()
        movedDistance = 0
      }
    }

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        el.scrollLeft += e.deltaY
        e.preventDefault()
      }
    }

    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('pointermove', onPointerMove)
    el.addEventListener('pointerup', endDrag)
    el.addEventListener('pointercancel', endDrag)
    el.addEventListener('click', onClickCapture, true)
    el.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      el.removeEventListener('pointerdown', onPointerDown)
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerup', endDrag)
      el.removeEventListener('pointercancel', endDrag)
      el.removeEventListener('click', onClickCapture, true)
      el.removeEventListener('wheel', onWheel)
    }
  }, [])

  return ref
}
