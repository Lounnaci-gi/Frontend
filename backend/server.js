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
const transportRoutes = require('./routes/transports');

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/centres', centreRoutes);
app.use('/api/fonctions', fonctionRoutes);
app.use('/api/transports', transportRoutes);

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Le serveur fonctionne correctement' });
});

// Fonction pour initialiser l'admin
async function initializeAdmin() {
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
      
      console.log('Admin créé avec succès');
    } else {
      console.log('Admin existe déjà');
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de l\'admin:', error);
  }
}

// Connexion à MongoDB et démarrage du serveur
async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI n\'est pas défini dans le fichier .env');
    }

    console.log('Tentative de connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connecté à MongoDB avec succès');

    // Initialiser l'admin après la connexion à MongoDB
    await initializeAdmin();

    // Démarrer le serveur
    app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
    });
  } catch (error) {
    console.error('Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  res.status(500).json({ message: 'Une erreur est survenue sur le serveur' });
});

// Démarrer le serveur
startServer(); 