const mongoose = require('mongoose');

const schema = new mongoose.Schema({
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
  },
  email: {
    type: String,
    required: true,
  },
  phone: String,
  company: String,
  source: {
    type: String,
    enum: ['website', 'referral', 'social_media', 'advertisement', 'other'],
    default: 'other',
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'],
    default: 'new',
  },
  followUps: [{
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['call', 'email', 'meeting', 'note'], default: 'note' },
    notes: String,
    outcome: String,
  }],
  nextActionDate: Date,
  notes: String,
  createdBy: { type: mongoose.Schema.ObjectId, ref: 'Admin' },
  assigned: { type: mongoose.Schema.ObjectId, ref: 'Admin' },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
});

schema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model('Lead', schema);