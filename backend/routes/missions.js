const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Mission = require('../models/Mission');
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
  try {
    const mission = await Mission.create(req.body);
    await mission.populate(['employee', 'destinations']);
    res.status(201).json(mission);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const missions = await Mission.find()
      .populate('employee', 'matricule nom prenom')
      .populate('destinations', 'name')
      .sort({ createdAt: -1 });
    res.json(missions);
  } catch (error) {
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
    const { employees, startDate, endDate, destinations, type, transportMode } = req.body;

    // Validation des données
    if (!Array.isArray(employees) || employees.length === 0) {
      return res.status(400).json({ message: 'La liste des employés est requise' });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Les dates de début et de fin sont requises' });
    }

    if (!Array.isArray(destinations) || destinations.length === 0) {
      return res.status(400).json({ message: 'Au moins une destination est requise' });
    }

    if (!transportMode) {
      return res.status(400).json({ message: 'Le mode de transport est requis' });
    }

    // Trouver la dernière mission pour générer le code
    const lastMission = await Mission.findOne().sort({ code: -1 });
    let nextCode = '00001';
    if (lastMission && lastMission.code) {
      const lastNumber = parseInt(lastMission.code.split('/')[0]);
      nextCode = String(lastNumber + 1).padStart(5, '0');
    }
    const year = new Date().getFullYear();
    const baseCode = `${nextCode}/${year}`;

    const missions = [];
    const errors = [];

    // Création des missions dans une transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      for (let i = 0; i < employees.length; i++) {
        try {
          const employee = employees[i];
          if (!employee._id) {
            throw new Error(`ID manquant pour l'employé: ${employee.nom} ${employee.prenom}`);
          }

          // Générer le code unique pour cette mission
          const missionCode = i === 0 ? baseCode : `${String(parseInt(nextCode) + i).padStart(5, '0')}/${year}`;

          // Convertir les destinations en ObjectId
          const destinationIds = destinations.map(dest => {
            if (typeof dest === 'string') {
              try {
                return new mongoose.Types.ObjectId(dest);
              } catch (error) {
                throw new Error(`ID de destination invalide: ${dest}`);
              }
            }
            return dest;
          });

          const mission = new Mission({
            code: missionCode,
            employee: employee._id,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            destinations: destinationIds,
            type: type || 'monthly',
            transportMode,
            status: 'active'
          });

          await mission.save({ session });
          await mission.populate(['employee', 'destinations']);
          missions.push(mission);
        } catch (error) {
          errors.push({
            employeeId: employees[i]._id,
            employeeName: `${employees[i].nom} ${employees[i].prenom}`,
            error: error.message
          });
        }
      }

      if (errors.length > 0) {
        await session.abortTransaction();
        return res.status(400).json({
          message: `${errors.length} erreur(s) lors de la création des missions`,
          errors
        });
      }

      await session.commitTransaction();
      res.status(201).json(missions);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    res.status(400).json({ 
      message: error.message,
      details: error.stack
    });
  }
});

module.exports = router; 