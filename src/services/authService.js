import axiosInstance from '../config/axios';

const authService = {
  login: async (email, password) => {
    try {
      console.log('Tentative de connexion avec:', { email });
      
      // Vérifier d'abord si le serveur répond
      try {
        const healthCheck = await axiosInstance.get('/health');
        console.log('Serveur en ligne:', healthCheck.data);
      } catch (error) {
        console.error('Erreur lors de la vérification de santé du serveur:', error);
        throw error;
      }
      
      const response = await axiosInstance.post('/auth/login', {
        email,
        password
      });

      console.log('Réponse du serveur:', response.data);

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data;
      } else {
        throw new Error('Token non reçu du serveur');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  isAuthenticated: () => {
    const user = authService.getCurrentUser();
    return !!user && !!user.token;
  }
};

// Configuration d'axios pour inclure le token dans toutes les requêtes
axiosInstance.interceptors.request.use(
  (config) => {
    const user = authService.getCurrentUser();
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs 401 (non autorisé)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      authService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default authService; 