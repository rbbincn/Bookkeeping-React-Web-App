import { createAsyncThunk, createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit'
import * as api from '../../api/mockApi'

export type Tx = api.Transaction
export type Filters = {
  from?: string
  to?: string
  type?: 'Income' | 'Expense'
  category?: string
  page: number
  pageSize: number
}

export type State = {
  items: Tx[]
  total: number
  loading: boolean
  error?: string
  filters: Filters
}

const initialState: State = {
  items: [], total: 0, loading: false, error: undefined,
  filters: { page: 1, pageSize: 10 }
}

export const fetchList = createAsyncThunk('tx/list', async (_, { getState }) => {
  const s = getState() as any
  const q = s.transactions.filters
  const res = await api.list(q)
  return res
})

export const createTx = createAsyncThunk('tx/create', async (tx: Omit<Tx, 'id'>, { dispatch }) => {
  const res = await api.create(tx)
  await dispatch(fetchList())
  return res
})

export const updateTx = createAsyncThunk('tx/update', async ({ id, patch }: { id: string, patch: Partial<Omit<Tx, 'id'>> }, { dispatch }) => {
  const res = await api.update(id, patch)
  await dispatch(fetchList())
  return res
})

export const deleteTx = createAsyncThunk('tx/delete', async (id: string, { dispatch }) => {
  await api.remove(id)
  await dispatch(fetchList())
  return id
})

const slice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<Filters>>) {
      state.filters = { ...state.filters, ...action.payload, page: action.payload.page ?? state.filters.page }
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchList.pending, (s) => { s.loading = true; s.error = undefined })
      .addCase(fetchList.fulfilled, (s, a) => { s.loading = false; s.items = a.payload.items; s.total = a.payload.total })
      .addCase(fetchList.rejected, (s, a) => { s.loading = false; s.error = a.error.message })
      .addMatcher((ac) => ac.type.startsWith('tx/') && ac.type.endsWith('/rejected'), (s, a) => { s.error = a.error.message })
  }
})

export const { setFilters } = slice.actions
export default slice.reducer

// Initialize demo data on module load
api.seedDemo()
