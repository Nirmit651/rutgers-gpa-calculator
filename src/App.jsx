import React, { useEffect, useMemo, useState } from 'react'
import { DEFAULT_COURSES, EXTERNAL_CREDITS, hasPersonalPlan } from './data/courseData'

const STORAGE_KEY = 'rutgers-gpa-courses'
const GRADE_POINTS = { A: 4, 'B+': 3.5, B: 3, 'C+': 2.5, C: 2, D: 1, F: 0 }
const GRADES = Object.keys(GRADE_POINTS)
const SEASON_ORDER = { Winter: 0, Spring: 1, Summer: 2, Fall: 3 }

function copyDefaults() {
  return DEFAULT_COURSES.map((course) => ({ ...course }))
}

function compareSemesters(first, second) {
  if (first === 'Additional courses') return 1
  if (second === 'Additional courses') return -1

  const firstParts = first.match(/^(Winter|Spring|Summer|Fall)\s+(\d{4})$/)
  const secondParts = second.match(/^(Winter|Spring|Summer|Fall)\s+(\d{4})$/)
  if (!firstParts || !secondParts) return first.localeCompare(second)

  return Number(firstParts[2]) - Number(secondParts[2]) || SEASON_ORDER[firstParts[1]] - SEASON_ORDER[secondParts[1]]
}

function getInitialCourses() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : copyDefaults()
  } catch {
    return copyDefaults()
  }
}

function App() {
  const [courses, setCourses] = useState(getInitialCourses)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses))
  }, [courses])

  const totals = useMemo(() => courses.reduce((result, course) => {
    const credits = Number(course.credits)
    const pointValue = GRADE_POINTS[course.grade]
    if (Number.isFinite(credits) && credits > 0 && pointValue !== undefined) {
      result.credits += credits
      result.points += credits * pointValue
    }
    return result
  }, { credits: 0, points: 0 }), [courses])

  const gpa = totals.credits ? totals.points / totals.credits : null
  const groupedCourses = courses.reduce((groups, course) => {
    const semester = course.semester || 'Additional courses'
    ;(groups[semester] ??= []).push(course)
    return groups
  }, {})

  function updateCourse(id, field, value) {
    setCourses((current) => current.map((course) => course.id === id ? { ...course, [field]: value } : course))
  }

  function addCourse() {
    setCourses((current) => [...current, {
      id: `course-${Date.now()}`,
      semester: 'Additional courses',
      code: '',
      name: '',
      credits: '',
      grade: '',
    }])
  }

  function deleteCourse(id) {
    setCourses((current) => current.filter((course) => course.id !== id))
  }

  function resetTranscript() {
    localStorage.removeItem(STORAGE_KEY)
    setCourses(copyDefaults())
  }

  const orderedSemesters = Object.keys(groupedCourses).sort(compareSemesters)
  const externalCreditTotal = EXTERNAL_CREDITS.reduce((total, credit) => total + (Number(credit.credits) || 0), 0)

  return (
    <main className="min-h-screen bg-stone-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <header className="border-b-4 border-[#cc0033] pb-6">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#cc0033]">Academic planning tool</p>
          <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">Rutgers GPA Calculator</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Edit a grade to see its immediate impact. Only standard Rutgers letter grades are included in the calculation.</p>
        </header>

        <section aria-label="GPA summary" className="grid border-b border-slate-200 py-8 sm:grid-cols-[1.5fr_1fr_1fr]">
          <div className="border-b border-slate-200 pb-6 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Current GPA</p>
            <p className="mt-1 text-6xl font-bold tracking-tight text-[#cc0033]">{gpa?.toFixed(3) ?? '—'}</p>
          </div>
          <div className="pt-6 sm:px-8 sm:pt-0">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">GPA Credits</p>
            <p className="mt-2 text-3xl font-bold">{totals.credits}</p>
          </div>
          <div className="border-t border-slate-200 pt-6 sm:border-t-0 sm:border-l sm:pl-8 sm:pt-0">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Grade Points</p>
            <p className="mt-2 text-3xl font-bold">{totals.points.toFixed(2)}</p>
          </div>
        </section>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <div><h2 className="text-2xl font-bold">Courses</h2><p className="mt-1 text-sm text-slate-600">Changes save automatically in this browser.</p></div>
          <div className="flex gap-3">
            <button onClick={resetTranscript} className="button-secondary">Reset to Default Plan</button>
            <button onClick={addCourse} className="button-primary">+ Add Course</button>
          </div>
        </div>

        <div className="mt-6 space-y-10">
          {orderedSemesters.map((semester) => groupedCourses[semester] && <CourseGroup key={semester} semester={semester} courses={groupedCourses[semester]} onUpdate={updateCourse} onDelete={deleteCourse} />)}
        </div>

        {!hasPersonalPlan && <p className="mt-6 text-sm text-slate-600">No local course plan found. Copy <code>src/data/personalCourses.template.json</code> to <code>src/data/personalCourses.json</code>, add your data, then restart the dev server.</p>}

        {EXTERNAL_CREDITS.length > 0 && <section className="mt-14 border-t border-slate-200 pt-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2"><h2 className="text-xl font-bold">AP / External Examination Credit</h2><p className="text-sm text-slate-500">{externalCreditTotal} credits · excluded from GPA</p></div>
          <div className="mt-4 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
            {EXTERNAL_CREDITS.map((course) => <p key={course.code} className="flex justify-between border-b border-slate-200 py-2"><span>{course.name} <span className="text-slate-500">{course.code}</span></span><span className="ml-3 font-semibold">{course.credits}</span></p>)}
          </div>
        </section>}
      </div>
    </main>
  )
}

