import { render, screen, fireEvent } from '@testing-library/react'
import TransactionForm from '../components/TransactionForm'

test('shows error when amount is not numeric', () => {
  const onSubmit = jest.fn()
  render(<TransactionForm onSubmit={onSubmit} />)
  fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: 'abc' } })
  fireEvent.click(screen.getByText('Add'))
  expect(screen.getByText(/amount must be numeric/i)).toBeInTheDocument()
  expect(onSubmit).not.toHaveBeenCalled()
})

test('submits valid data', () => {
  const onSubmit = jest.fn()
  render(<TransactionForm onSubmit={onSubmit} />)
  fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '12.5' } })
  fireEvent.click(screen.getByText('Add'))
  expect(onSubmit).toHaveBeenCalled()
})
