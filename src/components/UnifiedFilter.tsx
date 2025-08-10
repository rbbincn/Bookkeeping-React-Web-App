import { useId, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  setFilters as setSliceFilters,
  fetchPage,
  fetchFull,
} from '../features/transactions/transactionsSlice';
import { CATEGORY_OPTIONS } from '../constants.ts'

type Mode = 'month' | 'year' | 'custom';
type Props = { refreshPage?: boolean; refreshFull?: boolean };

const pad = (n: number) => String(n).padStart(2, '0');
const lastDay = (y: number, m: number) => pad(new Date(y, m, 0).getDate());

export default function UnifiedFilter({ refreshPage = false, refreshFull = true }: Props) {
  const dispatch = useDispatch<any>();

  const today = new Date();
  const curY = String(today.getFullYear());
  const curM = `${curY}-${pad(today.getMonth() + 1)}`;

  const [mode, setMode] = useState<Mode>('month');
  const [month, setMonth] = useState(curM);
  const [year, setYear] = useState(curY);
  const [from, setFrom] = useState(`${curY}-01-01`);
  const [to, setTo] = useState(`${curY}-12-31`);
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');

  const idM = useId(), idY = useId(), idC = useId();

  const emit = (ov: Partial<{
    mode: Mode; month: string; year: string; from: string; to: string; type: string; category: string;
  }>) => {
    const next = { mode, month, year, from, to, type, category, ...ov };

    let F = next.from, T = next.to;
    if (next.mode === 'month' && /^\d{4}-\d{2}$/.test(next.month)) {
      const [y, m] = next.month.split('-').map(Number);
      F = `${next.month}-01`;
      T = `${y}-${pad(m)}-${lastDay(y, m)}`;
    } else if (next.mode === 'year' && /^\d{4}$/.test(next.year)) {
      F = `${next.year}-01-01`;
      T = `${next.year}-12-31`;
    }

    dispatch(setSliceFilters({
      from: F || undefined,
      to: T || undefined,
      type: (next.type || undefined) as any,
      category: next.category || undefined,
    }));
    if (refreshPage) dispatch(fetchPage());
    if (refreshFull) dispatch(fetchFull());
  };

  return (
    <div className="uf-container">
      <h3>Filters</h3>
      <div className="uf-row uf-time">
        <input
          id={idM} type="radio" name="mode"
          checked={mode === 'month'}
          onChange={() => { setMode('month'); emit({ mode: 'month' }); }}
        />
        <label>Month</label>
        <input
          className="uf-input"
          type="month"
          value={month}
          onChange={(e) => { const v = e.target.value; setMonth(v); setMode('month'); emit({ mode: 'month', month: v }); }}
        />

        <label className="uf-radio">
          <input
            id={idY} type="radio" name="mode"
            checked={mode === 'year'}
            onChange={() => { setMode('year'); emit({ mode: 'year' }); }}
          />
          <span>Year</span>
        </label>
        <input
          className="uf-input uf-year"
          type="number" min={1970} max={2100} placeholder="YYYY"
          value={year}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '').slice(0, 4) || curY;
            setYear(v); setMode('year'); emit({ mode: 'year', year: v });
          }}
        />
        <label className="uf-radio">
          <input
            id={idC} type="radio" name="mode"
            checked={mode === 'custom'}
            onChange={() => { setMode('custom'); emit({ mode: 'custom' }); }}
          />
          <label>Custom</label>
        </label>
        <input
          className="uf-input"
          type="date"
          value={from}
          onChange={(e) => { const v = e.target.value; setFrom(v); setMode('custom'); emit({ mode: 'custom', from: v }); }}
        />
        <span className="uf-to">to</span>
        <input
          className="uf-input"
          type="date"
          value={to}
          onChange={(e) => { const v = e.target.value; setTo(v); setMode('custom'); emit({ mode: 'custom', to: v }); }}
        />
      </div>

      <div className="uf-row uf-meta">
        <div className="uf-field">
          <label>Type</label>
          <select
            className="uf-input"
            value={type}
            onChange={(e) => { const v = e.target.value; setType(v); emit({ type: v }); }}
          >
            <option value="">All</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>
        </div>

        <div className="uf-field">
          <label>Category</label>
          <select value={category} onChange={(e) => { const v = e.target.value; setCategory(v); emit({ category: v }); }}>
            {CATEGORY_OPTIONS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
