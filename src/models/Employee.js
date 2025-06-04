import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  // ... autres champs existants ...

  centre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Centre',
    required: [true, 'Le centre est requis']
  },
  poste: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fonction',
    required: [true, 'La fonction est requise']
  },

  // ... autres champs existants ...
}, {
  timestamps: true
});

// ... reste du code existant ... 