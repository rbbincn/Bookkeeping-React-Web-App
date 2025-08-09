// Simple frontend mock API with simulated latency and in-memory store
export type Transaction = {
  id: string
  date: string
  type: 'Income' | 'Expense'
  category: string
  amount: number
  notes?: string
}

function uid() {
  return Math.random().toString(36).slice(2,9)
}

const store: Transaction[] = [
  { id: uid(), date: '2025-08-01', type: 'Income', category: 'Salary', amount: 5000, notes: '' },
  { id: uid(), date: '2025-08-02', type: 'Expense', category: 'Food', amount: 30, notes: 'Lunch' },
  { id: uid(), date: '2025-08-03', type: 'Expense', category: 'Transport', amount: 10 },
  // add a few more
]

export type ListParams = { page: number, pageSize: number, filters?: any }
export type ListResult = { items: Transaction[], total: number }

export type MockApi = {
  listTransactions(params: ListParams): Promise<ListResult>
  createTransaction(payload: Omit<Transaction,'id'>): Promise<Transaction>
  deleteTransaction(id: string): Promise<void>
}

export function createMockApi(): MockApi {
  return {
    listTransactions: ({ page, pageSize }) => {
      const start = (page - 1) * pageSize
      const items = store.slice().reverse().slice(start, start + pageSize)
      return simulateNetwork(
        { items, total: store.length },
        { minDelay: 300, maxDelay: 600, errorRate: 0.05, errorMessage: '获取交易列表失败' }
      )
    },
    createTransaction: (payload) => {
      const t: Transaction = { id: uid(), ...payload }
      store.push(t)
      return simulateNetwork(
        t,
        { minDelay: 200, maxDelay: 400, errorRate: 0.15, errorMessage: '创建交易失败' }
      )
    },
    deleteTransaction: (id) => {
      const idx = store.findIndex(s => s.id === id)
      if (idx >= 0) store.splice(idx, 1)
      return simulateNetwork(
        undefined,
        { minDelay: 150, maxDelay: 350, errorRate: 0.1, errorMessage: '删除交易失败' }
      )
    }
  }
}

function simulateNetwork<T>(
  data: T,
  options?: { 
    minDelay?: number, 
    maxDelay?: number, 
    errorRate?: number, 
    errorMessage?: string 
  }
): Promise<T> {
  const { 
    minDelay = 200, 
    maxDelay = 600, 
    errorRate = 0.1, 
    errorMessage = '服务器错误，请稍后再试' 
  } = options || {}

  const delay = minDelay + Math.random() * (maxDelay - minDelay)

  return new Promise<T>((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < errorRate) {
        reject(new Error(errorMessage))
      } else {
        resolve(data)
      }
    }, delay)
  })
}
