const mongoose = require('mongoose');

// Fonction pour générer un code de mission unique
const generateMissionCode = async () => {
  const date = new Date();
  const year = date.getFullYear();
  
  // Trouver le dernier code pour cette année
  const lastMission = await mongoose.model('Mission').findOne(
    { code_mission: new RegExp(`^\\d{5}/${year}$`) },
    { code_mission: 1 },
    { sort: { code_mission: -1 } }
  );

  let sequence;
  if (lastMission) {
    // Extraire le numéro de séquence du dernier code
    const match = lastMission.code_mission.match(/^(\d{5})\/\d{4}$/);
    if (match) {
      sequence = parseInt(match[1], 10) + 1;
    } else {
      sequence = 1;
    }
  } else {
    sequence = 1;
  }

  // Formater le nouveau code
  const newCode = `${String(sequence).padStart(5, '0')}/${year}`;
  
  // Vérifier si le code existe déjà (au cas où)
  const existingMission = await mongoose.model('Mission').findOne({ code_mission: newCode });
  if (existingMission) {
    throw new Error(`Le code de mission ${newCode} existe déjà. Veuillez réessayer.`);
  }

  return newCode;
};

// Fonction pour générer l'ancien format de code
const generateLegacyCode = async () => {
  const prefix = 'M';
  const date = new Date();
  const year = date.getFullYear();
  
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
  code_mission: {
    type: String,
    required: true,
    unique: true
  },
  code: {
    type: String,
    required: false, // Rendu optionnel
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
  transportMode: {
    type: String,
    required: true
  },
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

// Middleware pour générer les codes avant la validation
missionSchema.pre('validate', async function(next) {
  try {
    // Si code_mission n'est pas fourni, le générer
    if (!this.code_mission) {
      this.code_mission = await generateMissionCode();
    } else {
      // Vérifier si le code_mission fourni existe déjà
      const existingMission = await mongoose.model('Mission').findOne({ 
        code_mission: this.code_mission,
        _id: { $ne: this._id } // Exclure la mission actuelle si c'est une mise à jour
      });
      
      if (existingMission) {
        throw new Error(`Le code de mission ${this.code_mission} existe déjà`);
      }
    }
    
    // Générer l'ancien format de code pour la compatibilité
    if (!this.code) {
      this.code = await generateLegacyCode();
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Validation personnalisée pour vérifier qu'un employé n'a qu'une seule mission mensuelle par mois
missionSchema.pre('save', async function(next) {
  try {
    // Vérifier seulement pour les missions mensuelles
    if (this.type === 'monthly' && this.employee && this.startDate && this.endDate) {
      // Calculer le début et la fin du mois
      const startOfMonth = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), 1);
      const endOfMonth = new Date(this.startDate.getFullYear(), this.startDate.getMonth() + 1, 0);
      
      // Rechercher les missions existantes pour cet employé dans le même mois
      const existingMission = await mongoose.model('Mission').findOne({
        employee: this.employee,
        type: 'monthly',
        status: { $in: ['active', 'completed'] }, // Vérifier seulement les missions actives ou complétées
        _id: { $ne: this._id }, // Exclure la mission actuelle si c'est une mise à jour
        $or: [
          // Mission qui commence dans le mois
          { startDate: { $gte: startOfMonth, $lte: endOfMonth } },
          // Mission qui se termine dans le mois
          { endDate: { $gte: startOfMonth, $lte: endOfMonth } },
          // Mission qui couvre tout le mois
          { 
            startDate: { $lte: startOfMonth },
            endDate: { $gte: endOfMonth }
          }
        ]
      });
      
      if (existingMission) {
        const monthName = this.startDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        throw new Error(`L'employé a déjà une mission mensuelle pour ${monthName}`);
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Middleware pour mettre à jour updatedAt
missionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Mission = mongoose.model('Mission', missionSchema);

module.exports = Mission; 