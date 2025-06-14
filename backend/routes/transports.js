const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Transport = require('../models/Transport');

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

// Route pour récupérer un transport par ID
router.get('/:id', auth, async (req, res) => {
  try {
    const transport = await Transport.findById(req.params.id);
    if (!transport) {
      return res.status(404).json({ message: 'Transport non trouvé' });
    }
    res.json(transport);
  } catch (error) {
    console.error('Erreur lors de la récupération du transport:', error);
    res.status(500).json({ message: error.message });
  }
});

// Route pour créer un transport
router.post('/', auth, async (req, res) => {
  try {
    const { nom } = req.body;
    console.log('Création de transport:', nom);

    // Vérifier si le transport existe déjà
    const existingTransport = await Transport.findOne({ 
      nom: { $regex: new RegExp(`^${nom}$`, 'i') } // Recherche insensible à la casse
    });

    if (existingTransport) {
      console.log('Transport existant trouvé:', existingTransport);
      return res.json(existingTransport);
    }

    // Créer le nouveau transport
    const transport = new Transport({ nom });
    await transport.save();
    console.log('Nouveau transport créé:', transport);
    
    res.status(201).json(transport);
  } catch (error) {
    console.error('Erreur lors de la création du transport:', error);
    res.status(400).json({ 
      message: error.message,
      code: error.code || 'UNKNOWN_ERROR'
    });
  }
});

// Route pour récupérer tous les transports
router.get('/', auth, async (req, res) => {
  try {
    const { nom } = req.query;
    const query = {};
    
    if (nom) {
      query.nom = { $regex: new RegExp(nom, 'i') }; // Recherche insensible à la casse
    }

    const transports = await Transport.find(query).sort({ nom: 1 });
    res.json(transports);
  } catch (error) {
    console.error('Erreur lors de la récupération des transports:', error);
    res.status(500).json({ message: error.message });
  }
});

// Route pour mettre à jour un moyen de transport
router.put('/:id', auth, async (req, res) => {
  try {
    const transport = await Transport.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!transport) {
      return res.status(404).json({ message: 'Moyen de transport non trouvé' });
    }
    res.json(transport);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Route pour supprimer un moyen de transport
router.delete('/:id', auth, async (req, res) => {
  try {
    const transport = await Transport.findByIdAndDelete(req.params.id);
    if (!transport) {
      return res.status(404).json({ message: 'Moyen de transport non trouvé' });
    }
    res.json({ message: 'Moyen de transport supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 