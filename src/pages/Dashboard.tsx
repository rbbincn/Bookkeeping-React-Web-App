import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store'
import { fetchList, setFilters } from '../features/transactions/transactionsSlice'
import StatsChart from '../components/StatsChart'

export default function Dashboard() {
  const dispatch = useDispatch<any>()
  const { items, filters } = useSelector((s:RootState)=>s.transactions)

  useEffect(()=>{ dispatch(fetchList()) }, [dispatch])

  const totalIncome = items.filter(i=>i.type==='Income').reduce((a,b)=>a+b.amount,0)
  const totalExpense = items.filter(i=>i.type==='Expense').reduce((a,b)=>a+b.amount,0)

  return (
    <div className="grid" style={{gridTemplateColumns:'1fr', gap:'1rem'}}>
      <div className="card row" style={{justifyContent:'space-between'}}>
        <div><strong>Total Income:</strong> ${totalIncome.toFixed(2)}</div>
        <div><strong>Total Expenses:</strong> ${totalExpense.toFixed(2)}</div>
        <div><strong>Net:</strong> ${(totalIncome-totalExpense).toFixed(2)}</div>
      </div>
      <div className="card">
        <h3>Monthly Overview</h3>
        <StatsChart items={items} />
      </div>
    </div>
  )
}
