'use client'

import { AreaType } from '@/types/restaurant'
import { useHorizontalDragScroll } from '@/hooks/useHorizontalDragScroll'

type Props = {
  selected: AreaType | '전체'
  onChange: (area: AreaType | '전체') => void
  /** 실제 데이터에 존재하는 area 목록 (전체 제외). 없으면 전체만 표시. */
  areas: AreaType[]
}

export default function AreaFilter({ selected, onChange, areas }: Props) {
  const scrollRef = useHorizontalDragScroll<HTMLDivElement>()
  const allAreas: Array<AreaType | '전체'> = ['전체', ...areas]
  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto scrollbar-hide px-4 pb-1"
    >
      {allAreas.map((area) => (
        <button
          key={area}
          onClick={() => onChange(area)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
            selected === area
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {area}
        </button>
      ))}
    </div>
  )
}
