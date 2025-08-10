
import { configureStore } from '@reduxjs/toolkit'
import reducer, {
  fetchPage, fetchFull,
  createTransaction, updateTransaction, deleteTransaction,
  setFilters, setPage, type TransactionsState
} from '../features/transactions/transactionsSlice'

jest.mock('../api/mockApi', () => ({
  __esModule: true,
  list: jest.fn(async (_q:any) => ({
    items: [
      { id:'1', date:'2025-07-26', type:'Income', category:'Other', amount:100 },
      { id:'2', date:'2025-07-19', type:'Expense', category:'Food', amount:50 }
    ],
    total: 2
  })),
  listAll: jest.fn(async (_q:any) => [
    { id:'1', date:'2025-07-26', type:'Income', category:'Other', amount:100 },
    { id:'2', date:'2025-07-19', type:'Expense', category:'Food', amount:50 }
  ]),
  create: jest.fn(async (_tx:any) => {}),
  update: jest.fn(async (_id:string,_p:any) => {}),
  remove: jest.fn(async (_id:string) => {}),
}));

function makeStore() {
  return configureStore({ reducer: { transactions: reducer } })
}

describe('transactions slice thunks', () => {
  test('fetchPage populates items and total', async () => {
    const store = makeStore()
    await store.dispatch<any>(fetchPage())
    const s = (store.getState() as any).transactions as TransactionsState
    expect(s.pageItems.length).toBe(2)
    expect(s.totalCount).toBe(2)
  })

  test('fetchFull populates totals', async () => {
    const store = makeStore()
    await store.dispatch<any>(fetchFull())
    const s = (store.getState() as any).transactions as TransactionsState
    expect(s.fullItems?.length).toBe(2)
    expect(s.totals.income).toBe(100)
    expect(s.totals.expense).toBe(50)
  })

  test('setFilters then fetchPage uses new filters', async () => {
    const store = makeStore()
    store.dispatch(setFilters({ type: 'Income' }))
    await store.dispatch<any>(fetchPage())
    const s = (store.getState() as any).transactions as TransactionsState
    expect(s.pageItems.length).toBeGreaterThan(0)
  })

  test('pagination setPage updates page number', () => {
    const store = makeStore()
    store.dispatch(setPage(3))
    const s = (store.getState() as any).transactions as TransactionsState
    expect(s.page).toBe(3)
  })

  test('create/update/delete complete and refresh', async () => {
    const store = makeStore()
    await store.dispatch<any>(createTransaction({ date:'2025-07-26', type:'Income', category:'Other', amount:1 } as any))
    await store.dispatch<any>(updateTransaction({ id:'1', patch:{ amount:2 } } as any))
    await store.dispatch<any>(deleteTransaction('1'))
    const s = (store.getState() as any).transactions as TransactionsState
    expect(Array.isArray(s.pageItems)).toBe(true)
  })
})
