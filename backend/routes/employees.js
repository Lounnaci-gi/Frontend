const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');

// Configuration de Multer pour le stockage des photos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/employees'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'employee-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Le fichier doit être une image'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

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

// Routes CRUD pour les employés
router.post('/', auth, upload.single('photo'), async (req, res) => {
  try {
    // Validation des champs requis (sans telephone et email qui sont optionnels)
    const requiredFields = [
      'matricule', 'nom', 'prenom', 'dateNaissance', 'lieuNaissance',
      'adresse', 'dateEmbauche', 'poste', 'centre', 'sexe'
    ];

    // Vérifier chaque champ
    const missingFields = requiredFields.filter(field => {
      const value = req.body[field];
      return !value || (typeof value === 'string' && value.trim() === '');
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'Champs manquants',
        fields: missingFields
      });
    }

    // Validation du format de l'email (seulement si fourni)
    if (req.body.email && req.body.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(req.body.email)) {
        return res.status(400).json({
          message: 'Format d\'email invalide'
        });
      }
    }

    // Validation du matricule (doit être unique)
    const existingEmployee = await Employee.findOne({ matricule: req.body.matricule });
    if (existingEmployee) {
      return res.status(400).json({
        message: 'Ce matricule est déjà utilisé'
      });
    }

    // Validation du sexe
    if (!['M', 'F'].includes(req.body.sexe)) {
      return res.status(400).json({
        message: 'Le sexe doit être M ou F'
      });
    }

    // Validation du status
    if (req.body.status && !['active', 'retired', 'onLeave', 'exempt'].includes(req.body.status)) {
      return res.status(400).json({
        message: 'Statut invalide'
      });
    }

    const employeeData = {
      ...req.body,
      photo: req.file ? `/uploads/employees/${req.file.filename}` : null
    };
    
    const employee = await Employee.create(employeeData);
    res.status(201).json(employee);
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(400).json({ 
      message: error.message || 'Erreur lors de la création de l\'employé'
    });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const employees = await Employee.find()
      .sort({ centre: 1, createdAt: -1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', auth, upload.single('photo'), async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: 'Employé non trouvé' });
    }

    const updateData = { ...req.body };
    if (req.file) {
      if (employee.photo) {
        const oldPhotoPath = path.join(__dirname, '..', employee.photo);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
      updateData.photo = `/uploads/employees/${req.file.filename}`;
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );
    res.json(updatedEmployee);
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }

    if (employee.photo) {
      const photoPath = path.join(__dirname, '..', employee.photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: 'Employé supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 