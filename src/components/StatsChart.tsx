import { Bar } from 'react-chartjs-2'
import { Chart, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
import { Tx } from '../features/transactions/transactionsSlice'

Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

type Props = { items: Tx[] }

export default function StatsChart({ items }: Props) {
  const byMonth: Record<string, { income: number; expense: number }> = {}
  items.forEach(({ date, type, amount }) => {
    const m = date.slice(0, 7)
    if (!byMonth[m]) byMonth[m] = { income: 0, expense: 0 }
    byMonth[m][type === 'Income' ? 'income' : 'expense'] += amount
  })
  const labels = Object.keys(byMonth).sort()
  const data = {
    labels,
    datasets: [
      {
        label: 'Income',
        data: labels.map(l => byMonth[l].income),
        backgroundColor: '#60a5fa',
      },
      {
        label: 'Expense',
        data: labels.map(l => byMonth[l].expense),
        backgroundColor: '#f9a8d4',
      },
    ],
  }
  return (
    <div style={{ height: 300 }}>
      <Bar data={data} options={{ responsive: true, maintainAspectRatio: false }} />
    </div>
  )
}