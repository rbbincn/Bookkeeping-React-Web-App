import reducer, { setFilters } from '../features/transactions/transactionsSlice'

test('setFilters updates filters and page', () => {
  const state = reducer(undefined, {type:'@@INIT'}) as any
  const next = reducer(state, setFilters({type:'Income', page:2}))
  expect(next.filters.type).toBe('Income')
  expect(next.filters.page).toBe(2)
})
