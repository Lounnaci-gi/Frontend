const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Route de connexion
router.post('/login', async (req, res) => {
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