import Pagination from './Pagination'
import { Tx } from '../features/transactions/transactionsSlice'

type Props = {
  items: Tx[]
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onEdit: (tx: Tx) => void
  onDelete: (id: string) => void
}

export default function TransactionTable({ items, page, pageSize, total, onPageChange, onEdit, onDelete }: Props) {
  return (
    <div className="card">
      <table>
        <thead>
          <tr><th>Date</th><th>Type</th><th>Category</th><th>Amount</th><th>Notes</th><th></th></tr>
        </thead>
        <tbody>
          {items.map(t => (
            <tr key={t.id}>
              <td>{t.date}</td>
              <td><span className="pill">{t.type}</span></td>
              <td>{t.category}</td>
              <td style={{ color: t.type === 'Income' ? '#16a34a' : '#ef4444' }}>{t.type === 'Income' ? '+' : '-'}{t.amount.toFixed(2)}</td>
              <td>{t.notes}</td>
              <td className="row">
                <button className="btn ghost" onClick={() => onEdit(t)}>Edit</button>
                <button className="btn danger" onClick={() => onDelete(t.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: '1rem' }}>No transactions</td></tr>}
        </tbody>
      </table>
      <div style={{ marginTop: '.75rem' }}>
        <Pagination page={page} pageSize={pageSize} total={total} onChange={onPageChange} />
      </div>
    </div>
  )
}
