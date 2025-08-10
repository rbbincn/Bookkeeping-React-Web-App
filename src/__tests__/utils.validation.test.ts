import { isNumeric } from '../utils/validation'

describe('isNumeric', () => {
  it('accepts integers and decimals (positive/negative)', () => {
    expect(isNumeric('0')).toBe(true)
    expect(isNumeric('12')).toBe(true)
    expect(isNumeric('-5')).toBe(true)
    expect(isNumeric('3.14')).toBe(true)
    expect(isNumeric('-0.99')).toBe(true)
  })
  it('rejects non-numeric inputs', () => {
    expect(isNumeric('')).toBe(false)
    expect(isNumeric('abc')).toBe(false)
    expect(isNumeric('12a')).toBe(false)
    expect(isNumeric('1.2.3')).toBe(false)
  })
})
