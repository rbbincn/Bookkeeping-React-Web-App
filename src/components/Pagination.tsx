type Props = {
  page: number
  pageSize: number
  total: number
  onChange: (page: number) => void
}
export default function Pagination({ page, pageSize, total, onChange }: Props) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const go = (p: number) => onChange(Math.min(Math.max(1, p), pages))
  const items = []
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) {
      items.push(i)
    } else if (items[items.length - 1] !== -1) {
      items.push(-1)
    }
  }
  return (
    <div className="row" aria-label="pagination">
      <button className="btn ghost" onClick={() => go(page - 1)} disabled={page <= 1}>Prev</button>
      {items.map((i, idx) => i === -1 ? <span key={idx}>…</span> :
        <button key={idx} className={'btn ' + (i === page ? '' : 'ghost')} onClick={() => go(i)}>{i}</button>
      )}
      <button className="btn ghost" onClick={() => go(page + 1)} disabled={page >= pages}>Next</button>
      <span className="pill">Total: {total}</span>
    </div>
  )
}
