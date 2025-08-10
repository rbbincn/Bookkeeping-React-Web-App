import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import TransactionForm from '../components/TransactionForm'

test('shows error when amount is not numeric (empty amount)', async () => {
  const onSubmit = jest.fn()
  render(<TransactionForm onSubmit={onSubmit} />)

  fireEvent.click(screen.getByText(/add/i))

  await waitFor(() => {
    expect(screen.getByText(/amount must be numeric/i)).toBeInTheDocument()
  })
  expect(onSubmit).not.toHaveBeenCalled()
})

test('submits valid data', async () => {
  const onSubmit = jest.fn()
  render(<TransactionForm onSubmit={onSubmit} />)

  const amt = screen.getByPlaceholderText('0.00') as HTMLInputElement
  fireEvent.change(amt, { target: { value: '12.5' } })

  fireEvent.click(screen.getByText(/add/i))

  await waitFor(() => {
    expect(onSubmit).toHaveBeenCalled()
  })
})
