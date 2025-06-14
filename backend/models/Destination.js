const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
});

const Destination = mongoose.model('Destination', destinationSchema);

module.exports = Destination; 