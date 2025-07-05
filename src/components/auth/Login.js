import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, Timer } from '@mui/icons-material';
import authService from '../../services/authService';
import { loginSuccess } from '../../store/slices/authSlice';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('handleSubmit appelé');
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(email, password);
      if (response.token) {
        dispatch(loginSuccess(response));
        navigate('/dashboard');
      }
    } catch (err) {
      // Vérifier si c'est une erreur de blocage (429)
      if (err.response && err.response.status === 429) {
        console.log('Erreur 429 détectée, activation du blocage');
        setIsBlocked(true);
        // Utiliser le temps restant du backend ou 15 minutes par défaut
        const remainingSeconds = err.response.data?.remainingSeconds || 15 * 60;
        console.log('Temps restant du backend:', remainingSeconds);
        startCountdown(remainingSeconds);
        setError('Trop de tentatives. Réessayez plus tard.');
      } else {
        setError(err.message || 'Une erreur est survenue lors de la connexion');
      }
    } finally {
      setLoading(false);
    }
  };

  const startCountdown = (seconds) => {
    console.log('Démarrage du compte à rebours avec:', seconds, 'secondes');
    setCountdown(seconds);
    
    // Nettoyer l'intervalle existant s'il y en a un
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        console.log('Compte à rebours:', prev);
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          setIsBlocked(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    // Vérifier si l'utilisateur est bloqué au chargement de la page
    const checkIfBlocked = async () => {
      try {
        const blockStatus = await authService.checkBlockStatus();
        if (blockStatus.blocked) {
          console.log('Utilisateur encore bloqué au chargement de la page');
          setIsBlocked(true);
          startCountdown(blockStatus.remainingSeconds);
        }
      } catch (err) {
        console.log('Erreur lors de la vérification du statut de blocage:', err);
      }
    };

    checkIfBlocked();

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        direction: 'rtl' // Direction RTL pour l'arabe
      }}
    >
      {isBlocked ? (
        // Affichage du compte à rebours seulement
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 400,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3
          }}
        >
          <Timer sx={{ fontSize: 60, color: 'warning.main' }} />
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            تم حظر الوصول مؤقتاً
          </Typography>
          <Typography variant="h2" component="div" align="center" sx={{ 
            fontFamily: 'monospace',
            fontWeight: 'bold',
            color: 'warning.main'
          }}>
            {formatTime(countdown)}
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary">
            يرجى الانتظار حتى انتهاء الوقت المحدد
          </Typography>
        </Paper>
      ) : (
        // Affichage normal du formulaire de connexion
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 400,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          <Typography variant="h5" component="h1" align="center" gutterBottom>
            تسجيل الدخول
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="البريد الإلكتروني"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              margin="normal"
              disabled={loading}
              placeholder="admin@admin.com"
              dir="rtl"
            />
            <TextField
              fullWidth
              label="كلمة المرور"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              margin="normal"
              disabled={loading}
              placeholder="admin123"
              dir="rtl"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'دخول'}
            </Button>
          </form>

          <Typography variant="body2" align="center" sx={{ mt: 2, color: 'text.secondary' }}>
            بيانات الدخول الافتراضية:
            <br />
            البريد الإلكتروني: admin@admin.com
            <br />
            كلمة المرور: admin123
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default Login; 