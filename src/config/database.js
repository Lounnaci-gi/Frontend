const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://lounnaci:hyhwarez@cluster0.l0q2v.mongodb.net/mission_db?retryWrites=true&w=majority&appName=Cluster0';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Atlas connecté avec succès');
  } catch (error) {
    console.error('Erreur de connexion à MongoDB Atlas:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB; 