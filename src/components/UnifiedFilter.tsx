import { useEffect, useId, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters as setSliceFilters, fetchPage, fetchFull } from '../features/transactions/transactionsSlice';
import type { RootState } from '../store';

type Mode = 'month' | 'year' | 'custom';
type Props = { refreshPage?: boolean; refreshFull?: boolean };

const pad = (n: number) => String(n).padStart(2, '0');
const lastDay = (y: number, m: number) => pad(new Date(y, m, 0).getDate());

export default function UnifiedFilter({ refreshPage = false, refreshFull = true }: Props) {
  const dispatch = useDispatch<any>();
  const storeFilters = useSelector((s: RootState) => s.transactions.filters);

  const today = new Date();
  const curYear = String(today.getFullYear());
  const curMonth = `${curYear}-${pad(today.getMonth() + 1)}`;

  const [mode, setMode] = useState<Mode>('month');
  const [month, setMonth] = useState<string>(curMonth);
  const [year, setYear] = useState<string>(curYear);
  const [from, setFrom] = useState<string>(`${curYear}-01-01`);
  const [to, setTo] = useState<string>(`${curYear}-12-31`);
  const [type, setType] = useState<string>('');
  const [category, setCategory] = useState<string>('');

  // Initialize from store once (if you reload or navigate back)
  useEffect(() => {
    if (storeFilters.from && storeFilters.to) {
      const f = storeFilters.from, t = storeFilters.to;
      if (f.slice(0, 7) === t.slice(0, 7)) { setMode('month'); setMonth(f.slice(0, 7)); }
      else if (f.endsWith('-01-01') && t.endsWith('-12-31') && f.slice(0, 4) === t.slice(0, 4)) {
        setMode('year'); setYear(f.slice(0, 4));
      } else { setMode('custom'); setFrom(f); setTo(t); }
    }
    if (storeFilters.type) setType(storeFilters.type);
    if (storeFilters.category) setCategory(storeFilters.category);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const idM = useId(), idY = useId(), idC = useId();

  function emit(next: { mode: Mode; month: string; year: string; from: string; to: string; type: string; category: string; }) {
    let F = next.from, T = next.to;
    if (next.mode === 'month' && /^\d{4}-\d{2}$/.test(next.month)) {
      const [y, m] = next.month.split('-').map(Number);
      F = `${next.month}-01`; T = `${y}-${pad(m)}-${lastDay(y, m)}`;
    } else if (next.mode === 'year' && /^\d{4}$/.test(next.year)) {
      F = `${next.year}-01-01`; T = `${next.year}-12-31`;
    }
    dispatch(setSliceFilters({
      from: F || undefined,
      to: T || undefined,
      type: (next.type || undefined) as any,
      category: next.category || undefined,
    }));
    if (refreshPage) dispatch(fetchPage());
    if (refreshFull) dispatch(fetchFull());
  }

  return (
    <div className="card">
      <div className="row" style={{ gap: '1rem', alignItems: 'end', flexWrap: 'wrap' }}>
        {/* Month */}
        <div className="row" style={{ gap: '.5rem', alignItems: 'center' }}>
          <input id={idM} type="radio" name="mode" checked={mode === 'month'} onChange={() => {
            setMode('month');
            emit({ mode: 'month', month, year, from, to, type, category });
          }} />
          <label htmlFor={idM}>Month</label>
          <input type="month" value={month} onChange={e => {
            const v = e.target.value;
            setMonth(v); setMode('month');
            emit({ mode: 'month', month: v, year, from, to, type, category });
          }} />
        </div>

        {/* Year */}
        <div className="row" style={{ gap: '.5rem', alignItems: 'center' }}>
          <input id={idY} type="radio" name="mode" checked={mode === 'year'} onChange={() => {
            setMode('year');
            emit({ mode: 'year', month, year, from, to, type, category });
          }} />
          <label htmlFor={idY}>Year</label>
          <input
            type="number" min={1970} max={2100} placeholder="YYYY" value={year}
            onChange={e => {
              const v = e.target.value.slice(0, 4) || curYear;
              setYear(v); setMode('year');
              emit({ mode: 'year', month, year: v, from, to, type, category });
            }}
            style={{ width: 90 }}
          />
        </div>

        {/* Custom */}
        <div className="row" style={{ gap: '.5rem', alignItems: 'center' }}>
          <input id={idC} type="radio" name="mode" checked={mode === 'custom'} onChange={() => {
            setMode('custom');
            emit({ mode: 'custom', month, year, from, to, type, category });
          }} />
          <label htmlFor={idC}>Custom</label>
          <input type="date" value={from} onChange={e => {
            const v = e.target.value;
            setFrom(v); setMode('custom');
            emit({ mode: 'custom', month, year, from: v, to, type, category });
          }} />
          <span>to</span>
          <input type="date" value={to} onChange={e => {
            const v = e.target.value;
            setTo(v); setMode('custom');
            emit({ mode: 'custom', month, year, from, to: v, type, category });
          }} />
        </div>

        {/* Type */}
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#475569' }}>Type</label>
          <select value={type} onChange={e => {
            const v = e.target.value;
            setType(v);
            emit({ mode, month, year, from, to, type: v, category });
          }}>
            <option value="">All</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>
        </div>

        {/* Category */}
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#475569' }}>Category</label>
          <input placeholder="e.g., Food" value={category} onChange={e => {
            const v = e.target.value;
            setCategory(v);
            emit({ mode, month, year, from, to, type, category: v });
          }} />
        </div>
      </div>
    </div>
  );
}
