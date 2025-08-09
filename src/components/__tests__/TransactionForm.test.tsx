import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import TransactionForm from '../TransactionForm'

test('renders form and submits', async () => {
  const onSubmit = jest.fn()
  render(<TransactionForm onSubmit={onSubmit} />)
  const date = screen.getByRole('textbox', { name: /date/i }) || screen.getByDisplayValue?.('')
  // fill fields by query selectors
  const inputs = screen.getAllByRole('textbox')
  // fallback simpler: find by placeholder or buttons
  const addBtn = screen.getByText('Add')
  // set minimal required fields via querySelector
  const dateInput = document.querySelector('input[type=date]') as HTMLInputElement
  const amountInput = document.querySelector('input[type=number]') as HTMLInputElement
  dateInput.value = '2025-08-08'
  amountInput.value = '12'
  fireEvent.change(dateInput)
  fireEvent.change(amountInput)
  fireEvent.click(addBtn)
  expect(onSubmit).toHaveBeenCalled()
})
