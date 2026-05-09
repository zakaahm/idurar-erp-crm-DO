const mongoose = require('mongoose');

const taxesSchema = new mongoose.Schema(
  {
    removed: {
      type: Boolean,
      default: false,
    },

    enabled: {
      type: Boolean,
      default: true,
    },

    taxName: {
      type: String,
      required: true,
      trim: true,
    },

    taxValue: {
      type: Number,
      required: true,
      default: 0,
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

module.exports = mongoose.model('Taxes', taxesSchema);