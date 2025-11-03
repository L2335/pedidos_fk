import apiClient from './apiClient'

export interface Customer {
  Client: {
    corporate_name: string
    trade_name: string
    street: string
    state: string
    city: string
    cnpj: string
    state_registration: string
    postal_code: string
    neighborhood: string
    number: string
    payment_term: string
  }
}

export interface Product {
  id: string
  name: string
  price: number
  internal_code: string
  category: string
  pack_quantity: number
  product_category: string
  dimensions: string
  appearance: string
  capacity: string
  currentPrice: number
}

export interface CatalogData {
  verifyCustomer(verifyCustomer: any): unknown
  customer: Customer
  products: Product[]
}

export const getProducts = async (): Promise<Product[]> => {
  const endpoint = `/products`

  try {
    const response = await apiClient.get<Product[]>(endpoint)
    return response.data
  } catch (error) {
    console.error('Erro ao buscar os produtos:', error)
    throw error
  }
}
