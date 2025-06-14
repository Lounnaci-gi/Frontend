const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Mission = require('../models/Mission');
const Location = require('../models/Location');
const Transport = require('../models/Transport');
const mongoose = require('mongoose');
const Employee = require('../models/Employee');

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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { destinations, transportMode, ...missionData } = req.body;

    // Validation des données requises
    if (!missionData.employee) {
      await session.abortTransaction();
      return res.status(400).json({ 
        message: 'L\'employé est requis',
        code: 'EMPLOYEE_REQUIRED'
      });
    }

    if (!destinations || destinations.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ 
        message: 'Au moins une destination est requise',
        code: 'DESTINATIONS_REQUIRED'
      });
    }

    if (!transportMode) {
      await session.abortTransaction();
      return res.status(400).json({ 
        message: 'Le mode de transport est requis',
        code: 'TRANSPORT_REQUIRED'
      });
    }

    // Récupérer ou créer le transport
    let transport;
    if (mongoose.Types.ObjectId.isValid(transportMode)) {
      transport = await Transport.findById(transportMode);
    } else {
      transport = await Transport.findOne({ nom: transportMode });
      if (!transport) {
        transport = new Transport({ nom: transportMode });
        transport = await transport.save({ session });
      }
    }

    if (!transport) {
      await session.abortTransaction();
      return res.status(400).json({ 
        message: 'Mode de transport invalide',
        code: 'INVALID_TRANSPORT'
      });
    }

    // Validation pour les missions mensuelles
    if (missionData.type === 'monthly' && missionData.employee && missionData.startDate && missionData.endDate) {
      const startDate = new Date(missionData.startDate);
      const startOfMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      const endOfMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
      
      const existingMonthlyMission = await Mission.findOne({
        employee: missionData.employee,
        type: 'monthly',
        status: { $in: ['active', 'completed'] },
        $or: [
          { startDate: { $gte: startOfMonth, $lte: endOfMonth } },
          { endDate: { $gte: startOfMonth, $lte: endOfMonth } },
          { 
            startDate: { $lte: startOfMonth },
            endDate: { $gte: endOfMonth }
          }
        ]
      });
      
      if (existingMonthlyMission) {
        await session.abortTransaction();
        const monthName = startDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        return res.status(400).json({ 
          message: `L'employé a déjà une mission mensuelle pour ${monthName}`,
          code: 'MONTHLY_MISSION_EXISTS'
        });
      }
    }

    // Créer les destinations
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
            location = await newLocation.save({ session });
          }
          
          return location._id;
        } catch (error) {
          throw error;
        }
      })
    );

    // Filtrer les destinations nulles ou undefined
    const validDestinations = createdDestinations.filter(dest => dest);

    if (validDestinations.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ 
        message: 'Aucune destination valide n\'a été fournie',
        code: 'INVALID_DESTINATIONS'
      });
    }

    // Créer la mission avec les IDs des destinations et du transport
    const newMission = new Mission({
      ...missionData,
      destinations: validDestinations,
      transportMode: transport._id
    });

    const mission = await newMission.save({ session });

    // Valider la transaction
    await session.commitTransaction();

    // Populer les références pour la réponse
    const populatedMission = await Mission.findById(mission._id)
      .populate('employee')
      .populate('destinations')
      .populate('transportMode');
    
    res.status(201).json(populatedMission);
  } catch (error) {
    // En cas d'erreur, annuler la transaction
    await session.abortTransaction();
    res.status(400).json({ 
      message: error.message,
      code: error.code || 'UNKNOWN_ERROR'
    });
  } finally {
    session.endSession();
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const { employee, type, status } = req.query;

    // Construire la requête
    const query = {};
    if (employee) query.employee = employee;
    if (type) query.type = type;
    if (status) {
      if (Array.isArray(status)) {
        query.status = { $in: status };
      } else {
        query.status = status;
      }
    }

    const missions = await Mission.find(query)
      .populate('employee')
      .populate('destinations')
      .populate('transportMode')
      .sort({ code_mission: -1 });
    
    res.json(missions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id)
      .populate('employee')
      .populate('destinations')
      .populate('transportMode');
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
    ).populate('employee').populate('destinations').populate('transportMode');
    
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

