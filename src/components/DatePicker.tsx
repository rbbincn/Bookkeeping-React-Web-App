import { useId } from 'react'

type Props = {
  label?: string
  value?: string
  onChange?: (v: string) => void
}
export default function DatePicker({ label = 'Date', value, onChange }: Props) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} style={{ display: 'block', fontSize: 12, color: '#475569' }}>{label}</label>
      <input id={id} type="date" value={value} onChange={e => onChange?.(e.target.value)} />
    </div>
  )
}