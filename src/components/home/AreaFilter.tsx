'use client'

import { AreaType } from '@/types/restaurant'
import { useHorizontalDragScroll } from '@/hooks/useHorizontalDragScroll'

const areas: Array<AreaType | '전체'> = [
  '전체', '해운대', '서면', '광안리', '남포동', '기장', '동래', '사상',
]

type Props = {
  selected: AreaType | '전체'
  onChange: (area: AreaType | '전체') => void
}

export default function AreaFilter({ selected, onChange }: Props) {
  const scrollRef = useHorizontalDragScroll<HTMLDivElement>()
  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto scrollbar-hide px-4 pb-1"
    >
      {areas.map((area) => (
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
