import apiClient from './apiClient'

export interface User {
  id: number
  username: string
  
}

export const loginUser = async (username: string, password: string) => {

  const response = await apiClient.post<{ user: User }>('/login', { username, password })
  return response.data.user
}

export const verifyUserSession = async (): Promise<User> => {
  const response = await apiClient.get<{ user: User }>('/verify-token')
  return response.data.user
}

export const logoutUser = async () => {
  await apiClient.post('/logout')
}
