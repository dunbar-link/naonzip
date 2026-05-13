'use client'

import { useSaved } from '@/hooks/useSaved'

type Props = {
  id: string
  size?: 'sm' | 'md'
}

export default function SaveButton({ id, size = 'sm' }: Props) {
  const { saved, toggle } = useSaved(id)

  const dim = size === 'md' ? 22 : 16

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle()
      }}
      aria-label={saved ? '저장 취소' : '저장'}
      className="flex items-center justify-center"
    >
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 24 24"
        fill={saved ? '#f97316' : 'none'}
        stroke={saved ? '#f97316' : '#9ca3af'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  )
}
