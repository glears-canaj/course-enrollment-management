import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  noPadding?: boolean
}

export function Card({ children, className = '', noPadding = false }: CardProps) {
  return (
    <div className={`bg-white border border-[#E2E8F0] rounded-lg shadow-[var(--shadow-card)] overflow-hidden ${className}`}>
      {!noPadding ? (
        <div className="p-5 sm:p-6">
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  )
}
