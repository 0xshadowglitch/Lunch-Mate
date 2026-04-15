// Lunch Tracker Data Store
export interface User {
  id: string
  name: string
  createdAt: Date
}

export interface LunchEntry {
  id: string
  date: string
  totalExpense: number
  shares: Record<string, number>
  paid: Record<string, number>
}

export interface UserBalance {
  userId: string
  name: string
  totalPaid: number
  totalShares: number
  currentBalance: number
  daysPresent: number
}

// Initial users
const initialUsers: User[] = [
  { id: '1', name: 'Shafqat', createdAt: new Date('2024-01-01') },
  { id: '2', name: 'Usama', createdAt: new Date('2024-01-01') },
  { id: '3', name: 'Shahabaz', createdAt: new Date('2024-01-01') },
]

// Sample lunch data
const initialLunchEntries: LunchEntry[] = [
  {
    id: '1',
    date: '2024-03-01',
    totalExpense: 450,
    shares: { '1': 150, '2': 150, '3': 150 },
    paid: { '1': 450, '2': 0, '3': 0 },
  },
  {
    id: '2',
    date: '2024-03-04',
    totalExpense: 520,
    shares: { '1': 173, '2': 173, '3': 174 },
    paid: { '1': 0, '2': 520, '3': 0 },
  },
  {
    id: '3',
    date: '2024-03-05',
    totalExpense: 380,
    shares: { '1': 127, '2': 127, '3': 126 },
    paid: { '1': 0, '2': 0, '3': 380 },
  },
  {
    id: '4',
    date: '2024-03-06',
    totalExpense: 600,
    shares: { '1': 200, '2': 200, '3': 200 },
    paid: { '1': 600, '2': 0, '3': 0 },
  },
  {
    id: '5',
    date: '2024-03-07',
    totalExpense: 480,
    shares: { '1': 160, '2': 160, '3': 160 },
    paid: { '1': 0, '2': 480, '3': 0 },
  },
  {
    id: '6',
    date: '2024-03-08',
    totalExpense: 550,
    shares: { '1': 183, '2': 184, '3': 183 },
    paid: { '1': 0, '2': 0, '3': 550 },
  },
  {
    id: '7',
    date: '2024-03-11',
    totalExpense: 420,
    shares: { '1': 140, '2': 140, '3': 140 },
    paid: { '1': 420, '2': 0, '3': 0 },
  },
  {
    id: '8',
    date: '2024-03-12',
    totalExpense: 390,
    shares: { '1': 130, '2': 130, '3': 130 },
    paid: { '1': 0, '2': 390, '3': 0 },
  },
  {
    id: '9',
    date: '2024-03-13',
    totalExpense: 0,
    shares: { '1': 0, '2': 0, '3': 0 },
    paid: { '1': 0, '2': 0, '3': 0 },
  },
  {
    id: '10',
    date: '2024-03-14',
    totalExpense: 510,
    shares: { '1': 170, '2': 170, '3': 170 },
    paid: { '1': 0, '2': 0, '3': 510 },
  },
]

// In-memory store (in real app, this would be a database)
let users = [...initialUsers]
let lunchEntries = [...initialLunchEntries]

export function getUsers(): User[] {
  return users
}

export function getUserById(id: string): User | undefined {
  return users.find(u => u.id === id)
}

export function addUser(name: string): User {
  const newUser: User = {
    id: String(Date.now()),
    name,
    createdAt: new Date(),
  }
  users.push(newUser)
  return newUser
}

export function deleteUser(id: string): boolean {
  const index = users.findIndex(u => u.id === id)
  if (index === -1) return false
  
  users.splice(index, 1)
  
  // Remove user from all lunch entries
  lunchEntries = lunchEntries.map(entry => ({
    ...entry,
    shares: Object.fromEntries(
      Object.entries(entry.shares).filter(([key]) => key !== id)
    ),
    paid: Object.fromEntries(
      Object.entries(entry.paid).filter(([key]) => key !== id)
    ),
  }))
  
  return true
}

export function getLunchEntries(): LunchEntry[] {
  return lunchEntries
}

export function addLunchEntry(entry: Omit<LunchEntry, 'id'>): LunchEntry {
  const newEntry: LunchEntry = {
    ...entry,
    id: String(Date.now()),
  }
  lunchEntries.push(newEntry)
  return newEntry
}

export function calculateUserBalances(): UserBalance[] {
  return users.map(user => {
    let totalPaid = 0
    let totalShares = 0
    let daysPresent = 0

    lunchEntries.forEach(entry => {
      const paid = entry.paid[user.id] || 0
      const share = entry.shares[user.id] || 0
      
      totalPaid += paid
      totalShares += share
      
      if (share > 0) {
        daysPresent++
      }
    })

    return {
      userId: user.id,
      name: user.name,
      totalPaid,
      totalShares,
      currentBalance: totalPaid - totalShares,
      daysPresent,
    }
  })
}

export function getMonthlyStats() {
  const totalExpense = lunchEntries.reduce((sum, e) => sum + e.totalExpense, 0)
  const totalPaid = lunchEntries.reduce((sum, e) => 
    sum + Object.values(e.paid).reduce((a, b) => a + b, 0), 0)
  
  const balances = calculateUserBalances()
  const netBalance = balances.reduce((sum, b) => sum + b.currentBalance, 0)

  return {
    totalExpense,
    totalPaid,
    netBalance,
    totalEntries: lunchEntries.length,
  }
}

export function getSpendingTrend() {
  return lunchEntries
    .filter(e => e.totalExpense > 0)
    .map(e => ({
      date: e.date,
      expense: e.totalExpense,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export function getContributionData() {
  const balances = calculateUserBalances()
  return balances.map(b => ({
    name: b.name,
    paid: b.totalPaid,
    shares: b.totalShares,
  }))
}

export function getDataAuditEntries() {
  return lunchEntries
    .slice(-10)
    .reverse()
    .map(entry => {
      const issues: string[] = []
      
      if (entry.totalExpense === 0) {
        issues.push('Zero expense')
      }
      
      const totalPaid = Object.values(entry.paid).reduce((a, b) => a + b, 0)
      if (totalPaid === 0 && entry.totalExpense > 0) {
        issues.push('No payment recorded')
      }
      
      return {
        ...entry,
        issues,
        hasIssues: issues.length > 0,
      }
    })
}

// Reset to initial state (for testing)
export function resetStore() {
  users = [...initialUsers]
  lunchEntries = [...initialLunchEntries]
}
