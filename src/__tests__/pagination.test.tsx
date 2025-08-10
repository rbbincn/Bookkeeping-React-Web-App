import { render, screen, fireEvent } from '@testing-library/react'
import Pagination from '../components/Pagination'

test('pagination next & prev', () => {
  const onChange = jest.fn()
  render(<Pagination page={1} pageSize={10} total={35} onChange={onChange} />)
  fireEvent.click(screen.getByText('Next'))
  expect(onChange).toHaveBeenCalledWith(2)
})
