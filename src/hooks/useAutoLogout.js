import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';

const useAutoLogout = (timeoutMinutes = 10) => {
  const dispatch = useDispatch();
  const timeoutRef = useRef(null);
  const timeoutMs = timeoutMinutes ? timeoutMinutes * 60 * 1000 : 0; // Convertir en millisecondes

  const resetTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // Ne pas démarrer le timer si timeoutMinutes est null
    if (timeoutMinutes) {
      timeoutRef.current = setTimeout(() => {
        dispatch(logout());
        // Rediriger vers la page de login
        window.location.href = '/login';
      }, timeoutMs);
    }
  };

  useEffect(() => {
    // Événements à surveiller pour détecter l'activité
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      resetTimer();
    };

    // Ajouter les écouteurs d'événements
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Démarrer le timer initial
    resetTimer();

    // Nettoyer les écouteurs d'événements et le timer
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [dispatch, timeoutMs]);

  return null;
};

export default useAutoLogout; 