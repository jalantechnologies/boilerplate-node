const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  email: String,
  password: {
    hash: String,
    salt: String,
  },
  reset: {
    code: String,
    issued_at: Number,
    expires_at: Number,
  },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

module.exports = mongoose.model('Account', schema);
