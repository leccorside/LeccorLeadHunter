import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
});

api.interceptors.response.use(
  (response) => {
    // Se a resposta vier encapsulada pelo TransformInterceptor, retorna o objeto
    return response.data;
  },
  (error) => {
    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'Erro inesperado na comunicação com o servidor';
    return Promise.reject(new Error(message));
  },
);

export default api;
