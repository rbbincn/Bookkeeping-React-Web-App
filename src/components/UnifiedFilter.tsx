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

  // Default mode is 'custom', with no date limits (full dataset)
  const [mode, setMode] = useState<Mode>('custom');
  const [month, setMonth] = useState(curM);
  const [year, setYear] = useState(curY);
  const [from, setFrom] = useState<string>(''); // date picker display only; empty = no limit
  const [to, setTo] = useState<string>('');     // date picker display only; empty = no limit
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');

  // On mount, restore UI state from Redux filters so switching pages keeps the selection
  useEffect(() => {
    if (storeFilters.from && storeFilters.to) {
      const f = storeFilters.from; const t = storeFilters.to;
      if (f.slice(0,7) === t.slice(0,7)) {
        // Month mode
        setMode('month'); setMonth(f.slice(0,7));
      } else if (f.endsWith('-01-01') && t.endsWith('-12-31') && f.slice(0,4) === t.slice(0,4)) {
        // Year mode
        setMode('year'); setYear(f.slice(0,4));
      } else {
        // Custom mode with specific range
        setMode('custom'); setFrom(f); setTo(t);
      }
    } else {
      // ✅ No from/to in Redux → stay in custom mode with full data
      setMode('custom'); setFrom(''); setTo('');
    }
    if (storeFilters.type) setType(storeFilters.type);
    if (storeFilters.category) setCategory(storeFilters.category);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const idM = useId(), idY = useId(), idC = useId();

  /**
   * Merge partial filter changes with current Redux filters.
   * In custom mode:
   * - If no from/to provided, clear them in Redux (full dataset)
   * - If provided as empty string, also clear them
   */
  const emit = (ov: Partial<{ mode: Mode; month: string; year: string; from: string; to: string; type: string; category: string; }>) => {
    const nextMode = ov.mode ?? mode;
    const nextMonth = ov.month ?? month;
    const nextYear = ov.year ?? year;

    // Start from existing Redux filters to avoid wiping untouched fields
    const merged: any = { ...storeFilters };

    if (nextMode === 'month' && /^\d{4}-\d{2}$/.test(nextMonth)) {
      // Month mode → calculate full month range
      const [y, m] = nextMonth.split('-').map(Number);
      merged.from = `${nextMonth}-01`;
      merged.to = `${y}-${pad(m)}-${lastDay(y, m)}`;
    } else if (nextMode === 'year' && /^\d{4}$/.test(nextYear)) {
      // Year mode → full year range
      merged.from = `${nextYear}-01-01`;
      merged.to = `${nextYear}-12-31`;
    } else {
      // Custom mode
      if ('from' in ov || 'to' in ov) {
        // Use provided range if given, else clear
        merged.from = ov.from ? ov.from : undefined;
        merged.to = ov.to ? ov.to : undefined;
      } else {
        // No range provided → clear for full dataset
        merged.from = undefined;
        merged.to = undefined;
      }
    }

    // Override type/category only if explicitly provided
    if (ov.type !== undefined) merged.type = ov.type || undefined;
    if (ov.category !== undefined) merged.category = ov.category || undefined;
    merged.mode = nextMode;

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
            onChange={() => {
              // Switch to custom and clear date range (full dataset)
              setMode('custom');
              emit({ mode: 'custom', from: '', to: '' });
            }}
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

      {/* Row 2: type + category */}
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
          <select
            className="uf-input"
            value={category}
            onChange={(e) => { const v = e.target.value; setCategory(v); emit({ category: v }); }}
          >
            <option value="">All</option>
            {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
