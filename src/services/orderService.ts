import apiClient from './apiClient'

export const sendOrderService = async (payload: any) => {
  try {
    const response = await apiClient.post('/orders', payload)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getOrderService = async (queryParams: any) => {
  try {
    const response = await apiClient.get('/orders', { params: queryParams })
    return response.data
  } catch (error) {
    throw error
  }
}
