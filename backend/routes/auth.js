const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware de limitation de tentatives de connexion par IP
const loginAttempts = new Map(); // { ip: { count, lastAttempt, blockedUntil } }

function loginLimiter(req, res, next) {
  const ip = req.ip;
  const now = Date.now();
  const attempt = loginAttempts.get(ip) || { count: 0, lastAttempt: 0, blockedUntil: 0 };

  // Vérifier si l'IP est bloquée
  if (attempt.blockedUntil && now < attempt.blockedUntil) {
    const remainingSeconds = Math.ceil((attempt.blockedUntil - now) / 1000);
    return res.status(429).json({ 
      message: 'Trop de tentatives. Réessayez plus tard.',
      remainingSeconds: remainingSeconds
    });
  }

  // Passer au handler, mais intercepter la réponse en cas d'échec
  res.on('finish', () => {
    // Si la réponse est 401 (échec de login)
    if (res.statusCode === 401) {
      attempt.count += 1;
      attempt.lastAttempt = now;
      // Si 3 tentatives, bloquer 15 minutes
      if (attempt.count >= 3) {
        attempt.blockedUntil = now + 15 * 60 * 1000;
        attempt.count = 0; // reset pour la prochaine fois
      }
      loginAttempts.set(ip, attempt);
    } else if (res.statusCode === 200) {
      // Si succès, reset
      loginAttempts.delete(ip);
    }
  });
  next();
}

// Route de connexion avec middleware
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route pour vérifier le statut de blocage
router.get('/check-block', (req, res) => {
  const ip = req.ip;
  const now = Date.now();
  const attempt = loginAttempts.get(ip) || { count: 0, lastAttempt: 0, blockedUntil: 0 };

  if (attempt.blockedUntil && now < attempt.blockedUntil) {
    const remainingSeconds = Math.ceil((attempt.blockedUntil - now) / 1000);
    return res.status(429).json({ 
      message: 'Trop de tentatives. Réessayez plus tard.',
      remainingSeconds: remainingSeconds
    });
  }

  res.json({ blocked: false });
});

// Route pour créer l'admin (à supprimer en production)
router.post('/create-admin', async (req, res) => {
  try {
    const adminExists = await User.findOne({ email: 'admin@admin.com' });
    
    if (adminExists) {
      return res.status(400).json({ message: 'L\'admin existe déjà' });
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await User.create({
      email: 'admin@admin.com',
      password: hashedPassword,
      role: 'admin',
      name: 'Administrateur',
      username: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.status(201).json({ message: 'Admin créé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 