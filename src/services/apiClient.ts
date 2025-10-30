import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response && error.response.status === 401 && originalRequest.url !== '/refresh' && originalRequest.url !== '/login' && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const { data } = await apiClient.post('/refresh')
        if (data?.accessToken) {
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`
          originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`
        }

        console.log('Token renovado! Tentando a requisição original novamente.')
        return apiClient(originalRequest)
      } catch (refreshError) {
        console.error('Refresh token inválido. Deslogando usuário.')
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
