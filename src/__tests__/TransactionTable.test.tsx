import { render, screen, fireEvent } from '@testing-library/react'
import TransactionTable from '../components/TransactionTable'
import { Tx } from '../features/transactions/transactionsSlice'

const items: Tx[] = [
  { id:'1', date:'2025-01-01', type:'Expense', category:'Food', amount:10, notes:'' }
]

test('calls edit and delete callbacks', () => {
  const onEdit = jest.fn()
  const onDelete = jest.fn()
  const onPage = jest.fn()
  render(<TransactionTable items={items} page={1} pageSize={10} total={1} onPageChange={onPage} onEdit={onEdit} onDelete={onDelete} />)
  fireEvent.click(screen.getByText('Edit'))
  expect(onEdit).toHaveBeenCalled()
  fireEvent.click(screen.getByText('Delete'))
  expect(onDelete).toHaveBeenCalled()
})

test('shows empty state', () => {
  const onEdit = jest.fn()
  const onDelete = jest.fn()
  const onPage = jest.fn()
  render(<TransactionTable items={[]} page={1} pageSize={10} total={0} onPageChange={onPage} onEdit={onEdit} onDelete={onDelete} />)
  expect(screen.getByText(/No transactions/i)).toBeInTheDocument()
})
