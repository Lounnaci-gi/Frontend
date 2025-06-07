const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Mission = require('../models/Mission');
const Location = require('../models/Location');

// Middleware d'authentification
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Veuillez vous authentifier' });
  }
};

// Routes CRUD pour les missions
router.post('/', auth, async (req, res) => {
  try {
    const { destinations, ...missionData } = req.body;
    console.log('Données reçues:', { destinations, ...missionData });

    // Vérifier si le code_mission existe déjà
    if (missionData.code_mission) {
      const existingMission = await Mission.findOne({ code_mission: missionData.code_mission });
      if (existingMission) {
        return res.status(400).json({ 
          message: `Le code de mission ${missionData.code_mission} existe déjà`,
          code: 'DUPLICATE_CODE'
        });
      }
    }

    // Créer les destinations si elles n'existent pas
    const createdDestinations = await Promise.all(
      destinations.map(async (dest) => {
        try {
          // Chercher si la destination existe déjà
          let location = await Location.findOne({ 
            name: dest.name,
            type: 'mission'
          });
          
          // Si elle n'existe pas, la créer
          if (!location) {
            const newLocation = new Location({
              name: dest.name,
              type: 'mission',
              address: dest.address || dest.name,
              city: dest.city || 'Alger',
              country: dest.country || 'Algeria'
            });
            location = await newLocation.save();
            console.log('Nouvelle destination créée:', location);
          } else {
            console.log('Destination existante trouvée:', location);
          }
          
          return location._id;
        } catch (error) {
          console.error('Erreur lors de la création/récupération de la destination:', error);
          throw error;
        }
      })
    );

    console.log('IDs des destinations créées/récupérées:', createdDestinations);

    try {
      // Créer la mission avec les IDs des destinations
      const newMission = new Mission({
        ...missionData,
        destinations: createdDestinations
      });

      const mission = await newMission.save();
      console.log('Mission créée:', mission);

      // Populer les références
      const populatedMission = await Mission.findById(mission._id)
        .populate('employee')
        .populate('destinations');
      
      console.log('Mission avec destinations populées:', {
        id: populatedMission._id,
        code_mission: populatedMission.code_mission,
        destinations: populatedMission.destinations.map(d => ({
          id: d._id,
          name: d.name,
          type: d.type
        }))
      });
      
      res.status(201).json(populatedMission);
    } catch (error) {
      // Si c'est une erreur de clé dupliquée
      if (error.code === 11000) {
        return res.status(400).json({ 
          message: 'Ce code de mission existe déjà. Veuillez réessayer.',
          code: 'DUPLICATE_CODE'
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Erreur lors de la création de la mission:', error);
    res.status(400).json({ 
      message: error.message,
      code: error.code || 'UNKNOWN_ERROR'
    });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const missions = await Mission.find()
      .populate('employee')
      .populate('destinations')
      .sort({ code_mission: -1 });
    
    // Logs détaillés pour déboguer les destinations
    console.log('Missions from database:', JSON.stringify(missions.map(m => ({
      id: m._id,
      code_mission: m.code_mission,
      destinations: m.destinations ? m.destinations.map(d => ({
        id: d._id,
        name: d.name,
        type: d.type
      })) : [],
      employee: m.employee?.nom
    })), null, 2));
    
    res.json(missions);
  } catch (error) {
    console.error('Erreur lors de la récupération des missions:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id)
      .populate('employee')
      .populate('destinations');
    if (!mission) {
      return res.status(404).json({ message: 'Mission non trouvée' });
    }
    res.json(mission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const mission = await Mission.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    ).populate(['employee', 'destinations']);
    
    if (!mission) {
      return res.status(404).json({ message: 'Mission non trouvée' });
    }
    res.json(mission);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const mission = await Mission.findByIdAndDelete(req.params.id);
    if (!mission) {
      return res.status(404).json({ message: 'Mission non trouvée' });
    }
    res.json({ message: 'Mission supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 