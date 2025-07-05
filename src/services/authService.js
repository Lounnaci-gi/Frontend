import axiosInstance from '../config/axios';

const authService = {
  login: async (email, password) => {
    try {
      // Vérifier d'abord si le serveur répond
      try {
        await axiosInstance.get('/health');
      } catch (error) {
        throw error;
      }
      
      const response = await axiosInstance.post('/auth/login', {
        email,
        password
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data;
      } else {
        throw new Error('Token non reçu du serveur');
      }
    } catch (error) {
      console.log('Erreur dans authService:', error);
      
      // Si l'erreur contient remainingSeconds, c'est une erreur 429
      if (error.remainingSeconds !== undefined) {
        console.log('Erreur 429 détectée avec remainingSeconds:', error.remainingSeconds);
        // Créer une erreur avec la structure attendue par le frontend
        const customError = new Error(error.message || 'Trop de tentatives. Réessayez plus tard.');
        customError.response = {
          status: 429,
          data: {
            message: error.message || 'Trop de tentatives. Réessayez plus tard.',
            remainingSeconds: error.remainingSeconds
          }
        };
        throw customError;
      }
      
      // Pour les autres erreurs, propager directement
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
  },

  checkBlockStatus: async () => {
    try {
      const response = await axiosInstance.get('/auth/check-block');
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 429) {
        return {
          blocked: true,
          remainingSeconds: error.response.data?.remainingSeconds || 15 * 60
        };
      }
      throw error;
    }
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