const mongoose = require('mongoose');

// Fonction pour générer un code unique
const generateUniqueCode = async () => {
  const date = new Date();
  const year = date.getFullYear();
  
  // Trouver le dernier code pour cette année
  const lastMission = await mongoose.model('Mission').findOne(
    { code: new RegExp(`^\\d{5}/${year}$`) },
    { code: 1 },
    { sort: { code: -1 } }
  );

  let sequence = 1;
  if (lastMission) {
    sequence = parseInt(lastMission.code.split('/')[0]) + 1;
  }

  return `${sequence.toString().padStart(5, '0')}/${year}`;
};

const missionSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['monthly', 'special'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  destinations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  }],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  description: {
    type: String
  },
  cancellationDetails: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware pour générer le code avant la sauvegarde
missionSchema.pre('save', async function(next) {
  if (this.isNew) {
    this.code = await generateUniqueCode();
  }
  this.updatedAt = Date.now();
  next();
});

const Mission = mongoose.model('Mission', missionSchema);

module.exports = Mission; 