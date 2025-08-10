// src/api/mockApi.ts

import { Transaction, Filters } from '../features/transactions/transactionsSlice';
import { v4 as uuidv4 } from 'uuid';

// 固定数据：2024-01 ~ 2025-12，每月一条（Income/Expense交替）
export const transactions: Transaction[] = (() => {
  const data: Transaction[] = [];
  const categories = ['Salary', 'Food'];
  let toggle = true;
  for (let year = 2024; year <= 2025; year++) {
    for (let month = 1; month <= 12; month++) {
      data.push({
        id: uuidv4(),
        date: `${year}-${String(month).padStart(2, '0')}-15`,
        type: toggle ? 'Income' : 'Expense',
        category: toggle ? categories[0] : categories[1],
        amount: toggle ? 5000 : 200,
        notes: toggle ? 'Monthly salary' : 'Dining out',
      });
      toggle = !toggle;
    }
  }
  return data;
})();

// 模拟延迟
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// 过滤函数
function applyFilters(list: Transaction[], filters?: Filters) {
  let result = [...list];
  if (filters?.from) {
    result = result.filter(t => t.date >= filters.from!);
  }
  if (filters?.to) {
    result = result.filter(t => t.date <= filters.to!);
  }
  if (filters?.type) {
    result = result.filter(t => t.type === filters.type);
  }
  if (filters?.category) {
    result = result.filter(t => t.category.toLowerCase().includes(filters.category.toLowerCase()));
  }
  return result;
}

// 分页查询
export async function list(params: Filters & { page: number; pageSize: number }) {
  await delay(300);
  const filtered = applyFilters(transactions, params);
  const start = (params.page - 1) * params.pageSize;
  const end = start + params.pageSize;
  return {
    items: filtered.slice(start, end),
    total: filtered.length,
  };
}

// 全量查询（Dashboard）
export async function listAll(filters?: Filters) {
  await delay(200);
  return applyFilters(transactions, filters);
}

// CRUD
export async function create(tx: Omit<Transaction, 'id'>) {
  await delay(200);
  transactions.push({ ...tx, id: uuidv4() });
}

export async function update(id: string, patch: Partial<Omit<Transaction, 'id'>>) {
  await delay(200);
  const idx = transactions.findIndex(t => t.id === id);
  if (idx >= 0) {
    transactions[idx] = { ...transactions[idx], ...patch };
  }
}

export async function remove(id: string) {
  await delay(200);
  const idx = transactions.findIndex(t => t.id === id);
  if (idx >= 0) {
    transactions.splice(idx, 1);
  }
}
