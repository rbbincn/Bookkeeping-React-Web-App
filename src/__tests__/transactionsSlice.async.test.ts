/**
 * Async thunks unit tests with mocked API module.
 */
import { configureStore } from '@reduxjs/toolkit'
import reducer, { fetchList, createTx, updateTx, deleteTx } from '../features/transactions/transactionsSlice'

// Mock the API BEFORE using the slice (slice imports it internally)
jest.mock('../api/mockApi', () => {
  return {
    __esModule: true,
    list: jest.fn(async (_q:any) => ({
      items: [{ id: '1', date: '2025-01-01', type: 'Expense', category: 'Food', amount: 10 }],
      total: 1
    })),
    create: jest.fn(async (tx:any) => ({ id: '2', ...tx })),
    update: jest.fn(async (id:string, patch:any) => ({ id, date: '2025-01-01', type: 'Expense', category: 'Food', amount: 12, ...patch })),
    remove: jest.fn(async (_id:string) => {}),
    seedDemo: jest.fn(() => {}),
  }
})

describe.skip('transactions async thunks', () => {
  const makeStore = () => configureStore({ reducer: { transactions: reducer } })

  it('fetchList loads items and total', async () => {
    const store = makeStore()
    const p = store.dispatch<any>(fetchList())
    // pending
    let s:any = store.getState().transactions
    expect(s.loading).toBe(true)
    await p
    s = store.getState().transactions
    expect(s.loading).toBe(false)
    expect(s.items.length).toBe(1)
    expect(s.total).toBe(1)
    expect(s.error).toBeUndefined()
  })

  it('createTx then refreshes list', async () => {
    const store = makeStore()
    await store.dispatch<any>(createTx({ date:'2025-01-02', type:'Income', category:'Salary', amount:1000 }))
    const s:any = store.getState().transactions
    expect(s.items.length).toBe(1)
  })

  it('updateTx then refreshes list', async () => {
    const store = makeStore()
    await store.dispatch<any>(updateTx({ id:'1', patch:{ amount: 20 } }))
    const s:any = store.getState().transactions
    expect(s.items.length).toBe(1)
  })

  it('deleteTx then refreshes list', async () => {
    const store = makeStore()
    await store.dispatch<any>(deleteTx('1'))
    const s:any = store.getState().transactions
    expect(s.items.length).toBe(1)
  })
})
