const personalPlanModules = import.meta.glob('./personalCourses.json', {
  eager: true,
  import: 'default',
})

const personalPlan = Object.values(personalPlanModules)[0]

export const hasPersonalPlan = Boolean(personalPlan)
export const DEFAULT_COURSES = Array.isArray(personalPlan?.courses) ? personalPlan.courses : []
export const EXTERNAL_CREDITS = Array.isArray(personalPlan?.externalCredits) ? personalPlan.externalCredits : []
