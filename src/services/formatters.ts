export const formatCNPJ = (value: string): string => {
  const numbers = value.replace(/\D/g, '')

  if (numbers.length > 14) {
    return numbers.slice(0, 14)
  }

  if (numbers.length <= 2) return numbers
  if (numbers.length <= 5) return numbers.replace(/(\d{2})/, '$1.')
  if (numbers.length <= 8) return numbers.replace(/(\d{2})(\d{3})/, '$1.$2.')
  if (numbers.length <= 12) return numbers.replace(/(\d{2})(\d{3})(\d{3})/, '$1.$2.$3/')

  return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

export const formatCEP = (value: string): string => {
  const numbers = value.replace(/\D/g, '')

  if (numbers.length > 8) {
    return numbers.slice(0, 8)
  }

  return numbers.replace(/(\d{5})(\d{3})/, '$1-$2')
}

export const formatIE = (value: string): string => {
  const numbers = String(value).replace(/\D/g, '')

  const ie = numbers.slice(0, 8)

  return ie.replace(/(\d{2})(\d{3})(\d{2})(\d{1})/, '$1.$2.$3-$4')
}

export function formatCurrency(value: string | number) {
  const numberValue = Number(value)

  if (value == null || isNaN(numberValue)) return 'R$ 0,00'

  return numberValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}
