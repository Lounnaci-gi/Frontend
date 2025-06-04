const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Fonction = require('../models/Fonction');

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

// Obtenir toutes les fonctions
router.get('/', auth, async (req, res) => {
  try {
    const query = {};
    if (req.query.status) {
      query.status = req.query.status;
    }
    const fonctions = await Fonction.find(query).sort({ nom: 1 });
    res.json(fonctions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Créer une nouvelle fonction
router.post('/', auth, async (req, res) => {
  try {
    const { nom, description, status } = req.body;
    
    // Vérifier si la fonction existe déjà
    const existingFonction = await Fonction.findOne({ nom });
    if (existingFonction) {
      return res.status(409).json({ message: 'Cette fonction existe déjà' });
    }

    const fonction = await Fonction.create({
      nom,
      description,
      status: status || 'active'
    });
    
    res.status(201).json(fonction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Obtenir une fonction spécifique
router.get('/:id', auth, async (req, res) => {
  try {
    const fonction = await Fonction.findById(req.params.id);
    if (!fonction) {
      return res.status(404).json({ message: 'Fonction non trouvée' });
    }
    res.json(fonction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mettre à jour une fonction
router.put('/:id', auth, async (req, res) => {
  try {
    const { nom, description, status } = req.body;
    
    // Vérifier si le nouveau nom existe déjà (sauf pour cette fonction)
    if (nom) {
      const existingFonction = await Fonction.findOne({ 
        nom, 
        _id: { $ne: req.params.id } 
      });
      if (existingFonction) {
        return res.status(409).json({ message: 'Ce nom de fonction existe déjà' });
      }
    }

    const fonction = await Fonction.findByIdAndUpdate(
      req.params.id,
      { nom, description, status, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!fonction) {
      return res.status(404).json({ message: 'Fonction non trouvée' });
    }

    res.json(fonction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer une fonction
router.delete('/:id', auth, async (req, res) => {
  try {
    const fonction = await Fonction.findByIdAndDelete(req.params.id);
    if (!fonction) {
      return res.status(404).json({ message: 'Fonction non trouvée' });
    }
    res.json({ message: 'Fonction supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 