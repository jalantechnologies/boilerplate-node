const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  account_id: String,
  basic: {
    first_name: String,
    last_name: String,
  },
  contact: {
    phone: String,
  },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

module.exports = mongoose.model('Profile', schema);
