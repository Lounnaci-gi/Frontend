const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  matricule: { type: String, required: true, unique: true },
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  dateNaissance: { type: Date, required: true },
  lieuNaissance: { type: String, required: true },
  adresse: { type: String, required: true },
  telephone: { type: String, required: true },
  email: { type: String, required: true },
  dateEmbauche: { type: Date, required: true },
  poste: { type: String, required: true },
  centre: { type: String, required: true },
  sexe: { type: String, required: true, enum: ['M', 'F'] },
  status: { 
    type: String, 
    enum: ['active', 'retired', 'onLeave', 'exempt'],
    default: 'active' 
  },
  photo: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware pour mettre à jour updatedAt
employeeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Employee', employeeSchema); 