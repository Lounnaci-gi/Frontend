import mongoose from 'mongoose';

const centreSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom du centre est requis'],
    unique: true,
    trim: true,
    maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'La description ne peut pas dépasser 200 caractères']
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index pour la recherche rapide
centreSchema.index({ nom: 1 });

const Centre = mongoose.model('Centre', centreSchema);

export default Centre; 