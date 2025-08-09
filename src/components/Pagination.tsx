import React from 'react'

type Props = {
  current: number
  pageSize: number
  total: number
  onChange: (p: number) => void
}

export default function Pagination({ current, pageSize, total, onChange }: Props) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const arr = Array.from({length: pages}, (_,i) => i+1)
  return (
    <div className="pagination" role="navigation" aria-label="pagination">
      {arr.map(p => (
        <button key={p} className={`page-btn ${p===current? 'active':''}`} onClick={()=>onChange(p)} aria-current={p===current}>
          {p}
        </button>
      ))}
    </div>
  )
}
