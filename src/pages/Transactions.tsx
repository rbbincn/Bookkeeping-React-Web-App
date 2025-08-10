import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store'
import { createTx, deleteTx, fetchList, setFilters, Tx, updateTx } from '../features/transactions/transactionsSlice'
import TransactionForm from '../components/TransactionForm'
import DatePicker from '../components/DatePicker'
import TransactionTable from '../components/TransactionTable'

export default function Transactions() {
  const dispatch = useDispatch<any>()
  const { items, total, loading, error, filters } = useSelector((s:RootState)=>s.transactions)
  const [editing, setEditing] = useState<Tx|undefined>()

  useEffect(()=>{ dispatch(fetchList()) }, [dispatch, filters.page, filters.pageSize, filters.type, filters.category, filters.from, filters.to])

  const onCreate = async (data: Omit<Tx,'id'>) => {
    await dispatch(createTx(data))
  }
  const onUpdate = async (data: Omit<Tx,'id'>) => {
    if (!editing) return
    await dispatch(updateTx({id: editing.id, patch: data}))
    setEditing(undefined)
  }

  const controls = (
    <div className="card">
      <div className="row">
        <DatePicker label="From" value={filters.from} onChange={v=>dispatch(setFilters({from:v, page:1}))} />
        <DatePicker label="To" value={filters.to} onChange={v=>dispatch(setFilters({to:v, page:1}))} />
        <div>
          <label style={{display:'block', fontSize:12, color:'#475569'}}>Type</label>
          <select value={filters.type || ''} onChange={e=>dispatch(setFilters({type: e.target.value as any || undefined, page:1}))}>
            <option value="">All</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>
        </div>
        <div>
          <label style={{display:'block', fontSize:12, color:'#475569'}}>Category</label>
          <input value={filters.category || ''} onChange={e=>dispatch(setFilters({category: e.target.value || undefined, page:1}))} placeholder="e.g., Food" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="grid" style={{gridTemplateColumns:'1fr', gap:'1rem'}}>
      {controls}
      <div className="card">
        <h3>{editing ? 'Edit Transaction' : 'Add Transaction'}</h3>
        <TransactionForm onSubmit={editing ? onUpdate : onCreate} initial={editing} submitLabel={editing ? 'Update' : 'Add'} />
      </div>
      {error && <div className="card" style={{color:'#ef4444'}}>Error: {error}</div>}
      <TransactionTable
        items={items}
        page={filters.page}
        pageSize={filters.pageSize}
        total={total}
        onPageChange={(p)=>dispatch(setFilters({page:p}))}
        onEdit={setEditing}
        onDelete={(id)=>dispatch(deleteTx(id))}
      />
      {loading && <div className="card">Loading…</div>}
    </div>
  )
}
