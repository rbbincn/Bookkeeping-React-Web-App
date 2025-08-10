import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import {
  createTransaction,
  deleteTransaction,
  fetchPage,
  fetchFull,
  selectFilters,
  selectPageItems,
  selectTotalCount,
  setPage,
  updateTransaction,
} from '../features/transactions/transactionsSlice';
import TransactionForm from '../components/TransactionForm';
import TransactionTable from '../components/TransactionTable';
import UnifiedFilter from '../components/UnifiedFilter';

export default function Transactions() {
  const dispatch = useDispatch<any>();

  // redux state
  const items = useSelector(selectPageItems);
  const total = useSelector(selectTotalCount);
  const { page, pageSize, loadingPage, errorPage } = useSelector((s: RootState) => s.transactions);
  const filters = useSelector(selectFilters);

  // initial page load
  useEffect(() => { dispatch(fetchPage()); }, [dispatch]);

  // Strong linkage: filters change -> refresh page + full
  useEffect(() => {
    dispatch(fetchPage());
    dispatch(fetchFull());
  }, [dispatch, filters]);

  return (
    <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '1rem' }}>
      <div className="card">
        <h3>Add Transaction</h3>
        <TransactionForm onSubmit={(tx) => dispatch(createTransaction(tx))} />
      </div>

      <UnifiedFilter refreshPage refreshFull />

      {errorPage && <div className="card" style={{ color: '#ef4444' }}>Error: {errorPage}</div>}

      <TransactionTable
        items={items}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={(p) => { dispatch(setPage(p)); dispatch(fetchPage()); }}
        onEdit={(tx) => dispatch(updateTransaction({ id: tx.id, patch: { amount: tx.amount, notes: tx.notes } }))}
        onDelete={(id) => dispatch(deleteTransaction(id))}
      />
    </div>
  );
}
