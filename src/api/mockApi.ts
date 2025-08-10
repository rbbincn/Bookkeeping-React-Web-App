export type Transaction = {
  id: string
  date: string // ISO
  type: 'Income' | 'Expense'
  category: string
  amount: number
  notes?: string
}

type Query = {
  from?: string
  to?: string
  type?: 'Income' | 'Expense'
  category?: string
  page?: number
  pageSize?: number
}

const KEY = 'bk.transactions.v1'

const delay = (min=200, max=700) => new Promise(res => setTimeout(res, Math.random()*(max-min)+min))
const maybeError = () => {
  // 8% chance to throw a network-like error
  if (Math.random() < 0.08) throw new Error('Network error: simulated failure')
}

function readAll(): Transaction[] {
  const raw = localStorage.getItem(KEY)
  if (!raw) return []
  try { return JSON.parse(raw) as Transaction[] } catch { return [] }
}

function writeAll(list: Transaction[]) {
  localStorage.setItem(KEY, JSON.stringify(list))
}

export async function create(tx: Omit<Transaction, 'id'>): Promise<Transaction> {
  await delay(); maybeError()
  const list = readAll()
  const item = { ...tx, id: crypto.randomUUID() }
  list.unshift(item)
  writeAll(list)
  return item
}

export async function update(id: string, patch: Partial<Omit<Transaction, 'id'>>): Promise<Transaction> {
  await delay(); maybeError()
  const list = readAll()
  const idx = list.findIndex(t => t.id === id)
  if (idx === -1) throw new Error('Not found')
  list[idx] = { ...list[idx], ...patch }
  writeAll(list)
  return list[idx]
}

export async function remove(id: string): Promise<void> {
  await delay(); maybeError()
  writeAll(readAll().filter(t => t.id !== id))
}

export async function list(q: Query): Promise<{items: Transaction[], total: number}> {
  await delay(); maybeError()
  const { from, to, type, category, page=1, pageSize=10 } = q
  let items = readAll()
  if (from) items = items.filter(t => t.date >= from)
  if (to) items = items.filter(t => t.date <= to)
  if (type) items = items.filter(t => t.type === type)
  if (category) items = items.filter(t => t.category === category)
  const total = items.length
  const start = (page-1)*pageSize
  const paged = items.slice(start, start+pageSize)
  return { items: paged, total }
}

// Seed with demo data if empty
export function seedDemo() {
  if (readAll().length) return
  const categories = ['Food','Transport','Rent','Salary','Entertainment','Shopping']
  const now = new Date()
  const demo = Array.from({length: 36}).map((_,i) => {
    const d = new Date(now)
    d.setDate(now.getDate() - i*2)
    const isIncome = Math.random() > 0.7
    return {
      id: crypto.randomUUID(),
      date: d.toISOString().slice(0,10),
      type: isIncome ? 'Income' : 'Expense',
      category: isIncome ? 'Salary' : categories[Math.floor(Math.random()*categories.length)],
      amount: +(isIncome ? (1000+Math.random()*2000) : (5+Math.random()*80)).toFixed(2),
      notes: isIncome ? 'Monthly pay' : ''
    }
  })
  writeAll(demo)
}
