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

// Crear un pedido y descontar stock + ocupar mesa si aplica
router.post('/', async (req, res) => {
  try {
    const { customerEmail, customerName, tipoPedido, mesa, items, total } = req.body;

    if (
      !customerEmail ||
      !customerName ||
      !tipoPedido ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0 ||
      total === undefined
    ) {
      return res.status(400).json({ mensaje: 'Datos incompletos para crear el pedido' });
    }

    if (!['mesa', 'llevar'].includes(tipoPedido)) {
      return res.status(400).json({ mensaje: 'Tipo de pedido no válido' });
    }

    let mesaEncontrada = null;

    // Validar mesa solo si el pedido es en mesa
    if (tipoPedido === 'mesa') {
      if (!mesa) {
        return res.status(400).json({ mensaje: 'Debes seleccionar una mesa' });
      }

      mesaEncontrada = await Table.findOne({ numero: Number(mesa) });

      if (!mesaEncontrada) {
        return res.status(404).json({ mensaje: 'La mesa seleccionada no existe' });
      }

      // Permitimos ordenar de nuevo sobre una mesa ya ocupada
      if (!['disponible', 'ocupada'].includes(mesaEncontrada.estado)) {
        return res.status(400).json({ mensaje: 'La mesa no está disponible para ordenar' });
      }
    }

    // Validar stock
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

    // Descontar stock
    for (const item of items) {
      const platillo = await Menu.findById(item._id);
      platillo.stock = platillo.stock - item.qty;
      await platillo.save();
    }

    // Cambiar mesa a ocupada si aplica
    if (tipoPedido === 'mesa' && mesaEncontrada) {
      mesaEncontrada.estado = 'ocupada';
      await mesaEncontrada.save();
    }

    // Crear pedido
    const nuevoPedido = new Order({
      customerEmail,
      customerName,
      tipoPedido,
      mesa: tipoPedido === 'mesa' ? Number(mesa) : null,
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

      if (pedido.tipoPedido === 'mesa' && pedido.mesa) {
        const mesaEncontrada = await Table.findOne({ numero: pedido.mesa });

        if (mesaEncontrada) {
          mesaEncontrada.estado = 'disponible';
          await mesaEncontrada.save();
        }
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