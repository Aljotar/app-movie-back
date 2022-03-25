const mongoose = require('mongoose');
const UsuariosSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    register: {
        type: Date,
    },
    role: {
        type: String,
        default: 'user',
        trime: true,
    },
});

module.exports = mongoose.model('Usuario', UsuariosSchema);