const mongoose = require('mongoose');

const transportSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate: {
            validator: function(v) {
                // Vérifier que le nom n'est pas un ID MongoDB
                return !v.match(/^[0-9a-fA-F]{24}$/);
            },
            message: 'Le nom du transport ne peut pas être un ID MongoDB'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Middleware pour mettre à jour updatedAt
transportSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Index pour éviter les doublons (insensible à la casse)
transportSchema.index({ nom: 1 }, { 
    unique: true,
    collation: { locale: 'fr', strength: 2 }
});

const Transport = mongoose.model('Transport', transportSchema);

module.exports = Transport; 