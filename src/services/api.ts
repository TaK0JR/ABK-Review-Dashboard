/**
 * Service API pour gérer les requêtes HTTP
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/backend/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('abk_token');
  }

  /**
   * Définir le token d'authentification
   */
  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('abk_token', token);
    } else {
      localStorage.removeItem('abk_token');
    }
  }

  /**
   * Headers par défaut pour les requêtes
   */
  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Gérer les erreurs de réponse
   */
  private async handleResponse(response: Response) {
    if (!response.ok) {
      if (response.status === 401) {
        // Token expiré ou invalide
        this.setToken(null);
        window.location.href = '/login';
      }
      const error = await response.json();
      throw new Error(error.message || 'Erreur serveur');
    }
    return response.json();
  }

  /**
   * Requête GET
   */
  async get(endpoint: string, includeAuth: boolean = true) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(includeAuth),
    });
    return this.handleResponse(response);
  }

  /**
   * Requête POST
   */
  async post(endpoint: string, data: any, includeAuth: boolean = true) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(includeAuth),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  /**
   * Requête PUT
   */
  async put(endpoint: string, data: any, includeAuth: boolean = true) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(includeAuth),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  /**
   * Requête DELETE
   */
  async delete(endpoint: string, includeAuth: boolean = true) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(includeAuth),
    });
    return this.handleResponse(response);
  }
}

export default new ApiService();