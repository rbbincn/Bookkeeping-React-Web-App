// src/api/mockApi.ts
// Fixed, richer mock data:
// - 2024-01 ~ 2025-12, four transactions per month
// - Deterministic pseudo-random categories/amounts
// - Always returned in DESC (newest-first) order

import { v4 as uuidv4 } from 'uuid';
import {CATEGORY_OPTIONS} from '../constants.ts'

export type Tx = {
  id: string;
  date: string;
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

// Simple deterministic PRNG so tests stay stable
function prng(seed: number) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}
function pickCategory(y: number, m: number, k: number) {
  const idx = Math.floor(prng(y * 100 + m * 10 + k) * CATEGORY_OPTIONS.length);
  return CATEGORY_OPTIONS[idx];
}
function pickAmount(y: number, m: number, k: number, type: 'Income' | 'Expense') {
  const r = prng((y + 1) * 100 + (m + 3) * 10 + (k + 7));
  if (type === 'Income') {
    // 3000 ~ 7000
    return Math.round((3000 + r * 4000) * 100) / 100;
  } else {
    // 20 ~ 400
    return Math.round((20 + r * 380) * 100) / 100;
  }
}

// Build 2025 -> 2024 (then we still sort, to be safe)
const transactions: Tx[] = [];
const DAYS = [26, 19, 12, 5]; // 4 per month, spaced
for (let year = 2025; year >= 2024; year--) {
  const monthStart = year === 2025 ? 8 : 12; // 2025 到 8 月
  for (let month = monthStart; month >= 1; month--) {
    for (let i = 0; i < 4; i++) {
      const day = DAYS[i];
      const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const type: 'Income' | 'Expense' = (i % 2 === 0) ? 'Income' : 'Expense';
      const category = pickCategory(year, month, i);
      const amount = pickAmount(year, month, i, type);
      transactions.push({
        id: uuidv4(),
        date,
        type,
        category,
        amount,
        notes: type === 'Income' ? 'Auto income record' : 'Auto expense record',
      });
    }
  }
}

// Simulated delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Core filter
function applyFilters(list: Tx[], filters?: Filters) {
  let result = [...list];
  if (filters?.from) result = result.filter(t => t.date >= filters.from!);
  if (filters?.to) result = result.filter(t => t.date <= filters.to!);
  if (filters?.type) result = result.filter(t => t.type === filters.type);
  if (filters?.category) {
    const q = filters.category.toLowerCase();
    result = result.filter(t => t.category.toLowerCase().includes(q));
  }
  // Always DESC by date (newest first)
  result.sort((a, b) => b.date.localeCompare(a.date));
  return result;
}

// Paginated list
export async function list(params: Filters & { page: number; pageSize: number }) {
  await delay(200);
  const filtered = applyFilters(transactions, params);
  const start = (params.page - 1) * params.pageSize;
  const end = start + params.pageSize;
  return {
    items: filtered.slice(start, end),
    total: filtered.length,
  };
}

// Unpaginated list (Dashboard totals / charts)
export async function listAll(filters?: Filters) {
  await delay(150);
  return applyFilters(transactions, filters);
}

// CRUD operations (mutate in-memory data)
export async function create(tx: Omit<Tx, 'id'>) {
  await delay(120);
  const record: Tx = { ...tx, id: uuidv4() };
  transactions.push(record);
}

export async function update(id: string, patch: Partial<Omit<Tx, 'id'>>) {
  await delay(120);
  const idx = transactions.findIndex(t => t.id === id);
  if (idx >= 0) transactions[idx] = { ...transactions[idx], ...patch };
}

export async function remove(id: string) {
  await delay(120);
  const idx = transactions.findIndex(t => t.id === id);
  if (idx >= 0) transactions.splice(idx, 1);
}

// (optional) export data for debugging
export function __data() { return [...transactions].sort((a, b) => b.date.localeCompare(a.date)); }
