const mongoose = require('mongoose');

const fonctionSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom de la fonction est requis'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances de recherche
fonctionSchema.index({ status: 1 });

const Fonction = mongoose.model('Fonction', fonctionSchema);

module.exports = Fonction; 