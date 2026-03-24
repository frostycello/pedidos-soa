const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema(
  {
    numero: {
      type: Number,
      required: true,
      unique: true
    },
    estado: {
      type: String,
      enum: ['disponible', 'reservada', 'ocupada'],
      default: 'disponible'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.Table || mongoose.model('Table', tableSchema);