const Usuario = require('../models/Usuario');
const bcryptjs = require('bcryptjs');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

exports.registrar = async (req, res) => {

    // revisamos los errores
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ msg: errores.array() });
    }

    const { email, password } = req.body;

    try {
        // Revisando q el email sea unico
        let usuarioEncontrado = await Usuario.findOne({ email });

        if (usuarioEncontrado) {
            return res.status(400).send('Email ya esta en uso');
        }

        let usuario;

        //nuevo usuario
        const bodyUsuario = { ...req.body, role: 'user', register: new Date() };
        usuario = new Usuario(bodyUsuario);

        //hashear el password
        const salt = await bcryptjs.genSalt(10);
        usuario.password = await bcryptjs.hash(password, salt);

        //guardar usuario
        await usuario.save();

        //mensaje de exito
        res.send('Usuario Creado Correctamente');
    } catch (error) {
        console.log(error);
        res.status(400).send('Hubo un error');
    }
};

exports.login = async (req, res) => {
    try {
        // revisamos los errores
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            return res.status(400).json({ msg: errores.array() });
        }

        const { email, password } = req.body;

        //Revisar usuario registrado
        
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(400).json({ msg: 'El Usuario no existe' });
        }
        
        //Revisar el password
        const passCorrect = await bcryptjs.compare(password, usuario.password);
        if (!passCorrect) {
            return res.status(400).json({ msg: 'Password incorrecto' });
        }
        // Si todo es correcto Crear y firmar JWT
        const payload = {
            usuario: {
                id: usuario.id,
                role: usuario.role,
            },
        };

        jwt.sign(
            payload,
            process.env.SECRETA,
            {
                expiresIn: 5400, //1 hora
            },
            (error, token) => {
                if (error) throw error;
                res.json({ token, name: usuario.name, role: usuario.role, id: usuario.id });
            }
        );
    } catch (error) {
        res.status(400).send('Hubo un error en la conexion a la base de datos');
    }
};

exports.obtenerUsuarioAutenticado = async (req, res) => {
    // Leer token
    const token = req.header('x-auth-token');
    // Revisar Token
    if (!token) {
        return res.status(401).json({ msg: 'No hay Token, permiso no valido' });
    }

    // Validar Token
    try {
        const cifrado = jwt.verify(token, process.env.SECRETA);
        const usuario = await Usuario.findById(cifrado.usuario.id).select(
            'name lastName birthday register role image email'
        );
        res.send(usuario);
    } catch (error) {
        res.status(401).json({ msg: 'Token no valido' });
    }
};

exports.modificarUsuarioTabla = async (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ msg: errores.array() });
    }
    try {
        const usuario = await Usuario.findById(req.params.id);
        // en esta linea estamos diciendo que el body del "input" este completo si o si-
        if (!req.body.role) {
            return res.status(400).send('Dato incompleto');
        }
        usuario.role = req.body.role;
        await usuario.save();
        res.send(usuario);
    } catch (error) {
        res.status(400).send('Hubo un error en la conexion a la base de datos');
    }
};
