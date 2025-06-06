const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Mission = require('../models/Mission');

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
      .populate('employee')
      .populate('destinations')
      .sort({ createdAt: -1 });
    console.log('Missions from database:', missions);
    console.log('Sample mission employee:', missions[0]?.employee);
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

module.exports = router; 