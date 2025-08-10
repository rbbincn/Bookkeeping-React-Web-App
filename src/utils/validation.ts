export function isNumeric(input: string): boolean {
  return /^-?\d+(\.\d+)?$/.test(input)
}
