import mongoose from 'mongoose';

const fonctionSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, 'Le titre de la fonction est requis'],
    unique: true,
    trim: true,
    maxlength: [50, 'Le titre ne peut pas dépasser 50 caractères']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'La description ne peut pas dépasser 200 caractères']
  },
  niveau: {
    type: Number,
    min: [1, 'Le niveau minimum est 1'],
    max: [10, 'Le niveau maximum est 10'],
    required: [true, 'Le niveau est requis']
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
fonctionSchema.index({ titre: 1 });
fonctionSchema.index({ niveau: 1 });

const Fonction = mongoose.model('Fonction', fonctionSchema);

export default Fonction; 