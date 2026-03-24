const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    customerName: {
      type: String,
      required: true,
      trim: true
    },
    mesa: {
      type: Number,
      required: true
    },
    items: [
      {
        _id: false,
        menuId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Menu'
        },
        name: {
          type: String,
          required: true
        },
        price: {
          type: Number,
          required: true
        },
        qty: {
          type: Number,
          required: true,
          min: 1
        }
      }
    ],
    total: {
      type: Number,
      required: true
    },
    estado: {
      type: String,
      enum: ['pendiente', 'en preparacion', 'entregado'],
      default: 'pendiente'
    },
    deliveredAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);