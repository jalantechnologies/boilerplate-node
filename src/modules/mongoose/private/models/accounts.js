const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  email: String,
  password: {
    hash: String,
    salt: String,
  },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

module.exports = mongoose.model('Account', schema);