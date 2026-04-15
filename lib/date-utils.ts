// Format date as "14 April, 2026"
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const day = date.getDate()
  const month = date.toLocaleString("en-US", { month: "long" })
  const year = date.getFullYear()
  return `${day} ${month}, ${year}`
}

// Format date as "14 Apr"
export function formatDateShort(dateString: string): string {
  const date = new Date(dateString)
  const day = date.getDate()
  const month = date.toLocaleString("en-US", { month: "short" })
  return `${day} ${month}`
}

// Get day name (Mon, Tue, etc.)
export function getDayName(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString("en-US", { weekday: "short" })
}

// Get week start date (Monday)
export function getWeekStart(dateString: string): Date {
  const date = new Date(dateString)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(date.setDate(diff))
}

// Get week end date (Sunday)
export function getWeekEnd(dateString: string): Date {
  const weekStart = getWeekStart(dateString)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  return weekEnd
}

// Format week range
export function formatWeekRange(startDate: Date): string {
  const endDate = new Date(startDate)
  endDate.setDate(startDate.getDate() + 6)
  
  const startDay = startDate.getDate()
  const startMonth = startDate.toLocaleString("en-US", { month: "short" })
  const endDay = endDate.getDate()
  const endMonth = endDate.toLocaleString("en-US", { month: "short" })
  const year = startDate.getFullYear()
  
  if (startMonth === endMonth) {
    return `${startDay} - ${endDay} ${startMonth}, ${year}`
  }
  return `${startDay} ${startMonth} - ${endDay} ${endMonth}, ${year}`
}

// Get month-year string (e.g., "April 2026")
export function formatMonthYear(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString("en-US", { month: "long", year: "numeric" })
}

// Get month key for grouping (e.g., "2026-04")
export function getMonthKey(dateString: string): string {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  return `${year}-${month}`
}

// Get week key for grouping (ISO week start date)
export function getWeekKey(dateString: string): string {
  const weekStart = getWeekStart(dateString)
  return weekStart.toISOString().split("T")[0]
}
