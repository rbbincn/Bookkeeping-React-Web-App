import { useEffect, useId, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setFilters as setSliceFilters,
  fetchPage,
  fetchFull,
} from '../features/transactions/transactionsSlice';
import type { RootState } from '../store';
import { CATEGORY_OPTIONS } from '../constants.ts';

type Mode = 'month' | 'year' | 'custom';
type Props = { refreshPage?: boolean; refreshFull?: boolean };

const pad = (n: number) => String(n).padStart(2, '0');
const lastDay = (y: number, m: number) => pad(new Date(y, m, 0).getDate());

export default function UnifiedFilter({ refreshPage = false, refreshFull = true }: Props) {
  const dispatch = useDispatch<any>();
  const storeFilters = useSelector((s: RootState) => s.transactions.filters);

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

  // Initialize local UI from Redux filters once (on mount), so switching pages preserves selections.
  useEffect(() => {
    if (storeFilters.from && storeFilters.to) {
      const f = storeFilters.from; const t = storeFilters.to;
      if (f.slice(0,7) === t.slice(0,7)) {
        setMode('month'); setMonth(f.slice(0,7));
      } else if (f.endsWith('-01-01') && t.endsWith('-12-31') && f.slice(0,4) === t.slice(0,4)) {
        setMode('year'); setYear(f.slice(0,4));
      } else {
        setMode('custom'); setFrom(f); setTo(t);
      }
    }
    if (storeFilters.type) setType(storeFilters.type);
    if (storeFilters.category) setCategory(storeFilters.category);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const idM = useId(), idY = useId(), idC = useId();

  /**
   * Emit next filters by MERGING with current Redux filters.
   * Only override keys that were actually passed in (avoid wiping type/category on date-only changes).
   */
  const emit = (ov: Partial<{ mode: Mode; month: string; year: string; from: string; to: string; type: string; category: string; }>) => {
    const nextMode = ov.mode ?? mode;
    const nextMonth = ov.month ?? month;
    const nextYear = ov.year ?? year;
    const nextFromRaw = ov.from ?? from;
    const nextToRaw = ov.to ?? to;

    // Start from store filters to preserve fields not explicitly changed
    const merged: any = { ...storeFilters };

    // Compute final from/to based on effective mode/month/year
    if (nextMode === 'month' && /^\d{4}-\d{2}$/.test(nextMonth)) {
      const [y, m] = nextMonth.split('-').map(Number);
      merged.from = `${nextMonth}-01`;
      merged.to = `${y}-${pad(m)}-${lastDay(y, m)}`;
    } else if (nextMode === 'year' && /^\d{4}$/.test(nextYear)) {
      merged.from = `${nextYear}-01-01`;
      merged.to = `${nextYear}-12-31`;
    } else {
      // custom: keep provided or existing
      if (ov.from !== undefined) merged.from = nextFromRaw;
      if (ov.to !== undefined) merged.to = nextToRaw;
    }

    // Only override type/category if provided in this change
    if (ov.type !== undefined) merged.type = ov.type || undefined;
    if (ov.category !== undefined) merged.category = ov.category || undefined;

    dispatch(setSliceFilters(merged));
    if (refreshPage) dispatch(fetchPage());
    if (refreshFull) dispatch(fetchFull());
  };

  return (
    <div className="uf card">
      {/* Row 1: time filters */}
      <div className="uf-row uf-time">
        <label className="uf-radio">
          <input
            id={idM} type="radio" name="mode"
            checked={mode === 'month'}
            onChange={() => { setMode('month'); emit({ mode: 'month' }); }}
          />
          <span>Month</span>
        </label>
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
          <span>Custom</span>
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
            <option value="">All</option>
            {CATEGORY_OPTIONS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
