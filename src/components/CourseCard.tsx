import { useNavigate } from 'react-router-dom'
import type { Course } from '../types'
import { Badge } from './ui/Badge'

interface Props {
  course: Course
}

export default function CourseCard({ course }: Props) {
  const navigate = useNavigate()
  const enrolled = course.enrollment_count ?? 0
  const full = enrolled >= course.max_capacity
  const pct = Math.min((enrolled / course.max_capacity) * 100, 100)

  return (
    <tr
      onClick={() => navigate(`/courses/${course.id}`)}
      className="cursor-pointer border-b border-[var(--color-border)] hover:bg-[#F1F5F9] transition-colors group"
    >
      <td className="py-4 pl-4 sm:pl-6 pr-3 text-sm">
        <div className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
          {course.code}
        </div>
      </td>
      <td className="py-4 px-3 text-sm">
        <div className="font-medium text-[var(--color-text-primary)] mb-0.5">{course.name}</div>
        <div className="text-[var(--color-text-secondary)] text-xs truncate max-w-[200px]">{course.description || 'No description available'}</div>
      </td>
      <td className="py-4 px-3 text-sm text-[var(--color-text-secondary)] whitespace-nowrap">
        {course.instructor}
      </td>
      <td className="py-4 px-3 text-sm text-center">
        <Badge variant="neutral">{course.credits} {course.credits === 1 ? 'Credit' : 'Credits'}</Badge>
      </td>
      <td className="py-4 px-3 text-sm text-[var(--color-text-secondary)] whitespace-nowrap">
        {course.schedule}
      </td>
      <td className="py-4 pl-3 pr-4 sm:pr-6 text-sm">
        <div className="flex items-center gap-3">
          <div className="w-16 sm:w-24 h-2 bg-slate-100 rounded-full overflow-hidden shrink-0 shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${full ? 'bg-[var(--color-danger)]' : 'bg-[var(--color-primary)]'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className={`text-xs whitespace-nowrap ${full ? 'font-semibold text-[var(--color-danger)]' : 'font-medium text-[var(--color-text-secondary)]'}`}>
            {enrolled}/{course.max_capacity}
            {full && ' Full'}
          </span>
        </div>
      </td>
      <td className="py-4 pr-4 sm:pr-6 text-right">
        <svg className="w-5 h-5 text-slate-400 group-hover:text-[var(--color-primary)] transition-colors inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </td>
    </tr>
  )
}
