import { useState } from 'react'
import { isNumeric } from '../utils/validation'
import { CATEGORY_OPTIONS } from '../constants.ts'

// helper to get local YYYY-MM-DD
function toLocalISODate(d: Date) {
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60000)
  return local.toISOString().slice(0, 10)
}

type Props = {
  onSubmit: (data: { date: string, type: 'Income' | 'Expense', category: string, amount: number, notes?: string }) => void
  initial?: Partial<{ date: string, type: 'Income' | 'Expense', category: string, amount: number, notes?: string }>
}
export default function TransactionForm({ onSubmit, initial = {}}: Props) {
  const [date, setDate] = useState(initial.date || toLocalISODate(new Date()))
  const [type, setType] = useState<'Income' | 'Expense'>(initial.type || 'Expense')
  const [category, setCategory] = useState(initial.category || 'Food')
  const [amount, setAmount] = useState(String(initial.amount ?? ''))
  const [notes, setNotes] = useState(initial.notes || '')
  const [err, setErr] = useState<string | undefined>()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!date) return setErr('Date is required')
    if (!isNumeric(amount)) return setErr('Amount must be numeric')
    onSubmit({ date, type, category, amount: Number(amount), notes: notes || undefined })
    setErr(undefined)
  }

  return (
    <form className="grid" onSubmit={submit} style={{ gridTemplateColumns: 'repeat(6,1fr)', alignItems: 'end' }}>
      <div>
        <label style={{ display: 'block', fontSize: 12, color: '#475569' }}>Type</label>
        <select value={type} onChange={e => setType(e.target.value as any)}>
          <option>Income</option>
          <option>Expense</option>
        </select>
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 12, color: '#475569' }}>Category</label>
        <select value={category} onChange={e => setCategory(e.target.value)}>
          {CATEGORY_OPTIONS.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 12, color: '#475569' }}>Amount</label>
        <input type='number' value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 12, color: '#475569' }}>Notes</label>
        <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional" />
      </div>
      <div>
        <button className="btn" type="submit">Add</button>
        {err && <div style={{ color: '#ef4444', marginTop: 6 }}>{err}</div>}
      </div>
    </form>
  )
}
