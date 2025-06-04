const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/database');

const User = mongoose.model('User', new mongoose.Schema({
  username: String,
  password: String,
  role: String,
  name: String,
  email: String,
  createdAt: Date,
  updatedAt: Date
}));

const initializeDatabase = async () => {
  try {
    await connectDB();

    // Vérifier si l'utilisateur admin existe déjà
    const adminExists = await User.findOne({ username: 'admin' });
    
    if (!adminExists) {
      // Créer l'utilisateur admin
      const hashedPassword = await bcrypt.hash('Admin@2024', 10);
      
      await User.create({
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        name: 'Administrateur',
        email: 'admin@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log('Utilisateur admin créé avec succès');
    } else {
      console.log('L\'utilisateur admin existe déjà');
    }

    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
    process.exit(1);
  }
};

initializeDatabase(); 