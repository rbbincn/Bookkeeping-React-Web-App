import React, { useEffect, useState } from 'react'
import { Transaction, createMockApi, MockApi } from './mockApi'
import TransactionForm from './components/TransactionForm'
import Pagination from './components/Pagination'
import TransactionList from './components/TransactionList'

const api: MockApi = createMockApi()

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [page, setPage] = useState(1)
  const [pageSize] = useState(5)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(()=> {
    fetchPage(page)
  }, [page])

  async function fetchPage(p: number) {
    setLoading(true)
    const res = await api.listTransactions({ page: p, pageSize })
    setTransactions(res.items)
    setTotal(res.total)
    setLoading(false)
  }

  async function handleAdd(t: Omit<Transaction,'id'>) {
    await api.createTransaction(t)
    setPage(1)
    fetchPage(1)
  }

  async function handleDelete(id: string) {
    await api.deleteTransaction(id)
    fetchPage(page)
  }

  return (
    <div className="container">
      <h1>Bookkeeping App</h1>
      <TransactionForm onSubmit={handleAdd} />
      <div className="summary">Total transactions: {total}</div>
      {loading ? <div>Loading...</div> : (
        <>
          <TransactionList items={transactions} onDelete={handleDelete} />
          <Pagination current={page} pageSize={pageSize} total={total} onChange={setPage} />
        </>
      )}
    </div>
  )
}
