import React from 'react'
import { Transaction } from '../mockApi'

type Props = { items: Transaction[], onDelete: (id: string)=>void }

export default function TransactionList({ items, onDelete }: Props) {
  return (
    <table aria-label="transactions-table">
      <thead>
        <tr><th>Date</th><th>Type</th><th>Category</th><th>Amount</th><th>Notes</th><th>Action</th></tr>
      </thead>
      <tbody>
        {items.map(it => (
          <tr key={it.id}>
            <td>{it.date}</td>
            <td>{it.type}</td>
            <td>{it.category}</td>
            <td>{it.amount}</td>
            <td>{it.notes}</td>
            <td><button onClick={()=>onDelete(it.id)}>Delete</button></td>
          </tr>
        ))}
        {items.length===0 && <tr><td colSpan={6}>No transactions</td></tr>}
      </tbody>
    </table>
  )
}
