import { useEffect, useState, useMemo } from 'react'
import { useCourses } from '../hooks/useCourses'
import CourseCard from '../components/CourseCard'
import { Card } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'

export default function CourseList() {
  const { courses, loading, error, fetchAllCourses } = useCourses()
  const [search, setSearch] = useState('')
  const [filterSeats, setFilterSeats] = useState(false)
  const [filterCredits, setFilterCredits] = useState('')
  const [filterSchedule, setFilterSchedule] = useState('')

  useEffect(() => {
    fetchAllCourses()
  }, [fetchAllCourses])

  const filtered = useMemo(() => {
    let result = courses

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
      )
    }

    if (filterSeats) {
      result = result.filter((c) => (c.enrollment_count ?? 0) < c.max_capacity)
    }

    if (filterCredits) {
      result = result.filter((c) => c.credits === Number(filterCredits))
    }

    if (filterSchedule) {
      result = result.filter((c) =>
        c.schedule.toLowerCase().includes(filterSchedule.toLowerCase())
      )
    }

    return result
  }, [courses, search, filterSeats, filterCredits, filterSchedule])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">Course Catalog</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Browse and enroll in available courses for the current semester.</p>
        </div>
      </div>

      <Card className="bg-white shadow-sm border border-[var(--color-border)]">
        {/* Filters Top Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search courses by code or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
            <div className="w-32">
              <select
                value={filterCredits}
                onChange={(e) => setFilterCredits(e.target.value)}
                className="input-field"
              >
                <option value="">Any Credits</option>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>{n} Credits</option>
                ))}
              </select>
            </div>

            <div className="w-40 relative">
              <input
                type="text"
                placeholder="Day (e.g. Mon)"
                value={filterSchedule}
                onChange={(e) => setFilterSchedule(e.target.value)}
                className="input-field"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-slate-900 cursor-pointer transition-colors user-select-none">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={filterSeats}
                  onChange={(e) => setFilterSeats(e.target.checked)}
                  className="w-4 h-4 text-[var(--color-primary)] border-gray-300 rounded focus:ring-[var(--color-primary)] focus:ring-2"
                />
              </div>
              Available seats only
            </label>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-md bg-[var(--color-danger-bg)] border border-red-200">
            <h3 className="text-sm font-medium text-[var(--color-danger)]">Failed to load courses</h3>
            <p className="mt-1 text-xs text-red-600">{error}</p>
          </div>
        )}

        {/* Data Table */}
        <div className="border border-[var(--color-border)] rounded-lg overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--color-border)]">
              <thead className="bg-[#F8FAFC]">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 sm:pl-6 pr-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th scope="col" className="py-3.5 px-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Course Name
                  </th>
                  <th scope="col" className="py-3.5 px-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Instructor
                  </th>
                  <th scope="col" className="py-3.5 px-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Credits
                  </th>
                  <th scope="col" className="py-3.5 px-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th scope="col" className="py-3.5 pl-3 pr-4 sm:pr-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th scope="col" className="relative py-3.5 pr-4 sm:pr-6">
                    <span className="sr-only">View</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] bg-white">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="py-4 pl-4 sm:pl-6 pr-3"><Skeleton className="h-5 w-20" /></td>
                      <td className="py-4 px-3"><Skeleton className="h-5 w-48 mb-1" /><Skeleton className="h-3 w-32" /></td>
                      <td className="py-4 px-3"><Skeleton className="h-5 w-32" /></td>
                      <td className="py-4 px-3 flex justify-center"><Skeleton className="h-5 w-16 rounded-full" /></td>
                      <td className="py-4 px-3"><Skeleton className="h-5 w-24" /></td>
                      <td className="py-4 pl-3 pr-4 sm:pr-6"><Skeleton className="h-5 w-32" /></td>
                      <td></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-slate-900">No courses found</h3>
                      <p className="mt-1 text-sm text-slate-500">Try adjusting your search or filters.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  )
}
