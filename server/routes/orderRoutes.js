const express = require('express');
const router = express.Router();

const Order = require('../models/Order');
const Menu = require('../models/Menu');
const Table = require('../models/Table');

// Obtener todos los pedidos
router.get('/', async (req, res) => {
  try {
    const pedidos = await Order.find().sort({ createdAt: -1 });
    res.json(pedidos);
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: 'Error al obtener pedidos' });
  }
});

// Crear un pedido y descontar stock + ocupar mesa
router.post('/', async (req, res) => {
  try {
    const { customerEmail, customerName, mesa, items, total } = req.body;

    if (
      !customerEmail ||
      !customerName ||
      !mesa ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0 ||
      total === undefined
    ) {
      return res.status(400).json({ mensaje: 'Datos incompletos para crear el pedido' });
    }

    // 1) Validar mesa
    const mesaEncontrada = await Table.findOne({ numero: Number(mesa) });

    if (!mesaEncontrada) {
      return res.status(404).json({ mensaje: 'La mesa seleccionada no existe' });
    }

    if (mesaEncontrada.estado !== 'disponible') {
      return res.status(400).json({ mensaje: 'La mesa ya no está disponible' });
    }

    // 2) Validar stock de todos los productos
    for (const item of items) {
      const platillo = await Menu.findById(item._id);

      if (!platillo) {
        return res.status(404).json({
          mensaje: `El platillo "${item.name}" no existe`
        });
      }

      if (platillo.stock < item.qty) {
        return res.status(400).json({
          mensaje: `Stock insuficiente para "${platillo.nombre}". Disponible: ${platillo.stock}`
        });
      }
    }

    // 3) Descontar stock
    for (const item of items) {
      const platillo = await Menu.findById(item._id);
      platillo.stock = platillo.stock - item.qty;
      await platillo.save();
    }

    // 4) Cambiar mesa a ocupada
    mesaEncontrada.estado = 'ocupada';
    await mesaEncontrada.save();

    // 5) Crear pedido
    const nuevoPedido = new Order({
      customerEmail,
      customerName,
      mesa: Number(mesa),
      items,
      total,
      estado: 'pendiente',
      deliveredAt: null
    });

    const guardado = await nuevoPedido.save();
    res.status(201).json(guardado);
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: 'Error al crear el pedido' });
  }
});

// Obtener pedidos por número de mesa
router.get('/mesa/:mesa', async (req, res) => {
  try {
    const pedidos = await Order.find({ mesa: Number(req.params.mesa) }).sort({ createdAt: -1 });
    res.json(pedidos);
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: 'Error al obtener pedidos por mesa' });
  }
});

// Actualizar estado del pedido y liberar mesa si se entrega
router.put('/:id/estado', async (req, res) => {
  try {
    const { estado } = req.body;

    if (!['pendiente', 'en preparacion', 'entregado'].includes(estado)) {
      return res.status(400).json({ mensaje: 'Estado no válido' });
    }

    const pedido = await Order.findById(req.params.id);

    if (!pedido) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }

    pedido.estado = estado;

    if (estado === 'entregado') {
      if (!pedido.deliveredAt) {
        pedido.deliveredAt = new Date();
      }

      const mesaEncontrada = await Table.findOne({ numero: pedido.mesa });

      if (mesaEncontrada) {
        mesaEncontrada.estado = 'disponible';
        await mesaEncontrada.save();
      }
    } else {
      pedido.deliveredAt = null;
    }

    await pedido.save();

    res.json(pedido);
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: 'Error al actualizar estado del pedido' });
  }
});

module.exports = router;