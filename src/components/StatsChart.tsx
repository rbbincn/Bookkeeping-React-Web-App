import { Bar } from 'react-chartjs-2'
import { Chart, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
import { Tx } from '../features/transactions/transactionsSlice'

Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

type Props = { items: Tx[] }

export default function StatsChart({ items }: Props) {
  const byMonth = new Map<string, { income: number, expense: number }>()
  for (const t of items) {
    const m = t.date.slice(0, 7)
    const row = byMonth.get(m) || { income: 0, expense: 0 }
    if (t.type === 'Income') row.income += t.amount
    else row.expense += t.amount
    byMonth.set(m, row)
  }
  const labels = Array.from(byMonth.keys()).sort()
  const data = {
    labels,
    datasets: [
      { label: 'Income', data: labels.map(l => byMonth.get(l)?.income ?? 0) },
      { label: 'Expense', data: labels.map(l => byMonth.get(l)?.expense ?? 0) },
    ]
  }
  const options = { responsive: true, maintainAspectRatio: false }
  return (
    <div style={{ height: 300 }}>
      <Bar data={data} options={options} />
    </div>
  )
}