function CourseGroup({ semester, courses, onUpdate, onDelete }) {
  return <section>
    <h2 className="mb-3 text-xl font-bold">{semester}</h2>
    <div className="overflow-x-auto border-y border-slate-200">
      <table className="w-full min-w-[690px] text-left text-sm">
        <thead className="bg-slate-100 text-xs uppercase tracking-wider text-slate-600"><tr><th className="px-4 py-3">Course</th><th className="px-4 py-3">Credits</th><th className="px-4 py-3">Grade</th><th className="w-16 px-4 py-3"><span className="sr-only">Delete</span></th></tr></thead>
        <tbody>{courses.map((course) => <tr key={course.id} className="border-t border-slate-200"><td className="px-4 py-3"><input aria-label="Course name" value={course.name} placeholder="Course name" onChange={(e) => onUpdate(course.id, 'name', e.target.value)} className="course-input w-full font-semibold" /><div className="mt-1 flex gap-3"><input aria-label="Course code" value={course.code} placeholder="Course code" onChange={(e) => onUpdate(course.id, 'code', e.target.value)} className="course-input w-28 text-xs text-slate-500" />{course.subtopic && <span className="text-xs text-slate-500">{course.subtopic}</span>}</div></td><td className="px-4 py-3"><input aria-label="Credits" type="number" min="0" step="0.5" value={course.credits} onChange={(e) => onUpdate(course.id, 'credits', e.target.value)} className="field-input w-20" /></td><td className="px-4 py-3">{course.grade === 'P' ? <span className="inline-flex rounded bg-slate-200 px-3 py-2 font-semibold text-slate-600">P <span className="ml-1 text-xs font-normal">excluded</span></span> : <select aria-label="Grade" value={GRADE_POINTS[course.grade] === undefined ? '' : course.grade} onChange={(e) => onUpdate(course.id, 'grade', e.target.value)} className="field-input w-36"><option value="">Select Grade</option>{GRADES.map((grade) => <option key={grade} value={grade}>{grade}</option>)}</select>}</td><td className="px-4 py-3 text-right"><button aria-label={`Delete ${course.name || 'course'}`} onClick={() => onDelete(course.id)} className="delete-button">×</button></td></tr>)}</tbody>
      </table>
    </div>
  </section>
}

export default App
