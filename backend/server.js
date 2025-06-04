const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const User = require('./models/User');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5001', 'http://localhost:5002', 'http://127.0.0.1:3000', 'http://127.0.0.1:5001', 'http://127.0.0.1:5002'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Créer le dossier uploads s'il n'existe pas
const uploadsDir = path.join(__dirname, 'uploads');
const employeesUploadsDir = path.join(uploadsDir, 'employees');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
if (!fs.existsSync(employeesUploadsDir)) {
  fs.mkdirSync(employeesUploadsDir);
}

// Servir les fichiers statiques du dossier uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const locationRoutes = require('./routes/locations');
const missionRoutes = require('./routes/missions');
const centreRoutes = require('./routes/centres');
const fonctionRoutes = require('./routes/fonctions');

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/centres', centreRoutes);
app.use('/api/fonctions', fonctionRoutes);

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Le serveur fonctionne correctement' });
});

// Fonction pour initialiser l'admin
async function initializeAdmin() {
  try {
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
    } else {
      console.log('Admin existe déjà');
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de l\'admin:', error);
  }
}

// Connexion à MongoDB et initialisation de l'admin
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connecté à MongoDB');
    await initializeAdmin();
  })
  .catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Route pour créer l'admin (à supprimer en production)
app.post('/api/init-admin', async (req, res) => {
  try {
    const adminExists = await User.findOne({ username: 'admin' });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@2024', 10);
      
      await User.create({
        username: process.env.ADMIN_USERNAME || 'admin',
        password: hashedPassword,
        role: 'admin',
        name: process.env.ADMIN_NAME || 'Administrateur',
        email: process.env.ADMIN_EMAIL || 'admin@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      res.json({ message: 'Admin créé avec succès' });
    } else {
      res.json({ message: 'Admin existe déjà' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  res.status(500).json({ message: 'Une erreur est survenue sur le serveur' });
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
}); 