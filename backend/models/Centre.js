const mongoose = require('mongoose');

const centreSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom du centre est requis'],
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
centreSchema.index({ status: 1 });

const Centre = mongoose.model('Centre', centreSchema);

module.exports = Centre; 