const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Centre = require('../models/Centre');

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

// Obtenir tous les centres
router.get('/', auth, async (req, res) => {
  try {
    const query = {};
    if (req.query.status) {
      query.status = req.query.status;
    }
    const centres = await Centre.find(query).sort({ nom: 1 });
    res.json(centres);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Créer un nouveau centre
router.post('/', auth, async (req, res) => {
  try {
    const { nom, description, status } = req.body;
    
    // Vérifier si le centre existe déjà
    const existingCentre = await Centre.findOne({ nom });
    if (existingCentre) {
      return res.status(409).json({ message: 'Ce centre existe déjà' });
    }

    const centre = await Centre.create({
      nom,
      description,
      status: status || 'active'
    });
    
    res.status(201).json(centre);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Obtenir un centre spécifique
router.get('/:id', auth, async (req, res) => {
  try {
    const centre = await Centre.findById(req.params.id);
    if (!centre) {
      return res.status(404).json({ message: 'Centre non trouvé' });
    }
    res.json(centre);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mettre à jour un centre
router.put('/:id', auth, async (req, res) => {
  try {
    const { nom, description, status } = req.body;
    
    // Vérifier si le nouveau nom existe déjà (sauf pour ce centre)
    if (nom) {
      const existingCentre = await Centre.findOne({ 
        nom, 
        _id: { $ne: req.params.id } 
      });
      if (existingCentre) {
        return res.status(409).json({ message: 'Ce nom de centre existe déjà' });
      }
    }

    const centre = await Centre.findByIdAndUpdate(
      req.params.id,
      { nom, description, status, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!centre) {
      return res.status(404).json({ message: 'Centre non trouvé' });
    }

    res.json(centre);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer un centre
router.delete('/:id', auth, async (req, res) => {
  try {
    const centre = await Centre.findByIdAndDelete(req.params.id);
    if (!centre) {
      return res.status(404).json({ message: 'Centre non trouvé' });
    }
    res.json({ message: 'Centre supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 