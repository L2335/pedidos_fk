import apiClient from './apiClient'

export interface Client {
  id: number
  corporate_name: string
  cnpj: string
  trade_name: string
  state_registration: string
  state: string
  city: string
  neighborhood: string
  number: number
  street: string
  postal_code: string
  address_complement: string
  payment_term: string
}

export interface LookedUpClientData {
  cnpj: string
  corporate_name: string
  trade_name?: string
  postal_code: string
  state: string
  city: string
  neighborhood: string
  street: string
  number: string
  address_complement?: string
}

export interface NewClientData extends LookedUpClientData {
  payment_term: string
}

export interface Customer extends NewClientData {
  id: number
  salesperson: number
}


export const getClientByCnpj = async (cnpj: string): Promise<Client> => {
  try {
    const response = await apiClient.get<Client>(`/customer/${cnpj}`)

    return response.data
  } catch (error) {
    throw error
  }
}

export const lookupCnpj = async (cnpj: string): Promise<LookedUpClientData> => {
  try {
    const response = await apiClient.get<LookedUpClientData>(`/customer/lookup/${cnpj}`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const registerClient = async (clientData: NewClientData): Promise<Client> => {
  try {
    const response = await apiClient.post<Client>('/customer', clientData)
    return response.data
  } catch (error) {
    throw error
  }
}
