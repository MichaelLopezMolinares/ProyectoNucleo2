/**
 * Cliente HTTP base para comunicarse con el backend
 */
const API_URL = 'http://localhost:3000/api';

class ApiClient {
  static getToken() {
    return localStorage.getItem('af_token');
  }

  static setToken(token) {
    localStorage.setItem('af_token', token);
  }

  static removeToken() {
    localStorage.removeItem('af_token');
  }

  static async request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const token = this.getToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    const response = await fetch(url, config);

    if (response.status === 204) return null;

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data?.error?.message || 'Error del servidor');
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  static get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  static post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body });
  }

  static put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body });
  }

  static delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export default ApiClient;
