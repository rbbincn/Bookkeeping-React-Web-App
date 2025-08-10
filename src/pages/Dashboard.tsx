import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { fetchFull, selectTotals } from '../features/transactions/transactionsSlice';
import UnifiedFilter from '../components/UnifiedFilter';
import StatsChart from '../components/StatsChart';

export default function Dashboard() {
  const dispatch = useDispatch<any>();
  const totals = useSelector(selectTotals);
  const all = useSelector((s: RootState) => s.transactions.fullItems) || [];

  useEffect(() => {
    dispatch(fetchFull());
  }, [dispatch]);

  return (
    <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '1rem' }}>
      <UnifiedFilter refreshFull />
      <div className="card row" style={{ justifyContent: 'space-between' }}>
        <div><strong>Total Income:</strong> ${totals.income.toFixed(2)}</div>
        <div><strong>Total Expenses:</strong> ${totals.expense.toFixed(2)}</div>
        <div><strong>Net:</strong> ${totals.net.toFixed(2)}</div>
      </div>
      <div className="card">
        <h3>Overview</h3>
        <StatsChart items={all} />
      </div>
    </div>
  );
}
