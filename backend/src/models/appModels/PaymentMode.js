const mongoose = require('mongoose');

const paymentModeSchema = new mongoose.Schema(
  {
    removed: {
      type: Boolean,
      default: false,
    },

    enabled: {
      type: Boolean,
      default: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PaymentMode', paymentModeSchema);