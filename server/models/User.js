const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    rol: {
      type: String,
      enum: ['admin', 'mesero'],
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);