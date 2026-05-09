const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  enabled: {
    type: Boolean,
    default: false,
  },

  email: {
    type: String,
    lowercase: true,
    trim: true,
    required: true,
  },
  name: { type: String, required: true },
  surname: { type: String },
  photo: {
    type: String,
    trim: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'Admin',
    autopopulate: true,
  },
  modified: {
    type: Date,
  },
  modifiedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'Admin',
    autopopulate: true,
  },
  role: {
    type: String,
    default: 'sales',
    enum: ['owner', 'admin', 'sales'],
  },
});

module.exports = mongoose.model('Admin', adminSchema);
