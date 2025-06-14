const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
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

// Route pour obtenir toutes les destinations de type 'mission'
router.get('/missions', auth, async (req, res) => {
  try {
    const locations = await Location.find({ type: 'mission' })
      .sort({ name: 1 });
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Routes CRUD pour les locations
router.post('/', auth, async (req, res) => {
  try {
    const location = await Location.create(req.body);
    res.status(201).json(location);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const locations = await Location.find().sort({ createdAt: -1 });
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ message: 'Location non trouvée' });
    }
    res.json(location);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const location = await Location.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!location) {
      return res.status(404).json({ message: 'Location non trouvée' });
    }
    res.json(location);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);
    if (!location) {
      return res.status(404).json({ message: 'Location non trouvée' });
    }
    res.json({ message: 'Location supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 