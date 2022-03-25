require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const usuariosRoutes = require('./routes/usuariosRoutes');
const authRoutes = require('./routes/authRoutes');
// crear el servidor
const app = express();

// Permitir acceso, cors
app.use(cors());
app.use(morgan('dev'));

//Conectar a mongodb
mongoose.connect(process.env.MONGO_URL);

// Habilitar express.json (tambien se puede usar body parser)
app.use(express.json({ extended: true }));
// Habilitar urlencoded, para consultas desde postman en este formato
app.use(express.urlencoded({ extended: true }));

//importar rutas
app.use('usuarios', usuariosRoutes);
app.use('/auth', authRoutes);

// puerto y arranque del servidor
app.listen(process.env.PORT, () => {
    console.log('Servidor Funcionando');
});