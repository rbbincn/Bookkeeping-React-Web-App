import React, { useState } from 'react'
import { Transaction } from '../mockApi'

type Props = {
  onSubmit: (t: Omit<Transaction,'id'>) => Promise<void> | void
}

export default function TransactionForm({ onSubmit }: Props) {
  const [date, setDate] = useState('')
  const [type, setType] = useState<'Income'|'Expense'>('Expense')
  const [category, setCategory] = useState('Food')
  const [amount, setAmount] = useState<number | ''>('')
  const [notes, setNotes] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!date || amount === '') {
      alert('Please fill required fields: date and amount')
      return
    }
    await onSubmit({ date, type, category, amount: Number(amount), notes })
    // reset minimally
    setDate('')
    setAmount('')
    setNotes('')
  }

  return (
    <form onSubmit={submit} aria-label="transaction-form">
      <div className="form-row">
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} required />
        <select value={type} onChange={e=>setType(e.target.value as any)}>
          <option>Expense</option>
          <option>Income</option>
        </select>
        <input placeholder="Category" value={category} onChange={e=>setCategory(e.target.value)} />
        <input placeholder="Amount" value={amount} onChange={e=>setAmount(e.target.value === '' ? '' : Number(e.target.value))} type="number" required />
        <button type="submit">Add</button>
      </div>
      <div style={{marginTop:8}}>
        <textarea placeholder="Notes (optional)" value={notes} onChange={e=>setNotes(e.target.value)} />
      </div>
    </form>
  )
}
