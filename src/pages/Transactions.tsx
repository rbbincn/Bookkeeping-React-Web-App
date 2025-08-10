import { useEffect, useState } from 'react';
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
  const { page, pageSize, errorPage } = useSelector((s: RootState) => s.transactions);
  const filters = useSelector(selectFilters);
  // track which row is being edited (null = add mode)
  const [editing, setEditing] = useState<Tx | null>(null);

  // initial page load
  useEffect(() => { dispatch(fetchPage()); }, [dispatch]);

  // Strong linkage: filters change -> refresh page + full
  useEffect(() => {
    dispatch(fetchPage());
    dispatch(fetchFull());
  }, [dispatch, filters]);

  return (
    <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '1rem' }}>
      <UnifiedFilter refreshPage refreshFull />
      <div className="card">
        <h3>{editing ? 'Edit Transaction' : 'Add Transaction'}</h3>

        <TransactionForm
          initial={editing ?? {}}
          submitLabel={editing ? 'Save' : 'Add'}
          onSubmit={(data) => {
            if (editing) {
              // update with all editable fields, then exit edit mode
              dispatch(updateTransaction({ id: editing.id, patch: data }))
                .then(() => setEditing(null));
            } else {
              dispatch(createTransaction(data));
            }
          }}
        />
      </div>
      {errorPage && <div style={{ color: '#ef4444' }}>Error: {errorPage}</div>}
      <TransactionTable
        items={items}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={(p) => { dispatch(setPage(p)); dispatch(fetchPage()); }}
        onEdit={(tx) => setEditing(tx)}  
        //onEdit={(tx) => dispatch(updateTransaction({ id: tx.id, patch: { amount: tx.amount, notes: tx.notes } }))}
        onDelete={(id) => dispatch(deleteTransaction(id))}
      />
    </div>
  );
}
