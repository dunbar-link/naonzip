import type { TrustSource } from '@/types/restaurant'
import { resolveTrustSourceViews, sourceToneClass } from '@/lib/sources'

/**
 * 상세페이지 "어디서 봤나요" 섹션의 "추가 출처" 영역. [TRUST-H6]
 * - trustSources(공개분)가 있을 때만 렌더한다(없으면 null → 기존 UI와 동일).
 * - 칩(종류) + 한 줄 요약(trust_label · source_name) + 보조(source_title · verified_at) + 출처 링크.
 * - source_note 는 표시하지 않는다(resolveTrustSourceViews 가 애초에 제외).
 */
type Props = {
  trustSources?: TrustSource[]
}

export default function TrustSources({ trustSources }: Props) {
  const views = resolveTrustSourceViews(trustSources)
  if (views.length === 0) return null

  return (
    <div className="mt-4 border-t border-gray-50 pt-3">
      <h3 className="text-xs font-bold text-gray-500 mb-2">추가 출처</h3>
      <ul className="flex flex-col gap-2.5">
        {views.map((v) => (
          <li key={v.key} className="flex items-center gap-2">
            <span
              className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${sourceToneClass(v.tone)}`}
            >
              {v.kindLabel}
            </span>
            <div className="min-w-0">
              <p className="text-sm text-gray-800 truncate">{v.primary}</p>
              {v.meta && <p className="text-xs text-gray-400 truncate">{v.meta}</p>}
            </div>
            {v.url && (
              <a
                href={v.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto flex-shrink-0 text-xs text-orange-500 font-semibold underline underline-offset-2"
              >
                출처 보기 →
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
