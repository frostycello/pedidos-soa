const express = require('express');
const router = express.Router();
const Table = require('../models/Table');

// Obtener todas las mesas
router.get('/', async (req, res) => {
  try {
    const mesas = await Table.find().sort({ numero: 1 });
    res.json(mesas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener mesas' });
  }
});

// Crear una mesa
router.post('/', async (req, res) => {
  try {
    const { numero, estado } = req.body;

    if (!numero) {
      return res.status(400).json({ mensaje: 'El número de mesa es obligatorio' });
    }

    const existe = await Table.findOne({ numero });
    if (existe) {
      return res.status(400).json({ mensaje: 'La mesa ya existe' });
    }

    const nuevaMesa = new Table({
      numero,
      estado: estado || 'disponible'
    });

    const guardada = await nuevaMesa.save();
    res.status(201).json(guardada);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear mesa' });
  }
});

// Actualizar estado de una mesa
router.put('/:id', async (req, res) => {
  try {
    const { estado } = req.body;

    if (!['disponible', 'reservada', 'ocupada'].includes(estado)) {
      return res.status(400).json({ mensaje: 'Estado de mesa no válido' });
    }

    const mesaActualizada = await Table.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true }
    );

    if (!mesaActualizada) {
      return res.status(404).json({ mensaje: 'Mesa no encontrada' });
    }

    res.json(mesaActualizada);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar estado de la mesa' });
  }
});

module.exports = router;