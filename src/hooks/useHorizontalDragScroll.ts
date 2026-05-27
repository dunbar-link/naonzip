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
    let startX = 0
    let startScrollLeft = 0
    let movedDistance = 0

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      isDragging = true
      startX = e.clientX
      startScrollLeft = el.scrollLeft
      movedDistance = 0
      try {
        el.setPointerCapture(e.pointerId)
      } catch {
        // setPointerCapture 가 실패해도 드래그 자체는 진행 가능
      }
      el.style.cursor = 'grabbing'
      el.style.userSelect = 'none'
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return
      const dx = e.clientX - startX
      movedDistance = Math.max(movedDistance, Math.abs(dx))
      el.scrollLeft = startScrollLeft - dx
    }

    const endDrag = (e: PointerEvent) => {
      if (!isDragging) return
      isDragging = false
      try {
        el.releasePointerCapture(e.pointerId)
      } catch {
        // pointer capture 해제 실패는 무시
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
