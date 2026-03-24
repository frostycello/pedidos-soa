const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Obtener todos los usuarios (admin y mesero)
router.get('/', async (req, res) => {
  try {
    const usuarios = await User.find().sort({ createdAt: -1 });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener usuarios' });
  }
});

// Crear usuario (solo admin o mesero)
router.post('/', async (req, res) => {
  try {
    const { nombre, email, rol } = req.body;

    if (!nombre || !email || !rol) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    }

    // Validar rol permitido
    if (!['admin', 'mesero'].includes(rol)) {
      return res.status(400).json({ mensaje: 'Rol no válido' });
    }

    const existe = await User.findOne({ email });
    if (existe) {
      return res.status(400).json({ mensaje: 'El usuario ya existe' });
    }

    const nuevoUsuario = new User({
      nombre,
      email,
      rol
    });

    const guardado = await nuevoUsuario.save();
    res.status(201).json(guardado);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear usuario' });
  }
});

// Buscar usuario por email (CLAVE para login)
router.get('/email/:email', async (req, res) => {
  try {
    const usuario = await User.findOne({ email: req.params.email });

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al buscar usuario' });
  }
});

// Actualizar rol de usuario
router.put('/:id', async (req, res) => {
  try {
    const { rol } = req.body;

    if (!['admin', 'mesero'].includes(rol)) {
      return res.status(400).json({ mensaje: 'Rol no válido' });
    }

    const usuarioActualizado = await User.findByIdAndUpdate(
      req.params.id,
      { rol },
      { new: true }
    );

    if (!usuarioActualizado) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.json(usuarioActualizado);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar rol' });
  }
});

module.exports = router;