// Route pour la création de missions groupées
router.post('/group', auth, async (req, res) => {
  try {
    console.log('🚀 Début de création de missions groupées');
    const { employees, startDate, endDate, destinations, transportMode, type = 'monthly' } = req.body;

    console.log('📋 Données reçues:', {
      employeesCount: employees?.length,
      startDate,
      endDate,
      destinationsCount: destinations?.length,
      transportMode,
      type
    });

    // Validation des données
    if (!employees || !Array.isArray(employees) || employees.length === 0) {
      console.log('❌ Validation échouée: employés invalides');
      return res.status(400).json({ 
        message: 'Liste des employés invalide',
        code: 'INVALID_EMPLOYEES'
      });
    }

    if (!startDate || !endDate) {
      console.log('❌ Validation échouée: dates manquantes');
      return res.status(400).json({ 
        message: 'Les dates de début et de fin sont requises',
        code: 'DATES_REQUIRED'
      });
    }

    if (!destinations || !Array.isArray(destinations) || destinations.length === 0) {
      console.log('❌ Validation échouée: destinations manquantes');
      return res.status(400).json({ 
        message: 'Au moins une destination est requise',
        code: 'DESTINATIONS_REQUIRED'
      });
    }

    if (!transportMode) {
      console.log('❌ Validation échouée: transport manquant');
      return res.status(400).json({ 
        message: 'Le mode de transport est requis',
        code: 'TRANSPORT_REQUIRED'
      });
    }

    console.log('✅ Validation des données réussie');

    // Récupérer les employés depuis la base de données
    console.log('👥 Récupération des employés...');
    const employeeObjects = await Employee.find({ _id: { $in: employees } });
    
    if (employeeObjects.length !== employees.length) {
      console.log('❌ Employés non trouvés:', {
        demandés: employees.length,
        trouvés: employeeObjects.length
      });
      return res.status(400).json({ 
        message: 'Certains employés n\'ont pas été trouvés',
        code: 'EMPLOYEES_NOT_FOUND'
      });
    }

    console.log('✅ Employés récupérés:', employeeObjects.length);

    // Validation pour les missions mensuelles : vérifier qu'aucun employé n'a déjà une mission pour le même mois
    if (type === 'monthly') {
      console.log('🔍 Vérification des missions existantes...');
      const startDateObj = new Date(startDate);
      const startOfMonth = new Date(startDateObj.getFullYear(), startDateObj.getMonth(), 1);
      const endOfMonth = new Date(startDateObj.getFullYear(), startDateObj.getMonth() + 1, 0);
      
      const existingMonthlyMissions = await Mission.find({
        employee: { $in: employees },
        type: 'monthly',
        status: { $in: ['active', 'completed'] },
        $or: [
          { startDate: { $gte: startOfMonth, $lte: endOfMonth } },
          { endDate: { $gte: startOfMonth, $lte: endOfMonth } },
          { 
            startDate: { $lte: startOfMonth },
            endDate: { $gte: endOfMonth }
          }
        ]
      }).populate('employee');
      
      if (existingMonthlyMissions.length > 0) {
        console.log('❌ Missions existantes trouvées:', existingMonthlyMissions.length);
        const monthName = startDateObj.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        const employeeNames = existingMonthlyMissions.map(m => `${m.employee.nom} ${m.employee.prenom}`).join(', ');
        return res.status(400).json({ 
          message: `Les employés suivants ont déjà une mission mensuelle pour ${monthName}: ${employeeNames}`,
          code: 'MONTHLY_MISSION_EXISTS',
          conflictingEmployees: existingMonthlyMissions.map(m => ({
            id: m.employee._id,
            name: `${m.employee.nom} ${m.employee.prenom}`
          }))
        });
      }
      console.log('✅ Aucune mission existante trouvée');
    }

    // Créer les destinations si elles n'existent pas
    console.log('📍 Création des destinations...');
    const createdDestinations = await Promise.all(
      destinations.map(async (dest, index) => {
        try {
          // Chercher si la destination existe déjà
          let location = await Location.findOne({ 
            name: dest.name,
            type: 'mission'
          });
          
          // Si elle n'existe pas, la créer
          if (!location) {
            console.log(`📝 Création de la destination: ${dest.name}`);
            const newLocation = new Location({
              name: dest.name,
              type: 'mission',
              address: dest.address || dest.name,
              city: dest.city || 'Alger',
              country: dest.country || 'Algeria'
            });
            location = await newLocation.save();
          } else {
            console.log(`✅ Destination existante: ${dest.name}`);
          }
          
          return location._id;
        } catch (error) {
          console.error(`❌ Erreur lors de la création de la destination ${dest.name}:`, error);
          throw error;
        }
      })
    );

    console.log('✅ Destinations créées/récupérées:', createdDestinations.length);

    // Créer les missions une par une
    console.log('🚀 Début de la création des missions...');
    const createdMissions = [];
    const failedMissions = [];

    try {
      for (let i = 0; i < employees.length; i++) {
        const employeeId = employees[i];
        
        console.log(`📋 Création de la mission ${i + 1}/${employees.length} pour l'employé ${employeeId}`);
        
        // Créer la mission (le code_mission sera généré automatiquement par le middleware)
        const newMission = new Mission({
          employee: employeeId,
          type: type,
          status: 'active',
          startDate: startDate,
          endDate: endDate,
          destinations: createdDestinations,
          transportMode: transportMode
        });

        const mission = await newMission.save();
        createdMissions.push(mission);
        console.log(`✅ Mission créée: ${mission.code_mission}`);
      }
      
      console.log('🎉 Toutes les missions ont été créées avec succès');
      
      // Populer les références pour la réponse
      console.log('📊 Population des références...');
      const populatedMissions = await Mission.find({ _id: { $in: createdMissions.map(m => m._id) } })
        .populate('employee')
        .populate('destinations')
        .populate('transportMode');

      console.log('✅ Réponse envoyée avec succès');
      res.status(201).json({
        message: `${createdMissions.length} missions créées avec succès`,
        missions: populatedMissions,
        failed: failedMissions
      });

    } catch (error) {
      console.error('❌ Erreur lors de la création des missions:', error);
      // En cas d'erreur, supprimer les missions créées
      if (createdMissions.length > 0) {
        console.log('🗑️ Suppression des missions créées en cas d\'erreur...');
        await Mission.deleteMany({ _id: { $in: createdMissions.map(m => m._id) } });
      }
      throw error;
    }

  } catch (error) {
    res.status(400).json({ 
      message: error.message,
      code: error.code || 'UNKNOWN_ERROR'
    });
  }
});

module.exports = router; 