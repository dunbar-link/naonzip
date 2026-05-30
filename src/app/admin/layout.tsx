/**
 * /admin/** 전용 레이아웃.
 * - dynamic = 'force-dynamic' 으로 RSC/페이지 정적 캐시를 강제 차단 → 민감 데이터 노출 방지.
 * - 시각 chrome 은 각 페이지(reports / login)가 자체 처리한다.
 */

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
