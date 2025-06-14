const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Mission = require('../models/Mission');
const Location = require('../models/Location');
const mongoose = require('mongoose');

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
    const { destinations, ...missionData } = req.body;
    console.log('Données reçues:', { destinations, ...missionData });

    // Vérifier si le code_mission existe déjà
    if (missionData.code_mission) {
      const existingMission = await Mission.findOne({ code_mission: missionData.code_mission });
      if (existingMission) {
        await session.abortTransaction();
        return res.status(400).json({ 
          message: `Le code de mission ${missionData.code_mission} existe déjà`,
          code: 'DUPLICATE_CODE'
        });
      }
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

    // Créer la mission d'abord
    const newMission = new Mission({
      ...missionData,
      destinations: [] // On commence avec un tableau vide
    });

    const mission = await newMission.save({ session });

    // Ensuite, créer les destinations et les lier à la mission
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

    // Mettre à jour la mission avec les IDs des destinations
    mission.destinations = createdDestinations;
    await mission.save({ session });

    // Valider la transaction
    await session.commitTransaction();

    // Populer les références pour la réponse
    const populatedMission = await Mission.findById(mission._id)
      .populate('employee')
      .populate('destinations');
    
    res.status(201).json(populatedMission);
  } catch (error) {
    // En cas d'erreur, annuler la transaction
    await session.abortTransaction();
    console.error('Erreur lors de la création de la mission:', error);
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

// Route pour la création de missions groupées
router.post('/group', auth, async (req, res) => {
  try {
    console.log('=== DÉBUT CRÉATION MISSIONS GROUPÉES ===');
    const { employees, startDate, endDate, destinations, type, transportMode } = req.body;

    console.log('Données reçues pour création groupée:', { 
      employeesCount: employees?.length, 
      startDate, 
      endDate, 
      destinationsCount: destinations?.length, 
      type, 
      transportMode 
    });

    // Validation des données
    if (!Array.isArray(employees) || employees.length === 0) {
      console.log('ERREUR: Liste des employés invalide');
      return res.status(400).json({ message: 'La liste des employés est requise' });
    }

    if (!startDate || !endDate) {
      console.log('ERREUR: Dates manquantes');
      return res.status(400).json({ message: 'Les dates de début et de fin sont requises' });
    }

    if (!Array.isArray(destinations) || destinations.length === 0) {
      console.log('ERREUR: Destinations manquantes');
      return res.status(400).json({ message: 'Au moins une destination est requise' });
    }

    if (!transportMode) {
      console.log('ERREUR: Mode de transport manquant');
      return res.status(400).json({ message: 'Le mode de transport est requis' });
    }

    console.log('Validation des données réussie');

    // Validation pour les missions mensuelles : vérifier qu'aucun employé n'a déjà une mission pour le même mois
    if (type === 'monthly') {
      console.log('Vérification des missions mensuelles existantes...');
      const startDateObj = new Date(startDate);
      const startOfMonth = new Date(startDateObj.getFullYear(), startDateObj.getMonth(), 1);
      const endOfMonth = new Date(startDateObj.getFullYear(), startDateObj.getMonth() + 1, 0);
      
      const employeeIds = employees.map(emp => emp._id);
      console.log('IDs des employés à vérifier:', employeeIds);
      
      const existingMonthlyMissions = await Mission.find({
        employee: { $in: employeeIds },
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
      
      console.log('Missions existantes trouvées:', existingMonthlyMissions.length);
      
      if (existingMonthlyMissions.length > 0) {
        const monthName = startDateObj.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        const employeeNames = existingMonthlyMissions.map(m => `${m.employee.nom} ${m.employee.prenom}`).join(', ');
        console.log('ERREUR: Missions existantes trouvées');
        return res.status(400).json({ 
          message: `Les employés suivants ont déjà une mission mensuelle pour ${monthName}: ${employeeNames}`,
          code: 'MONTHLY_MISSION_EXISTS',
          conflictingEmployees: existingMonthlyMissions.map(m => ({
            id: m.employee._id,
            name: `${m.employee.nom} ${m.employee.prenom}`
          }))
        });
      }
      console.log('Aucune mission mensuelle existante trouvée');
    }

    // Créer les destinations si elles n'existent pas
    console.log('Création/récupération des destinations...');
    const createdDestinations = await Promise.all(
      destinations.map(async (dest, index) => {
        try {
          console.log(`Traitement destination ${index + 1}:`, dest);
          // Chercher si la destination existe déjà
          let location = await Location.findOne({ 
            name: dest.name,
            type: 'mission'
          });
          
          // Si elle n'existe pas, la créer
          if (!location) {
            console.log(`Création nouvelle destination: ${dest.name}`);
            const newLocation = new Location({
              name: dest.name,
              type: 'mission',
              address: dest.address || dest.name,
              city: dest.city || 'Alger',
              country: dest.country || 'Algeria'
            });
            location = await newLocation.save();
            console.log('Nouvelle destination créée:', location._id);
          } else {
            console.log(`Destination existante trouvée: ${location._id}`);
          }
          
          return location._id;
        } catch (error) {
          console.error(`Erreur lors de la création/récupération de la destination ${index + 1}:`, error);
          throw error;
        }
      })
    );

    console.log('IDs des destinations créées/récupérées:', createdDestinations);

    // Trouver la dernière mission pour générer le code
    console.log('Génération des codes de mission...');
    const lastMission = await Mission.findOne().sort({ code: -1 });
    let nextCode = '00001';
    if (lastMission && lastMission.code) {
      const lastNumber = parseInt(lastMission.code.split('/')[0]);
      nextCode = String(lastNumber + 1).padStart(5, '0');
    }
    const year = new Date().getFullYear();
    const baseCode = `${nextCode}/${year}`;
    console.log('Code de base généré:', baseCode);

    const missions = [];
    const errors = [];

    // Création des missions dans une transaction
    console.log('Début de la transaction pour créer les missions...');
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      for (let i = 0; i < employees.length; i++) {
        try {
          console.log(`Création mission ${i + 1}/${employees.length} pour employé:`, employees[i].nom, employees[i].prenom);
          const employee = employees[i];
          if (!employee._id) {
            throw new Error(`ID manquant pour l'employé: ${employee.nom} ${employee.prenom}`);
          }

          // Générer le code unique pour cette mission
          const missionCode = i === 0 ? baseCode : `${String(parseInt(nextCode) + i).padStart(5, '0')}/${year}`;
          console.log('Code de mission généré:', missionCode);

          const mission = new Mission({
            code: missionCode,
            employee: employee._id,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            destinations: createdDestinations,
            type: type || 'monthly',
            transportMode,
            status: 'active'
          });

          console.log('Mission à sauvegarder:', {
            code: mission.code,
            employee: mission.employee,
            startDate: mission.startDate,
            endDate: mission.endDate,
            destinations: mission.destinations,
            type: mission.type,
            transportMode: mission.transportMode
          });

          await mission.save({ session });
          await mission.populate(['employee', 'destinations']);
          missions.push(mission);
          console.log(`Mission ${i + 1} créée avec succès:`, mission._id);
        } catch (error) {
          console.error(`Erreur lors de la création de la mission ${i + 1}:`, error);
          errors.push({
            employeeId: employees[i]._id,
            employeeName: `${employees[i].nom} ${employees[i].prenom}`,
            error: error.message
          });
        }
      }

      if (errors.length > 0) {
        console.log('Erreurs détectées, annulation de la transaction');
        await session.abortTransaction();
        return res.status(400).json({
          message: `${errors.length} erreur(s) lors de la création des missions`,
          errors
        });
      }

      console.log('Toutes les missions créées avec succès, validation de la transaction...');
      await session.commitTransaction();
      console.log('Transaction validée, envoi de la réponse');
      res.status(201).json(missions);
    } catch (error) {
      console.error('Erreur dans la transaction:', error);
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
      console.log('Session fermée');
    }
  } catch (error) {
    console.error('Erreur lors de la création des missions groupées:', error);
    res.status(400).json({ 
      message: error.message,
      details: error.stack
    });
  }
});

module.exports = router; 