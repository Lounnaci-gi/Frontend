const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Route de login
router.post('/login', async (req, res) => {
  try {
    console.log('Tentative de connexion avec:', req.body);
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('Email ou mot de passe manquant');
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    const user = await User.findOne({ email });
    console.log('Utilisateur trouvé:', user ? 'Oui' : 'Non');
    
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Mot de passe correct:', isMatch ? 'Oui' : 'Non');

    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    console.log('Connexion réussie pour:', email);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour créer l'admin (à supprimer en production)
router.post('/init-admin', async (req, res) => {
  try {
    console.log('Tentative de création de l\'admin');
    const adminExists = await User.findOne({ email: 'admin@admin.com' });
    
    if (!adminExists) {
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
      
      console.log('Admin créé avec succès:', admin.email);
      res.json({ message: 'Admin créé avec succès' });
    } else {
      console.log('Admin existe déjà');
      res.json({ message: 'Admin existe déjà' });
    }
  } catch (error) {
    console.error('Erreur lors de la création de l\'admin:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router; 