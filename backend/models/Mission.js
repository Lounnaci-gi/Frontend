const mongoose = require('mongoose');

// Fonction pour générer un code unique
const generateUniqueCode = async () => {
  const prefix = 'M';
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  
  // Trouver le dernier code pour ce mois
  const lastMission = await mongoose.model('Mission').findOne(
    { code: new RegExp(`^${prefix}${year}${month}`) },
    { code: 1 },
    { sort: { code: -1 } }
  );

  let sequence = '001';
  if (lastMission) {
    const lastSequence = parseInt(lastMission.code.slice(-3));
    sequence = (lastSequence + 1).toString().padStart(3, '0');
  }

  return `${prefix}${year}${month}${sequence}`;
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