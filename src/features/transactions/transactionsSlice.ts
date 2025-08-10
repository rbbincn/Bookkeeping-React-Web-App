import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as api from '../../api/mockApi';

export type Transaction = {
  id: string;
  date: string; // YYYY-MM-DD
  type: 'Income' | 'Expense';
  category: string;
  amount: number;
  notes?: string;
};

export type Filters = {
  from?: string;
  to?: string;
  type?: 'Income' | 'Expense';
  category?: string;
};

export type Totals = {
  income: number;
  expense: number;
  net: number;
};

export type TransactionsState = {
  // for ransactions page
  pageItems: Transaction[];
  totalCount: number;
  page: number;
  pageSize: number;
  filters: Filters;
  loadingPage: boolean;
  errorPage?: string;

  // for dashborad
  fullItems: Transaction[] | null;
  totals: Totals;
  loadingFull: boolean;
  errorFull?: string;
};

const initialState: TransactionsState = {
  pageItems: [],
  totalCount: 0,
  page: 1,
  pageSize: 10,
  filters: {
    mode: 'custom',
    from: undefined,
    to: undefined,
    type: undefined,
    category: undefined
  },

  loadingPage: false,
  errorPage: undefined,

  fullItems: null,
  totals: { income: 0, expense: 0, net: 0 },
  loadingFull: false,
  errorFull: undefined,
};

function computeTotals(items: Transaction[]): Totals {
  const income = items
    .filter(t => t.type === 'Income')
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = items
    .filter(t => t.type === 'Expense')
    .reduce((sum, t) => sum + t.amount, 0);
  return { income, expense, net: income - expense };
}

// --- Thunks ---

// pagination
export const fetchPage = createAsyncThunk<
  { items: Transaction[]; total: number },
  void,
  { state: { transactions: TransactionsState } }
>('transactions/fetchPage', async (_, { getState }) => {
  const s = getState().transactions;
  return api.list({
    ...s.filters,
    page: s.page,
    pageSize: s.pageSize,
  });
});

// all data
export const fetchFull = createAsyncThunk<
  { items: Transaction[]; totals: Totals },
  void,
  { state: { transactions: TransactionsState } }
>('transactions/fetchFull', async (_, { getState }) => {
  const s = getState().transactions;
  const items = await api.listAll(s.filters);
  return { items, totals: computeTotals(items) };
});

// add
export const createTransaction = createAsyncThunk<
  void,
  Omit<Transaction, 'id'>
>('transactions/createTransaction', async (payload, { dispatch }) => {
  await api.create(payload);
  await Promise.all([dispatch(fetchPage()), dispatch(fetchFull())]);
});

// edit
export const updateTransaction = createAsyncThunk<
  void,
  { id: string; patch: Partial<Omit<Transaction, 'id'>> }
>('transactions/updateTransaction', async ({ id, patch }, { dispatch }) => {
  await api.update(id, patch);
  await Promise.all([dispatch(fetchPage()), dispatch(fetchFull())]);
});

// delete
export const deleteTransaction = createAsyncThunk<void, string>(
  'transactions/deleteTransaction',
  async (id, { dispatch }) => {
    await api.remove(id);
    await Promise.all([dispatch(fetchPage()), dispatch(fetchFull())]);
  }
);

// --- Slice ---
const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<Filters>>) {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    setPageSize(state, action: PayloadAction<number>) {
      state.pageSize = action.payload;
      state.page = 1;
    },
    clearErrors(state) {
      state.errorPage = undefined;
      state.errorFull = undefined;
    },
  },
  extraReducers: builder => {
    builder
      // fetchPage
      .addCase(fetchPage.pending, state => {
        state.loadingPage = true;
        state.errorPage = undefined;
      })
      .addCase(fetchPage.fulfilled, (state, action) => {
        state.loadingPage = false;
        state.pageItems = action.payload.items;
        state.totalCount = action.payload.total;
      })
      .addCase(fetchPage.rejected, (state, action) => {
        state.loadingPage = false;
        state.pageItems = [];
        state.totalCount = 0;
        state.errorPage = action.error.message || 'Failed to load page';
      })
      // fetchFull
      .addCase(fetchFull.pending, state => {
        state.loadingFull = true;
        state.errorFull = undefined;
      })
      .addCase(fetchFull.fulfilled, (state, action) => {
        state.loadingFull = false;
        state.fullItems = action.payload.items;
        state.totals = action.payload.totals;
      })
      .addCase(fetchFull.rejected, (state, action) => {
        state.loadingFull = false;
        state.fullItems = [];
        state.totals = { income: 0, expense: 0, net: 0 };
        state.errorFull = action.error.message || 'Failed to load totals';
      });
  },
});

export const { setFilters, setPage, setPageSize, clearErrors } = transactionsSlice.actions;
export default transactionsSlice.reducer;

// Selectors
export const selectPageItems = (s: any) => (s.transactions as TransactionsState).pageItems;
export const selectTotalCount = (s: any) => (s.transactions as TransactionsState).totalCount;
export const selectLoadingPage = (s: any) => (s.transactions as TransactionsState).loadingPage;
export const selectPageError = (s: any) => (s.transactions as TransactionsState).errorPage;

export const selectFullItems = (s: any) => (s.transactions as TransactionsState).fullItems;
export const selectTotals = (s: any) => (s.transactions as TransactionsState).totals;
export const selectLoadingFull = (s: any) => (s.transactions as TransactionsState).loadingFull;
export const selectFullError = (s: any) => (s.transactions as TransactionsState).errorFull;

export const selectFilters = (s: any) => (s.transactions as TransactionsState).filters;
export const selectPageInfo = (s: any) => {
  const t = s.transactions as TransactionsState;
  return { page: t.page, pageSize: t.pageSize, total: t.totalCount };
};
