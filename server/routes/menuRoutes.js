const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Menu = require('../models/menu');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const nombreUnico = Date.now() + path.extname(file.originalname);
    cb(null, nombreUnico);
  }
});

const upload = multer({ storage });


// Obtener todos los platillos
router.get('/', async (req, res) => {
  try {
    const menu = await Menu.find();
    res.json(menu);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el menú' });
  }
});

// Crear un platillo
router.post('/', upload.single('imagen'), async (req, res) => {
  try {
    const { nombre, precio, stock } = req.body;

    const nuevoPlatillo = new Menu({
      nombre,
      precio,
      stock,
      imagen: req.file ? `/uploads/${req.file.filename}` : ''
    });

    const guardado = await nuevoPlatillo.save();
    res.status(201).json(guardado);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear el platillo' });
  }
});

// Actualizar un platillo
router.put('/:id', upload.single('imagen'), async (req, res) => {
  try {
    const datosActualizados = {
      nombre: req.body.nombre,
      precio: req.body.precio,
      stock: req.body.stock
    };

    if (req.file) {
      datosActualizados.imagen = `/uploads/${req.file.filename}`;
    } else if (req.body.imagen) {
      datosActualizados.imagen = req.body.imagen;
    }

    const actualizado = await Menu.findByIdAndUpdate(
      req.params.id,
      datosActualizados,
      { new: true }
    );

    if (!actualizado) {
      return res.status(404).json({ mensaje: 'Platillo no encontrado' });
    }

    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el platillo' });
  }
});

// Eliminar un platillo
router.delete('/:id', async (req, res) => {
  try {
    const eliminado = await Menu.findByIdAndDelete(req.params.id);

    if (!eliminado) {
      return res.status(404).json({ mensaje: 'Platillo no encontrado' });
    }

    res.json({ mensaje: 'Platillo eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar el platillo' });
  }
});

module.exports = router;